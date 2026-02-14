require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");
const { createClient } = require("@supabase/supabase-js");

// ── Config ───────────────────────────────────────────────
const PORT = process.env.PORT || 3001;
const CLIENT_URL = process.env.CLIENT_URL || "*";

// ── Supabase ─────────────────────────────────────────────
let supabase = null;
try {
  if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY) {
    supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    );
  }
} catch (e) {
  console.warn("⚠️  Supabase init failed:", e.message);
}

// ── Express + Socket.io ──────────────────────────────────
const app = express();
app.use(cors({ origin: true, credentials: true })); // Allow all origins for LAN access
app.use(express.json());

// Serve React build (for public/tunnel access)
const path = require("path");
const clientBuildPath = path.join(__dirname, "..", "client", "dist");
app.use(express.static(clientBuildPath));

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: true, methods: ["GET", "POST"], credentials: true },
});

// ═══════════════════════════════════════════════════════════
// In-memory session store
// ═══════════════════════════════════════════════════════════
const activeSessions = new Map();

// ═══════════════════════════════════════════════════════════
//  REST API ROUTES
// ═══════════════════════════════════════════════════════════

// Dynamic TURN credentials endpoint
app.get("/api/turn-config", (_req, res) => {
  const iceServers = [];

  // Public STUN servers always useful
  iceServers.push({ urls: 'stun:stun.l.google.com:19302' });
  iceServers.push({ urls: 'stun:stun1.l.google.com:19302' });
  iceServers.push({ urls: 'stun:stun2.l.google.com:19302' });

  // Add the dynamic TURN server if configured
  if (process.env.TURN_URL) {
    const creds = {
      username: process.env.TURN_USERNAME || 'user',
      credential: process.env.TURN_PASSWORD || 'pass',
    };

    // Support multiple transport protocols for robustness
    iceServers.push({
      urls: `turn:${process.env.TURN_URL}?transport=udp`,
      ...creds
    });
    iceServers.push({
      urls: `turn:${process.env.TURN_URL}?transport=tcp`,
      ...creds
    });

    // Serveo TCP tunnel usually implies TCP transport only, but we list both
    // If it's pure TCP mapping, the UDP candidate might fail but TCP will succeed
  }

  res.json({ iceServers });
});

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", activeSessions: activeSessions.size });
});

