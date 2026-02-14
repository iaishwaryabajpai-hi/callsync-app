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

        // Start timer when joined
        const startTime = Date.now();
        const timer = setInterval(() => {
            const elapsed = Math.floor((Date.now() - startTime) / 1000);
            const remaining = Math.max(0, durationLimit * 60 - elapsed);
            setTimeRemaining(remaining);

            if (remaining === 0) {
                clearInterval(timer);
                handleEndCall();
            }
        }, 1000);

        // Listen for hang up
        jitsiApiRef.current.addEventListener('readyToClose', () => {
            clearInterval(timer);
            handleEndCall();
        });

        return () => clearInterval(timer);
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
            <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
                    <div className="flex items-center justify-center mb-6">
                        <div className="bg-gradient-to-r from-purple-500 to-blue-500 p-3 rounded-full">
                            <Users className="w-8 h-8 text-white" />
                        </div>
                    </div>
                    <h1 className="text-2xl font-bold text-center mb-2 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                        Join Video Call
                    </h1>
                    <p className="text-gray-600 text-center mb-6">
                        Enter your name to join the session
                    </p>

                    <input
                        type="text"
                        value={joinName}
                        onChange={(e) => setJoinName(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleJoin()}
                        placeholder="Your Name"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none mb-4"
                        autoFocus
                    />

                    <button
                        onClick={handleJoin}
                        disabled={!joinName.trim()}
                        className="w-full bg-gradient-to-r from-purple-500 to-blue-500 text-white py-3 px-6 rounded-lg font-semibold hover:from-purple-600 hover:to-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
                    >
                        Join Call
                    </button>
                </div>
            </div>
        );
    }

    // Show video call interface
    return (
        <div className="min-h-screen bg-gray-900 flex flex-col">
            {/* Header with timer and invite link */}
            <div className="bg-gray-800 border-b border-gray-700 p-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <h1 className="text-white font-semibold text-lg">CallSync</h1>
                        {timeRemaining !== null && (
                            <TimerDisplay
                                timeRemaining={timeRemaining}
                                totalDuration={durationLimit * 60}
                            />
                        )}
                    </div>

                    {role === 'caller' && (
                        <button
                            onClick={copyLink}
                            className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
                        >
                            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            <span className="text-sm">{copied ? 'Copied!' : 'Copy Invite Link'}</span>
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
