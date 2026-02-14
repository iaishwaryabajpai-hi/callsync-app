# CallSync – Timed Video/Audio Calls

A full-stack web application for audio/video calls with **server-enforced session time limits**.

## 🏗 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + Tailwind CSS (v4) |
| Backend | Node.js + Express |
| Realtime | Socket.io |
| Calling | Agora Web SDK |
| Database | Supabase PostgreSQL |

## 🎯 Core Architecture

```
┌─────────────────────────────────────────────────┐
│  CLIENT (React + Agora SDK)                      │
│  ┌───────────┐  ┌──────────┐  ┌──────────────┐  │
│  │ VideoPanel│  │  Timer   │  │CallControls │  │
│  └─────┬─────┘  └────┬─────┘  └──────┬───────┘  │
│        │              │               │          │
│        │     Socket.io Events         │          │
│        │   (timer_tick, warning,      │          │
│        │    force_end_call)           │          │
└────────┼──────────────┼───────────────┼──────────┘
         │              │               │
    ┌────┴──────────────┴───────────────┴────┐
    │  SERVER (Express + Socket.io)          │
    │                                        │
    │  ┌─────────────────────────────────┐   │
    │  │  Timer Loop (every 1 second)    │   │
    │  │  - Check all active sessions    │   │
    │  │  - Emit timer_tick             │   │
    │  │  - At 120s → time_warning      │   │
    │  │  - At 0s  → force_end_call     │   │
    │  └─────────────────────────────────┘   │
    │                                        │
    │  In-Memory Map ←→ Supabase PostgreSQL  │
    └────────────────────────────────────────┘
```

## 📋 How It Works

1. **User A** creates a session with a time limit (default 30 min)
2. **User B** joins via the shared session link
3. Backend starts the **server-authoritative timer**
4. Server checks every second:
   - At **2 minutes remaining** → emits `time_warning`
   - At **0 seconds** → emits `force_end_call`
5. Clients **instantly leave** the Agora channel
6. **Expired sessions cannot be rejoined**

## 🚀 Quick Start

### 1. Database Setup (Supabase)

Run the SQL migration in your Supabase SQL Editor:

```sql
-- See server/supabase-migration.sql
```

### 2. Backend

```bash
cd server
cp .env.example .env
# Edit .env with your Supabase + Agora credentials
npm install
npm run dev
```

### 3. Frontend

```bash
cd client
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

### 4. Environment Variables

**Server (.env)**
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
AGORA_APP_ID=your-agora-app-id
AGORA_APP_CERTIFICATE=your-agora-certificate
PORT=3001
CLIENT_URL=http://localhost:5173
```

**Client (.env)**
```
VITE_SOCKET_URL=http://localhost:3001
VITE_API_URL=http://localhost:3001
```

## 🔑 Getting API Keys

### Agora
1. Sign up at [agora.io](https://www.agora.io/)
2. Create a project → copy App ID and App Certificate
3. Add to server `.env`

### Supabase
1. Create project at [supabase.com](https://supabase.com/)
2. Go to Settings → API → copy URL and `service_role` key
3. Run the SQL migration
4. Add to server `.env`

## 📁 Project Structure

```
call-session-app/
├── server/
│   ├── index.js              # Express + Socket.io server
│   ├── supabase-migration.sql # Database schema
│   ├── package.json
│   └── .env
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── TimerDisplay.jsx    # Circular countdown ring
│   │   │   ├── VideoPanel.jsx      # Agora video renderer
│   │   │   ├── CallControls.jsx    # Mute/Video/End buttons
│   │   │   └── WarningBanner.jsx   # 2-min warning popup
│   │   ├── hooks/
│   │   │   └── useCallSession.js   # Agora + Socket.io logic
│   │   ├── pages/
│   │   │   ├── HomePage.jsx        # Create/Join session
│   │   │   ├── CallPage.jsx        # Active call UI
│   │   │   └── CallEndedPage.jsx   # Post-call redirect
│   │   ├── services/
│   │   │   ├── socket.js           # Socket.io client
│   │   │   └── api.js              # REST API client
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css               # Design system + animations
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
└── README.md
```

## 🔌 Socket Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `join_session` | Client → Server | Join a call session |
| `session_state` | Server → Client | Initial state sync |
| `call_started` | Server → Client | Both users joined, timer starts |
| `timer_tick` | Server → Client | Every second with remaining time |
| `time_warning` | Server → Client | 2 minutes remaining |
| `force_end_call` | Server → Client | Time's up – leave now |
| `end_call` | Client → Server | Manual call end |
| `user_joined` | Server → Client | Other participant joined |
| `user_left` | Server → Client | Other participant left |

## 🎨 UI States

1. **Home** – Create session or join via ID
2. **Waiting** – Caller waits for callee with shareable link
3. **Join Screen** – Callee enters name before joining
4. **Active Call** – Timer + video + controls
5. **Warning** – Floating banner at 2 minutes
6. **Call Ended** – 3-second overlay then redirect
7. **Post-Call** – Session summary with "New Call" button
