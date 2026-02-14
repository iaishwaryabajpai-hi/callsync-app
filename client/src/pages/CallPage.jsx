import { useEffect, useState, useRef } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import AgoraRTC from 'agora-rtc-sdk-ng';
import TimerDisplay from '../components/TimerDisplay';
import { Copy, Check, Users, Mic, MicOff, Video, VideoOff, PhoneOff } from 'lucide-react';

const APP_ID = '2a22e85308a347fab89fae0ef6f52b3e'; // Your Agora App ID

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

    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [isConnected, setIsConnected] = useState(false);

    const clientRef = useRef(null);
    const localVideoTrackRef = useRef(null);
    const localAudioTrackRef = useRef(null);
    const remoteUsersRef = useRef(new Map());

    // Load stored session
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
                if (!response.ok) throw new Error('Session not found');

                const session = await response.json();

                if (session.start_time) {
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
                // Fallback to local timer
                setTimeRemaining(durationLimit * 60);
            }
        };

        fetchSessionData();
    }, [hasJoined, sessionId, durationLimit]);

    // Initialize Agora
    useEffect(() => {
        if (!hasJoined || !userId) return;

        const initAgora = async () => {
            try {
                // Create Agora client
                clientRef.current = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });

                // Handle remote users
                clientRef.current.on('user-published', async (user, mediaType) => {
                    await clientRef.current.subscribe(user, mediaType);

                    if (mediaType === 'video') {
                        const remoteVideoTrack = user.videoTrack;
                        const playerContainer = document.getElementById('remote-player');
                        if (playerContainer) {
                            remoteVideoTrack.play(playerContainer);
                        }
                    }
                    if (mediaType === 'audio') {
                        user.audioTrack.play();
                    }

                    remoteUsersRef.current.set(user.uid, user);
                    setIsConnected(true);
                });

                clientRef.current.on('user-unpublished', (user) => {
                    remoteUsersRef.current.delete(user.uid);
                    if (remoteUsersRef.current.size === 0) {
                        setIsConnected(false);
                    }
                });

                // Join channel
                await clientRef.current.join(APP_ID, sessionId, null, userId);

                // Create and publish local tracks
                localAudioTrackRef.current = await AgoraRTC.createMicrophoneAudioTrack();
                localVideoTrackRef.current = await AgoraRTC.createCameraVideoTrack();

                await clientRef.current.publish([localAudioTrackRef.current, localVideoTrackRef.current]);

                // Play local video
                const localPlayerContainer = document.getElementById('local-player');
                if (localPlayerContainer) {
                    localVideoTrackRef.current.play(localPlayerContainer);
                }

            } catch (error) {
                console.error('Agora initialization error:', error);
            }
        };

        initAgora();

        return () => {
            if (localVideoTrackRef.current) {
                localVideoTrackRef.current.close();
            }
            if (localAudioTrackRef.current) {
                localAudioTrackRef.current.close();
            }
            if (clientRef.current) {
                clientRef.current.leave();
            }
        };
    }, [hasJoined, userId, sessionId]);

    const toggleMute = () => {
        if (localAudioTrackRef.current) {
            localAudioTrackRef.current.setEnabled(isMuted);
            setIsMuted(!isMuted);
        }
    };

    const toggleVideo = () => {
        if (localVideoTrackRef.current) {
            localVideoTrackRef.current.setEnabled(isVideoOff);
            setIsVideoOff(!isVideoOff);
        }
    };

    const handleEndCall = async () => {
        if (localVideoTrackRef.current) localVideoTrackRef.current.close();
        if (localAudioTrackRef.current) localAudioTrackRef.current.close();
        if (clientRef.current) await clientRef.current.leave();

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

    // Join screen
    if (!hasJoined) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center p-4 relative overflow-hidden">
                <div className="absolute inset-0 opacity-5">
                    <div className="absolute inset-0" style={{
                        backgroundImage: `linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`,
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

    // Call interface
    return (
        <div className="min-h-screen bg-black flex flex-col">
            {/* Header */}
            <div className="bg-black border-b border-white/10 backdrop-blur-xl px-6 py-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
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

                    {role === 'caller' && (
                        <button
                            onClick={copyLink}
                            className="flex items-center space-x-2 border border-white/20 bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded-lg transition-all"
                        >
                            {copied ? <Check className="w-4 h-4" strokeWidth={2} /> : <Copy className="w-4 h-4" strokeWidth={2} />}
                            <span className="text-sm font-mono tracking-wider">{copied ? 'COPIED' : 'INVITE'}</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Video Grid */}
            <div className="flex-1 relative bg-black p-4">
                <div className="h-full flex items-center justify-center gap-4">
                    {/* Remote Video */}
                    <div className="flex-1 h-full max-w-2xl bg-gray-900 rounded-xl overflow-hidden relative border border-white/10">
                        <div id="remote-player" className="w-full h-full" />
                        {!isConnected && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/80">
                                <p className="text-white/40 font-mono text-sm">Waiting for participant...</p>
                            </div>
                        )}
                    </div>

                    {/* Local Video (small) */}
                    <div className="absolute bottom-20 right-8 w-64 h-48 bg-gray-900 rounded-xl overflow-hidden border-2 border-white/20">
                        <div id="local-player" className="w-full h-full" />
                        {isVideoOff && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black">
                                <VideoOff className="w-12 h-12 text-white/40" />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center space-x-4">
                <button
                    onClick={toggleMute}
                    className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${isMuted ? 'bg-red-500 hover:bg-red-600' : 'bg-white/10 hover:bg-white/20'
                        } border border-white/20`}
                >
                    {isMuted ? <MicOff className="w-5 h-5 text-white" /> : <Mic className="w-5 h-5 text-white" />}
                </button>

                <button
                    onClick={toggleVideo}
                    className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${isVideoOff ? 'bg-red-500 hover:bg-red-600' : 'bg-white/10 hover:bg-white/20'
                        } border border-white/20`}
                >
                    {isVideoOff ? <VideoOff className="w-5 h-5 text-white" /> : <Video className="w-5 h-5 text-white" />}
                </button>

                <button
                    onClick={handleEndCall}
                    className="w-14 h-14 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition-all border border-red-400"
                >
                    <PhoneOff className="w-5 h-5 text-white" />
                </button>
            </div>
        </div>
    );
}
