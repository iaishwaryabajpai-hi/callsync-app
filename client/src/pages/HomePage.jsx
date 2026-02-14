import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createSession } from '../services/api';
import {
    Phone,
    Clock,
    Shield,
    Zap,
    Video,
    Users,
    ArrowRight,
    Loader2,
} from 'lucide-react';

export default function HomePage() {
    const navigate = useNavigate();
    const [callerId, setCallerId] = useState('');
    const [calleeId, setCalleeId] = useState('');
    const [duration, setDuration] = useState(30);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleStartCall = async (e) => {
        e.preventDefault();
        if (!callerId.trim() || !calleeId.trim()) {
            setError('Please enter both User IDs');
            return;
        }
        setError('');
        setLoading(true);

        try {
            const session = await createSession({
                callerId: callerId.trim(),
                calleeId: calleeId.trim(),
                durationLimit: duration,
            });

            // Store session data for the call page
            sessionStorage.setItem(
                `session_${session.sessionId}`,
                JSON.stringify({ ...session, callerId: callerId.trim() })
            );

            navigate(`/call/${session.sessionId}?role=caller`);
        } catch (err) {
            setError('Failed to create session. Is the server running?');
        } finally {
            setLoading(false);
        }
    };

    const features = [
        {
            icon: <Shield size={22} />,
            title: 'Server Authority',
            desc: 'Backend controls all timing – tamper-proof enforcement.',
        },
        {
            icon: <Clock size={22} />,
            title: 'Live Countdown',
            desc: 'Real-time timer synced via WebSocket every second.',
        },
        {
            icon: <Zap size={22} />,
            title: 'Auto Disconnect',
            desc: 'Calls forcibly end at 0:00 – no extensions possible.',
        },
        {
            icon: <Video size={22} />,
            title: 'Agora HD Calls',
            desc: 'Crystal-clear video & audio powered by Agora SDK.',
        },
    ];

    return (
        <div className="min-h-screen relative overflow-hidden">
            {/* Ambient background */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-primary-600/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-accent-500/8 rounded-full blur-[100px]" />
            </div>

            <div className="relative z-10 max-w-6xl mx-auto px-6 py-12">
                {/* Header */}
                <header className="text-center mb-16 animate-slide-up">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-600/10 border border-primary-600/20 mb-6">
                        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-xs font-medium text-primary-300">System Online</span>
                    </div>

                    <h1 className="text-5xl md:text-6xl font-bold mb-4 leading-tight">
                        <span className="gradient-text">CallSync</span>
                    </h1>
                    <p className="text-lg text-white/50 max-w-xl mx-auto leading-relaxed">
                        Secure, time-limited audio &amp; video calls with server-enforced session boundaries.
                    </p>
                </header>

                <div className="grid lg:grid-cols-2 gap-12 items-start">
                    {/* ── Left: Call Form ──────────────────────────── */}
                    <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
                        <div className="glass rounded-3xl p-8">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="w-10 h-10 rounded-xl bg-primary-600/20 flex items-center justify-center">
                                    <Phone size={20} className="text-primary-400" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-white">Start a Call</h2>
                                    <p className="text-xs text-white/40">Create a new timed session</p>
                                </div>
                            </div>

                            <form onSubmit={handleStartCall} className="space-y-5">
                                {/* Caller ID */}
                                <div>
                                    <label className="block text-xs font-medium text-white/50 mb-2 uppercase tracking-wider">
                                        Your User ID
                                    </label>
                                    <input
                                        type="text"
                                        value={callerId}
                                        onChange={(e) => setCallerId(e.target.value)}
                                        placeholder="e.g. user_alice"
                                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/20 focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/20 transition-all text-sm"
                                    />
                                </div>

                                {/* Callee ID */}
                                <div>
                                    <label className="block text-xs font-medium text-white/50 mb-2 uppercase tracking-wider">
                                        Call User ID
                                    </label>
                                    <input
                                        type="text"
                                        value={calleeId}
                                        onChange={(e) => setCalleeId(e.target.value)}
                                        placeholder="e.g. user_bob"
                                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/20 focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/20 transition-all text-sm"
                                    />
                                </div>

                                {/* Duration */}
                                <div>
                                    <label className="block text-xs font-medium text-white/50 mb-2 uppercase tracking-wider">
                                        Session Duration
                                    </label>
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="range"
                                            min="1"
                                            max="120"
                                            value={duration}
                                            onChange={(e) => setDuration(Number(e.target.value))}
                                            className="flex-1 accent-primary-500"
                                        />
                                        <div className="px-3 py-2 rounded-lg bg-primary-600/15 border border-primary-600/20 min-w-[80px] text-center">
                                            <span className="text-sm font-mono font-semibold text-primary-300">{duration} min</span>
                                        </div>
                                    </div>
                                    <div className="flex justify-between mt-1 text-[10px] text-white/20">
                                        <span>1 min</span>
                                        <span>120 min</span>
                                    </div>
                                </div>

                                {/* Error */}
                                {error && (
                                    <div className="px-4 py-3 rounded-xl bg-danger-500/10 border border-danger-500/20 text-danger-400 text-sm animate-fade-in">
                                        {error}
                                    </div>
                                )}

                                {/* Submit */}
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-primary-600 to-accent-600 text-white font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 hover:shadow-lg hover:shadow-primary-600/20 transition-all duration-300 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 size={18} className="animate-spin" />
                                            Creating Session...
                                        </>
                                    ) : (
                                        <>
                                            Start Call
                                            <ArrowRight size={18} />
                                        </>
                                    )}
                                </button>
                            </form>

                            {/* Quick join */}
                            <div className="mt-6 pt-6 border-t border-white/5">
                                <p className="text-xs text-white/30 text-center mb-3">
                                    Have a session link? Enter the Session ID to join.
                                </p>
                                <div className="flex gap-2">
                                    <input
                                        id="join-session-input"
                                        type="text"
                                        placeholder="Session ID"
                                        className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/20 focus:outline-none focus:border-primary-500/50 transition-all text-sm"
                                    />
                                    <button
                                        onClick={() => {
                                            const sid = document.getElementById('join-session-input').value.trim();
                                            if (sid) navigate(`/call/${sid}?role=callee`);
                                        }}
                                        className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-all text-sm font-medium cursor-pointer"
                                    >
                                        Join
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── Right: Features ─────────────────────────── */}
                    <div className="space-y-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                        {/* Feature cards */}
                        <div className="grid grid-cols-2 gap-4">
                            {features.map((f, i) => (
                                <div
                                    key={i}
                                    className="glass-light rounded-2xl p-5 hover:border-primary-600/20 transition-all duration-300 group"
                                >
                                    <div className="w-10 h-10 rounded-xl bg-primary-600/10 flex items-center justify-center mb-3 text-primary-400 group-hover:bg-primary-600/20 transition-colors">
                                        {f.icon}
                                    </div>
                                    <h3 className="text-sm font-semibold text-white/90 mb-1">
                                        {f.title}
                                    </h3>
                                    <p className="text-xs text-white/40 leading-relaxed">
                                        {f.desc}
                                    </p>
                                </div>
                            ))}
                        </div>

                        {/* How it works */}
                        <div className="glass-light rounded-2xl p-6">
                            <h3 className="text-sm font-semibold text-white/80 mb-4 flex items-center gap-2">
                                <Users size={16} className="text-primary-400" />
                                How It Works
                            </h3>
                            <div className="space-y-4">
                                {[
                                    { step: '01', text: 'User A creates a timed call session' },
                                    { step: '02', text: 'User B joins via session ID link' },
                                    { step: '03', text: 'Server starts authoritative countdown' },
                                    { step: '04', text: 'Warning at 2 min, force-end at 0:00' },
                                ].map((s, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <span className="text-xs font-mono font-bold text-primary-500/60 w-6">
                                            {s.step}
                                        </span>
                                        <div className="h-px flex-1 bg-white/5" />
                                        <span className="text-xs text-white/50">{s.text}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Tech badges */}
                        <div className="flex flex-wrap gap-2">
                            {['React', 'Tailwind', 'Node.js', 'Socket.io', 'Agora SDK', 'Supabase'].map((t) => (
                                <span
                                    key={t}
                                    className="px-3 py-1 rounded-full bg-white/5 border border-white/5 text-[10px] font-medium text-white/40 uppercase tracking-wider"
                                >
                                    {t}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
