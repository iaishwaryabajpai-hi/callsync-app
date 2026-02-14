import { useState, useEffect, useRef } from 'react';
import { connectSocket, disconnectSocket } from '../services/socket';
import { getTurnConfig } from '../services/api';

// Default config (STUN only) used while fetching dynamic config
const DEFAULT_ICE_CONFIG = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
    ],
    iceCandidatePoolSize: 10,
};

export function useCallSession(sessionId, userId) {
    const [status, setStatus] = useState('connecting');
    const [timeRemaining, setTimeRemaining] = useState(null);
    const [durationLimit, setDurationLimit] = useState(30);
    const [warningMessage, setWarningMessage] = useState('');
    const [endReason, setEndReason] = useState('');
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [localStream, setLocalStream] = useState(null);
    const [remoteStream, setRemoteStream] = useState(null);
    const [participants, setParticipants] = useState([]);

    // Config state
    const [turnConfig, setTurnConfig] = useState(null);

    // Refs
    const socketRef = useRef(null);
    const pcRef = useRef(null);
    const localStreamRef = useRef(null);
    const pendingIceCandidates = useRef([]);
    const isSettingUp = useRef(false);

    // ── 1. Fetch Dynamic TURN Config on Mount ────────────────
    useEffect(() => {
        let mounted = true;
        async function fetchConfig() {
            try {
                console.log('🔄 Fetching dynamic TURN config...');
                const config = await getTurnConfig();
                if (mounted) {
                    // Start with defaults + fetched servers
                    const merged = {
                        ...DEFAULT_ICE_CONFIG,
                        iceServers: [
                            ...DEFAULT_ICE_CONFIG.iceServers,
                            ...(config.iceServers || [])
                        ]
                    };
                    console.log('✅ Loaded ICE Config:', merged.iceServers.length, 'servers');
                    setTurnConfig(merged);
                }
            } catch (err) {
                console.warn('Using default STUN config (fetch failed):', err);
                if (mounted) setTurnConfig(DEFAULT_ICE_CONFIG);
            }
        }
        fetchConfig();
        return () => { mounted = false; };
    }, []);

    // ═════════════════════════════════════════════════════════
    //  MAIN EFFECT (Runs once config is loaded)
    // ═════════════════════════════════════════════════════════
    useEffect(() => {
        if (!sessionId || !userId || !turnConfig) return;

        let mounted = true;

        // ── Helper: get camera + mic ──────────────────────────
        async function getLocalMedia() {
            if (localStreamRef.current) return localStreamRef.current;
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
                    audio: true,
                });
                if (!mounted) { stream.getTracks().forEach(t => t.stop()); return null; }
                localStreamRef.current = stream;
                setLocalStream(stream);
                return stream;
            } catch (err) {
                console.warn('Camera failed, trying audio-only:', err.message);
                try {
                    const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
                    if (!mounted) { stream.getTracks().forEach(t => t.stop()); return null; }
                    localStreamRef.current = stream;
                    setLocalStream(stream);
                    return stream;
                } catch (err2) {
                    console.error('No media at all:', err2.message);
                    return null;
                }
            }
        }

        // ── Helper: create RTCPeerConnection ──────────────────
        function setupPeerConnection(stream) {
            if (pcRef.current) pcRef.current.close();

            console.log('🔧 Creating PeerConnection with loaded config');
            const pc = new RTCPeerConnection(turnConfig);
            pcRef.current = pc;

            if (stream) {
                stream.getTracks().forEach(track => pc.addTrack(track, stream));
            }

            pc.ontrack = (event) => {
                console.log('📹 REMOTE TRACK received');
                setRemoteStream(event.streams[0] || new MediaStream([event.track]));
            };

            pc.onicecandidate = (event) => {
                if (event.candidate) {
                    socketRef.current?.emit('webrtc_ice_candidate', {
                        sessionId,
                        candidate: event.candidate.toJSON(),
                    });
                }
            };

            pc.oniceconnectionstatechange = () => {
                const state = pc.iceConnectionState;
                console.log('🧊 ICE Connection State:', state);
                if (state === 'failed') pc.restartIce();
            };

            return pc;
        }

        async function flushCandidates(pc) {
            const cands = pendingIceCandidates.current;
            pendingIceCandidates.current = [];
            for (const c of cands) {
                try { await pc.addIceCandidate(new RTCIceCandidate(c)); } catch (e) { }
            }
        }

        // ═════════════════════════════════════════════════════
        //  Socket.io Setup
        // ═════════════════════════════════════════════════════
        const socket = connectSocket();
        socketRef.current = socket;

        socket.emit('join_session', { sessionId, userId });
        setStatus('waiting');

        socket.on('session_state', (data) => {
            if (data.timeRemaining != null) setTimeRemaining(data.timeRemaining);
            if (data.durationLimit) setDurationLimit(data.durationLimit);
            if (data.participants) setParticipants(data.participants);
            if (data.status === 'active') setStatus('active');
        });

        socket.on('call_started', (data) => {
            console.log('🟢 Call started');
            setStatus('active');
            setTimeRemaining(data.timeRemaining);
            setDurationLimit(data.durationLimit);
        });

        // ─── OFFERER ───
        socket.on('user_joined', async ({ userId: joinedUser }) => {
            console.log(`👤 ${joinedUser} joined — I am OFFERER`);
            setParticipants(prev => [...new Set([...prev, joinedUser])]);

            if (isSettingUp.current) return;
            isSettingUp.current = true;

            try {
                const stream = await getLocalMedia();
                if (!stream || !mounted) return;

                const pc = setupPeerConnection(stream);
                await new Promise(r => setTimeout(r, 1000)); // wait for answerer

                const offer = await pc.createOffer();
                await pc.setLocalDescription(offer);
                console.log('📤 Sending OFFER');

                socket.emit('webrtc_offer', { sessionId, offer: pc.localDescription.toJSON() });
            } catch (err) {
                isSettingUp.current = false;
            }
        });

        // ─── ANSWERER ───
        socket.on('webrtc_offer', async (data) => {
            console.log('📥 Received OFFER');
            try {
                const stream = await getLocalMedia();
                if (!stream || !mounted) return;

                const pc = setupPeerConnection(stream);
                await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
                await flushCandidates(pc);

                const answer = await pc.createAnswer();
                await pc.setLocalDescription(answer);
                console.log('📤 Sending ANSWER');

                socket.emit('webrtc_answer', { sessionId, answer: pc.localDescription.toJSON() });
            } catch (err) { console.error(err); }
        });

        socket.on('webrtc_answer', async (data) => {
            console.log('📥 Received ANSWER');
            const pc = pcRef.current;
            if (pc && pc.signalingState === 'have-local-offer') {
                await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
                await flushCandidates(pc);
            }
        });

        socket.on('webrtc_ice_candidate', async (data) => {
            if (!data.candidate) return;
            const pc = pcRef.current;
            if (!pc || !pc.remoteDescription) {
                pendingIceCandidates.current.push(data.candidate);
            } else {
                try { await pc.addIceCandidate(new RTCIceCandidate(data.candidate)); } catch (e) { }
            }
        });

        // Timer/Session events...
        socket.on('timer_tick', (d) => {
            setTimeRemaining(d.timeRemaining);
            if (d.status === 'warning') setStatus('warning');
        });
        socket.on('time_warning', (d) => { setStatus('warning'); setWarningMessage(d.message); });
        socket.on('force_end_call', (d) => { setStatus('ended'); setEndReason(d.message); });
        socket.on('user_left', ({ userId: u }) => setParticipants(p => p.filter(x => x !== u)));
        socket.on('error_event', (d) => { setStatus('ended'); setEndReason(d.message); });

        return () => {
            mounted = false;
            isSettingUp.current = false;
            socket.off('session_state'); socket.off('call_started'); socket.off('user_joined');
            socket.off('webrtc_offer'); socket.off('webrtc_answer'); socket.off('webrtc_ice_candidate');
            socket.off('timer_tick'); socket.off('time_warning'); socket.off('force_end_call');
            socket.off('user_left'); socket.off('error_event');

            if (pcRef.current) { pcRef.current.close(); pcRef.current = null; }
            if (localStreamRef.current) { localStreamRef.current.getTracks().forEach(t => t.stop()); localStreamRef.current = null; }
            setLocalStream(null); setRemoteStream(null);
            disconnectSocket();
        };
    }, [sessionId, userId, turnConfig]); // Re-run if config changes (unlikely)

    // Controls...
    const toggleMute = () => {
        if (localStreamRef.current) {
            const t = localStreamRef.current.getAudioTracks()[0];
            if (t) { t.enabled = !t.enabled; setIsMuted(!t.enabled); }
        }
    };
    const toggleVideo = () => {
        if (localStreamRef.current) {
            const t = localStreamRef.current.getVideoTracks()[0];
            if (t) { t.enabled = !t.enabled; setIsVideoOff(!t.enabled); }
        }
    };
    const endCall = () => {
        socketRef.current?.emit('end_call', { sessionId });
        setStatus('ended'); setEndReason('Call ended manually.');
    };

    return {
        status, timeRemaining, durationLimit, warningMessage, endReason,
        isMuted, isVideoOff, localStream, remoteStream, participants,
        toggleMute, toggleVideo, endCall
    };
}