// Create a new call session
app.post("/api/sessions", async (req, res) => {
  try {
    const { callerId, calleeId, durationLimit = 30 } = req.body;

    if (!callerId || !calleeId) {
      return res.status(400).json({ error: "callerId and calleeId required" });
    }

    const sessionId = uuidv4();
    const channelName = `call_${sessionId.replace(/-/g, "").slice(0, 16)}`;

    const sessionData = {
      id: sessionId,
      caller_id: callerId,
      callee_id: calleeId,
      channel_name: channelName,
      caller_uid: Math.floor(Math.random() * 100000),
      callee_uid: Math.floor(Math.random() * 100000) + 100000,
      duration_limit: durationLimit,
      start_time: null,
      status: "pending",
      warning_sent: false,
      created_at: new Date().toISOString(),
    };

    // Persist to Supabase
    if (supabase) {
      const { error: dbError } = await supabase
        .from("call_sessions")
        .insert([sessionData]);
      if (dbError) console.error("Supabase insert error:", dbError.message);
    }

    activeSessions.set(sessionId, { ...sessionData, connectedUsers: new Map() });

    res.json({
      sessionId,
      channelName,
      callerId,
      calleeId,
      durationLimit,
    });
  } catch (err) {
    console.error("Create session error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get session info
app.get("/api/sessions/:sessionId", async (req, res) => {
  const session = activeSessions.get(req.params.sessionId);
  if (!session) {
    return res.status(404).json({ error: "Session not found or expired" });
  }
  const remaining = getTimeRemaining(session);
  res.json({
    id: session.id,
    caller_id: session.caller_id,
    callee_id: session.callee_id,
    duration_limit: session.duration_limit,
    status: session.status,
    time_remaining: remaining,
    start_time: session.start_time,
  });
});

// ═══════════════════════════════════════════════════════════
//  SOCKET.IO – Real-time signalling + WebRTC
// ═══════════════════════════════════════════════════════════
io.on("connection", (socket) => {
  console.log(`🔌 Connected: ${socket.id}`);

  // ── Join a call session ────────────────────────────────
  socket.on("join_session", ({ sessionId, userId }) => {
    const session = activeSessions.get(sessionId);
    if (!session) {
      socket.emit("error_event", { message: "Session not found" });
      return;
    }

    if (session.status === "ended" || session.status === "expired") {
      socket.emit("error_event", { message: "Session has expired. Cannot rejoin." });
      return;
    }

    socket.join(sessionId);
    socket.data.sessionId = sessionId;
    socket.data.userId = userId;

    // Track connected users with their socket IDs
    session.connectedUsers.set(userId, socket.id);

    console.log(`👤 ${userId} joined session ${sessionId} (${session.connectedUsers.size} users)`);

    // Notify others
    socket.to(sessionId).emit("user_joined", { userId, socketId: socket.id });

    // When both participants are in, start the timer
    if (session.connectedUsers.size >= 2 && !session.start_time) {
      session.start_time = new Date().toISOString();
      session.status = "active";

      if (supabase) {
        supabase
          .from("call_sessions")
          .update({ start_time: session.start_time, status: "active" })
          .eq("id", sessionId)
          .then(() => { });
      }

      io.to(sessionId).emit("call_started", {
        startTime: session.start_time,
        durationLimit: session.duration_limit,
        timeRemaining: session.duration_limit * 60,
      });

      console.log(`🟢 Call started: session ${sessionId}`);
    } else {
      // Send current state to joiner
      const remaining = getTimeRemaining(session);
      socket.emit("session_state", {
        status: session.status,
        startTime: session.start_time,
        durationLimit: session.duration_limit,
        timeRemaining: remaining,
        participants: Array.from(session.connectedUsers.keys()),
      });
    }
  });

  // ── WebRTC Signaling ───────────────────────────────────
  socket.on("webrtc_offer", ({ sessionId, offer }) => {
    console.log(`📡 WebRTC offer from ${socket.data.userId}`);
    socket.to(sessionId).emit("webrtc_offer", {
      offer,
      from: socket.data.userId,
      fromSocketId: socket.id,
    });
  });

  socket.on("webrtc_answer", ({ sessionId, answer }) => {
    console.log(`📡 WebRTC answer from ${socket.data.userId}`);
    socket.to(sessionId).emit("webrtc_answer", {
      answer,
      from: socket.data.userId,
    });
  });

  socket.on("webrtc_ice_candidate", ({ sessionId, candidate }) => {
    socket.to(sessionId).emit("webrtc_ice_candidate", {
      candidate,
      from: socket.data.userId,
    });
  });

  // ── Manual end call ────────────────────────────────────
  socket.on("end_call", ({ sessionId }) => {
    endSession(sessionId, "manual");
  });

  // ── Disconnect ─────────────────────────────────────────
  socket.on("disconnect", () => {
    const { sessionId, userId } = socket.data;
    if (sessionId) {
      const session = activeSessions.get(sessionId);
      if (session && session.connectedUsers) {
        session.connectedUsers.delete(userId);
        io.to(sessionId).emit("user_left", { userId });

        if (session.connectedUsers.size === 0 && session.status === "active") {
          endSession(sessionId, "all_left");
        }
      }
    }
    console.log(`🔴 Disconnected: ${socket.id}`);
  });
});

// ═══════════════════════════════════════════════════════════
//  SERVER-AUTHORITATIVE TIMER LOOP (every second)
// ═══════════════════════════════════════════════════════════
setInterval(() => {
  for (const [sessionId, session] of activeSessions.entries()) {
    if (session.status !== "active" && session.status !== "warning") continue;
    if (!session.start_time) continue;

    const remaining = getTimeRemaining(session);

    // Broadcast tick
    io.to(sessionId).emit("timer_tick", {
      timeRemaining: remaining,
      status: session.status,
    });

    // 2-minute warning
    if (remaining <= 120 && !session.warning_sent) {
      session.warning_sent = true;
      session.status = "warning";

      io.to(sessionId).emit("time_warning", {
        message: "⚠️ Call ending in 2 minutes!",
        timeRemaining: remaining,
      });

      if (supabase) {
        supabase
          .from("call_sessions")
          .update({ status: "warning", warning_sent: true })
          .eq("id", sessionId)
          .then(() => { });
      }

      console.log(`⚠️  Warning: session ${sessionId}`);
    }

    // Time's up
    if (remaining <= 0) {
      endSession(sessionId, "timeout");
    }
  }
}, 1000);

// ═══════════════════════════════════════════════════════════
//  HELPERS
// ═══════════════════════════════════════════════════════════
function getTimeRemaining(session) {
  if (!session.start_time) return session.duration_limit * 60;
  const elapsed = (Date.now() - new Date(session.start_time).getTime()) / 1000;
  return Math.max(0, Math.floor(session.duration_limit * 60 - elapsed));
}

async function endSession(sessionId, reason) {
  const session = activeSessions.get(sessionId);
  if (!session || session.status === "ended" || session.status === "expired") return;

  const finalStatus = reason === "timeout" ? "expired" : "ended";
  session.status = finalStatus;

  io.to(sessionId).emit("force_end_call", {
    reason,
    message:
      reason === "timeout"
        ? "⏰ Session time limit reached. Call ended."
        : reason === "all_left"
          ? "All participants left. Call ended."
          : "Call ended by participant.",
  });

  if (supabase) {
    await supabase
      .from("call_sessions")
      .update({ status: finalStatus, ended_at: new Date().toISOString() })
      .eq("id", sessionId);
  }

  setTimeout(() => {
    activeSessions.delete(sessionId);
  }, 5000);

  console.log(`🔴 Session ${sessionId} ended – reason: ${reason}`);
}

// ═══════════════════════════════════════════════════════════
//  SPA catch-all (serve React app for non-API routes)
// ═══════════════════════════════════════════════════════════
const fs = require("fs");
const indexPath = path.join(clientBuildPath, "index.html");
app.get("*", (req, res) => {
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(200).json({ message: "CallSync API running. Build the client first: cd client && npm run build" });
  }
});

// ═══════════════════════════════════════════════════════════
//  START – listen on all interfaces (0.0.0.0)
// ═══════════════════════════════════════════════════════════
server.listen(PORT, "0.0.0.0", () => {
  const os = require("os");
  const nets = os.networkInterfaces();
  let lanIP = "localhost";
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === "IPv4" && !net.internal) {
        lanIP = net.address;
        break;
      }
    }
  }

  console.log(`\n🚀 Call-session server listening on port ${PORT}`);
  console.log(`   Local:   http://localhost:${PORT}`);
  console.log(`   Network: http://${lanIP}:${PORT}`);
  console.log(`   Supabase: ${supabase ? "✅ configured" : "⚠️  not configured"}\n`);
});
