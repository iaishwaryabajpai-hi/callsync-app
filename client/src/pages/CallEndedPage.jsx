import { useLocation, useNavigate } from 'react-router-dom';
import { Home, RotateCcw, Clock, Shield } from 'lucide-react';

export default function CallEndedPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const { reason, sessionId } = location.state || {};

    return (
        <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
            {/* Ambient glow */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-[-30%] left-[30%] w-[500px] h-[500px] bg-primary-600/8 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[400px] h-[400px] bg-accent-500/5 rounded-full blur-[100px]" />
            </div>

            <div className="relative z-10 max-w-lg w-full animate-slide-up">
                {/* Card */}
                <div className="glass rounded-3xl p-10 text-center">
                    {/* Icon */}
                    <div className="relative w-24 h-24 mx-auto mb-8">
                        <div className="absolute inset-0 rounded-full bg-primary-600/10 animate-ring" />
                        <div className="relative w-24 h-24 rounded-full bg-surface-elevated border border-white/10 flex items-center justify-center">
                            <Clock size={36} className="text-primary-400" />
                        </div>
                    </div>

                    <h1 className="text-3xl font-bold text-white mb-3">Session Complete</h1>

                    <p className="text-sm text-white/40 mb-8 max-w-sm mx-auto leading-relaxed">
                        {reason || 'Your call session has ended. All media tracks have been released.'}
                    </p>

                    {/* Session info */}
                    {sessionId && (
                        <div className="mb-8 px-4 py-3 rounded-xl bg-white/5 border border-white/5 inline-block">
                            <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Session</p>
                            <p className="text-xs font-mono text-primary-300">{sessionId.slice(0, 16)}...</p>
                        </div>
                    )}

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-3 mb-8">
                        <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                            <Shield size={18} className="text-emerald-400 mx-auto mb-2" />
                            <p className="text-xs text-white/50">Secure Session</p>
                            <p className="text-[10px] text-white/25 mt-0.5">End-to-end encrypted</p>
                        </div>
                        <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                            <Clock size={18} className="text-primary-400 mx-auto mb-2" />
                            <p className="text-xs text-white/50">Time Enforced</p>
                            <p className="text-[10px] text-white/25 mt-0.5">Server-authoritative</p>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                        <button
                            onClick={() => navigate('/')}
                            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-primary-600 to-accent-600 text-white font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-all active:scale-[0.98] cursor-pointer"
                        >
                            <Home size={16} />
                            New Call
                        </button>
                        <button
                            onClick={() => navigate('/')}
                            className="py-3 px-5 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-all text-sm font-medium flex items-center gap-2 cursor-pointer"
                        >
                            <RotateCcw size={14} />
                        </button>
                    </div>
                </div>

                {/* Footer text */}
                <p className="text-center text-[10px] text-white/15 mt-6">
                    Expired sessions cannot be rejoined · Powered by CallSync
                </p>
            </div>
        </div>
    );
}
