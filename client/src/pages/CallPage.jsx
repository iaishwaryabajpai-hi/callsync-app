import { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useCallSession } from '../hooks/useCallSession';
import TimerDisplay from '../components/TimerDisplay';
import VideoPanel from '../components/VideoPanel';
import CallControls from '../components/CallControls';
import WarningBanner from '../components/WarningBanner';
import { Loader2, Copy, Check, PhoneIncoming, Phone, PhoneOff, Users } from 'lucide-react';

export default function CallPage() {
    const { sessionId } = useParams();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const role = searchParams.get('role') || 'callee';

    const [userId, setUserId] = useState('');
    const [copied, setCopied] = useState(false);
    const [joinName, setJoinName] = useState('');
    const [hasJoined, setHasJoined] = useState(false);

    // Load stored session (caller auto-joins)
    useEffect(() => {
        const stored = sessionStorage.getItem(`session_${sessionId}`);
        if (stored) {
            const data = JSON.parse(stored);
            setUserId(data.callerId || `user_${Math.random().toString(36).slice(2, 8)}`);
            if (role === 'caller') setHasJoined(true);
        }
    }, [sessionId, role]);

    // Hook into call session – only active after user has joined
    const {
        status,
        timeRemaining,
        durationLimit,
        warningMessage,
        endReason,
        isMuted,
        isVideoOff,
        localStream,
        remoteStream,
        toggleMute,
        toggleVideo,
        endCall,
    } = useCallSession(
        hasJoined ? sessionId : null,
        hasJoined ? userId : null
    );

    // Auto-redirect when call ends
    useEffect(() => {
        if (status === 'ended') {
            const timer = setTimeout(() => {
                navigate('/call-ended', {
                    state: { reason: endReason, sessionId },
                });
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [status, endReason, navigate, sessionId]);

    const handleCopyLink = () => {
        const link = `${window.location.origin}/call/${sessionId}?role=callee`;
        navigator.clipboard.writeText(link);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleCalleeJoin = () => {
        const name = joinName.trim() || `user_${Math.random().toString(36).slice(2, 8)}`;
        setUserId(name);
        setHasJoined(true);
    };

    // ── Callee join screen ───────────────────────────────
    if (role === 'callee' && !hasJoined) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4">
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-primary-600/10 rounded-full blur-[120px]" />
                </div>

                <div className="glass rounded-3xl p-8 max-w-md w-full animate-slide-up relative z-10">
                    <div className="text-center mb-8">
                        <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                            <PhoneIncoming size={32} className="text-emerald-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">Incoming Call</h2>
                        <p className="text-sm text-white/40">
                            You've been invited to join a timed call session
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-medium text-white/50 mb-2 uppercase tracking-wider">
                                Your Name / User ID
                            </label>
                            <input
                                type="text"
                                value={joinName}
                                onChange={(e) => setJoinName(e.target.value)}
                                placeholder="Enter your name"
                                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/20 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all text-sm"
                                onKeyDown={(e) => e.key === 'Enter' && handleCalleeJoin()}
                            />
                        </div>

                        <div className="px-4 py-3 rounded-xl bg-white/5 border border-white/5">
                            <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Session ID</p>
                            <p className="text-xs font-mono text-primary-300">{sessionId}</p>
                        </div>

                        <button
                            onClick={handleCalleeJoin}
                            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-all active:scale-[0.98] cursor-pointer"
                        >
                            <Phone size={18} />
                            Join Call
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ── Ended overlay ────────────────────────────────────
    if (status === 'ended') {
        return (
            <div className="min-h-screen flex items-center justify-center px-4">
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-danger-500/8 rounded-full blur-[120px]" />
                </div>

                <div className="glass rounded-3xl p-10 max-w-md w-full text-center animate-slide-up relative z-10">
                    <div className="w-20 h-20 rounded-full bg-danger-500/10 border border-danger-500/20 flex items-center justify-center mx-auto mb-6">
                        <PhoneOff size={32} className="text-danger-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Call Ended</h2>
                    <p className="text-sm text-white/40 mb-6">{endReason}</p>
                    <div className="flex items-center justify-center gap-2 text-xs text-white/20">
                        <Loader2 size={14} className="animate-spin" />
                        Redirecting...
                    </div>
                </div>
            </div>
        );
    }

    // ── Main call UI ─────────────────────────────────────
    return (
        <div className="min-h-screen flex flex-col relative">
            {/* Warning banner */}
            {status === 'warning' && (
                <WarningBanner message={warningMessage} timeRemaining={timeRemaining} />
            )}

            {/* Top bar */}
            <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-white/5">
                <div className="flex items-center gap-3">
                    <h1 className="text-sm font-semibold gradient-text">CallSync</h1>
                    <div className="h-4 w-px bg-white/10" />
                    <div className="flex items-center gap-1.5">
                        <div
                            className={`w-2 h-2 rounded-full ${status === 'active'
                                    ? 'bg-emerald-400 animate-pulse'
                                    : status === 'waiting'
                                        ? 'bg-warning-400 animate-pulse'
                                        : status === 'warning'
                                            ? 'bg-danger-400 animate-pulse'
                                            : 'bg-white/20'
                                }`}
                        />
                        <span className="text-xs text-white/40 capitalize">{status}</span>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={handleCopyLink}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-white/50 hover:text-white/80 hover:bg-white/10 transition-all cursor-pointer"
                    >
                        {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                        {copied ? 'Copied!' : 'Share'}
                    </button>
                    <span className="text-[10px] font-mono text-white/20 hidden md:block">
                        {sessionId?.slice(0, 8)}...
                    </span>
                </div>
            </div>

            {/* Content area */}
            <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 gap-6">
                {/* Waiting screen */}
                {status === 'waiting' && (
                    <div className="text-center animate-fade-in">
                        <Loader2 size={40} className="text-primary-400 animate-spin mx-auto mb-4" />
                        <h2 className="text-lg font-semibold text-white mb-2">
                            Waiting for participant...
                        </h2>
                        <p className="text-sm text-white/40 mb-6">
                            Share the link below for the other person to join
                        </p>
                        <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 max-w-full">
                            <span className="text-xs font-mono text-primary-300 truncate max-w-[260px] sm:max-w-[400px]">
                                {`${window.location.origin}/call/${sessionId}?role=callee`}
                            </span>
                            <button
                                onClick={handleCopyLink}
                                className="p-1.5 rounded-md bg-white/5 hover:bg-white/10 transition-colors cursor-pointer shrink-0"
                            >
                                {copied ? (
                                    <Check size={12} className="text-emerald-400" />
                                ) : (
                                    <Copy size={12} className="text-white/40" />
                                )}
                            </button>
                        </div>
                    </div>
                )}

                {/* Active call */}
                {(status === 'active' || status === 'warning') && (
                    <>
                        {/* Timer */}
                        <TimerDisplay
                            timeRemaining={timeRemaining}
                            durationLimit={durationLimit}
                            status={status}
                        />

                        {/* Video grid */}
                        <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Local video */}
                            <VideoPanel
                                stream={localStream}
                                isLocal={true}
                                label="You"
                                isVideoOff={isVideoOff}
                            />

                            {/* Remote video */}
                            {remoteStream ? (
                                <VideoPanel
                                    stream={remoteStream}
                                    isLocal={false}
                                    label="Remote"
                                    isVideoOff={false}
                                />
                            ) : (
                                <div className="rounded-2xl bg-surface-card border border-white/5 aspect-video flex flex-col items-center justify-center">
                                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-3">
                                        <Users size={24} className="text-white/20" />
                                    </div>
                                    <span className="text-xs text-white/30">Connecting video...</span>
                                </div>
                            )}
                        </div>

                        {/* Controls */}
                        <div className="mt-2">
                            <CallControls
                                isMuted={isMuted}
                                isVideoOff={isVideoOff}
                                onToggleMute={toggleMute}
                                onToggleVideo={toggleVideo}
                                onEndCall={endCall}
                                disabled={false}
                            />
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
