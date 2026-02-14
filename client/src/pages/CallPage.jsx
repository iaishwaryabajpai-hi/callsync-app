import { useEffect, useState, useRef } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import TimerDisplay from '../components/TimerDisplay';
import { Copy, Check, Users } from 'lucide-react';

export default function CallPage() {
    const { sessionId } = useParams();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const role = searchParams.get('role') || 'callee';

    const [userId, setUserId] = useState('');
    const [copied, setCopied] = useState(false);
    const [joinName, setJoinName] = useState('');
    const [hasJoined, setHasJoined] = useState(false);
    const [timeRemaining, setTimeRemaining] = useState(null);
    const [durationLimit, setDurationLimit] = useState(30);

    const jitsiContainerRef = useRef(null);
    const jitsiApiRef = useRef(null);

    // Load stored session (caller auto-joins)
    useEffect(() => {
        const stored = sessionStorage.getItem(`session_${sessionId}`);
        if (stored) {
            const data = JSON.parse(stored);
            setUserId(data.callerId || `user_${Math.random().toString(36).slice(2, 8)}`);
            setDurationLimit(data.durationLimit || 30);
            if (role === 'caller') setHasJoined(true);
        }
    }, [sessionId, role]);

    // Fetch session data and sync timer
    useEffect(() => {
        if (!hasJoined || !sessionId) return;

        const fetchSessionData = async () => {
            try {
                const response = await fetch(`/api/sessions/${sessionId}`);
                const session = await response.json();

                if (session.start_time) {
                    // Start synchronized timer based on server's start_time
                    const startTimer = () => {
                        const startTime = new Date(session.start_time).getTime();
                        const updateTimer = () => {
                            const now = Date.now();
                            const elapsed = Math.floor((now - startTime) / 1000);
                            const remaining = Math.max(0, session.duration_limit * 60 - elapsed);
                            setTimeRemaining(remaining);

                            if (remaining === 0) {
                                handleEndCall();
                            }
                        };

                        updateTimer();
                        const interval = setInterval(updateTimer, 1000);
                        return interval;
                    };

                    const timerInterval = startTimer();
                    return () => clearInterval(timerInterval);
                }
            } catch (error) {
                console.error('Failed to fetch session data:', error);
            }
        };

        fetchSessionData();
    }, [hasJoined, sessionId]);

    // Initialize Jitsi Meet
    useEffect(() => {
        if (!hasJoined || !userId) return;

        // Load Jitsi Meet API
        const script = document.createElement('script');
        script.src = 'https://meet.jit.si/external_api.js';
        script.async = true;
        script.onload = () => initializeJitsi();
        document.body.appendChild(script);

        return () => {
            if (jitsiApiRef.current) {
                jitsiApiRef.current.dispose();
            }
            document.body.removeChild(script);
        };
    }, [hasJoined, userId, sessionId]);

    const initializeJitsi = () => {
        if (!window.JitsiMeetExternalAPI) return;

        const options = {
            roomName: `CallSync_${sessionId}`,
            width: '100%',
            height: '100%',
            parentNode: jitsiContainerRef.current,
            userInfo: {
                displayName: userId
            },
            configOverwrite: {
                startWithAudioMuted: false,
                startWithVideoMuted: false,
                prejoinPageEnabled: false,
            },
            interfaceConfigOverwrite: {
                TOOLBAR_BUTTONS: [
                    'microphone', 'camera', 'desktop', 'fullscreen',
                    'hangup', 'chat', 'raisehand', 'tileview'
                ],
                SHOW_JITSI_WATERMARK: false,
                SHOW_WATERMARK_FOR_GUESTS: false,
            }
        };

        jitsiApiRef.current = new window.JitsiMeetExternalAPI('meet.jit.si', options);

        // Listen for hang up
        jitsiApiRef.current.addEventListener('readyToClose', () => {
            handleEndCall();
        });
    };

    const handleEndCall = () => {
        if (jitsiApiRef.current) {
            jitsiApiRef.current.dispose();
        }
        navigate(`/call-ended?reason=completed`);
    };

    const handleJoin = () => {
        if (!joinName.trim()) return;
        setUserId(joinName);
        setHasJoined(true);
    };

    const copyLink = () => {
        const link = `${window.location.origin}/call/${sessionId}?role=callee`;
        navigator.clipboard.writeText(link);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Show join form for callee
    if (!hasJoined) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center p-4 relative overflow-hidden">
                {/* Grid background */}
                <div className="absolute inset-0 opacity-5">
                    <div className="absolute inset-0" style={{
                        backgroundImage: `
                            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
                        `,
                        backgroundSize: '50px 50px'
                    }} />
                </div>

                <div className="relative z-10 w-full max-w-md">
                    <div className="border border-white/10 bg-white/5 backdrop-blur-xl rounded-2xl p-8">
                        <div className="flex items-center justify-center mb-6">
                            <div className="w-16 h-16 border border-white/20 rounded-full flex items-center justify-center">
                                <Users className="w-7 h-7 text-white" strokeWidth={1.5} />
                            </div>
                        </div>

                        <h1 className="text-2xl font-thin text-center mb-1 tracking-widest uppercase">
                            Join <span className="font-bold">Session</span>
                        </h1>
                        <p className="text-white/40 text-center mb-8 text-sm font-mono tracking-wider">
                            ENTER YOUR NAME TO CONTINUE
                        </p>

                        <input
                            type="text"
                            value={joinName}
                            onChange={(e) => setJoinName(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleJoin()}
                            placeholder="Your Display Name"
                            className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/20 focus:border-white/40 focus:outline-none transition-all mb-6 font-mono"
                            autoFocus
                        />

                        <button
                            onClick={handleJoin}
                            disabled={!joinName.trim()}
                            className="w-full bg-white text-black py-3 rounded-lg font-mono font-bold tracking-widest uppercase text-sm hover:bg-white/90 disabled:bg-white/10 disabled:text-white/20 disabled:cursor-not-allowed transition-all"
                        >
                            Join Call
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Show video call interface
    return (
        <div className="min-h-screen bg-black flex flex-col">
            {/* Minimal futuristic header */}
            <div className="bg-black border-b border-white/10 backdrop-blur-xl px-6 py-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    {/* Logo and Timer */}
                    <div className="flex items-center space-x-8">
                        <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                            <h1 className="text-white font-thin tracking-widest text-lg uppercase">
                                Call<span className="font-bold">Sync</span>
                            </h1>
                        </div>

                        {timeRemaining !== null && (
                            <TimerDisplay
                                timeRemaining={timeRemaining}
                                totalDuration={durationLimit * 60}
                            />
                        )}
                    </div>

                    {/* Invite Link Button */}
                    {role === 'caller' && (
                        <button
                            onClick={copyLink}
                            className="flex items-center space-x-2 border border-white/20 bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded-lg transition-all group"
                        >
                            {copied ? (
                                <Check className="w-4 h-4" strokeWidth={2} />
                            ) : (
                                <Copy className="w-4 h-4" strokeWidth={2} />
                            )}
                            <span className="text-sm font-mono tracking-wider">
                                {copied ? 'COPIED' : 'INVITE'}
                            </span>
                        </button>
                    )}
                </div>
            </div>

            {/* Jitsi Meet Container */}
            <div className="flex-1 relative">
                <div ref={jitsiContainerRef} className="absolute inset-0" />
            </div>
        </div>
    );
}
