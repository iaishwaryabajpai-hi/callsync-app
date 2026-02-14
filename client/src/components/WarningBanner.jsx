import { AlertTriangle, X } from 'lucide-react';
import { useState } from 'react';

export default function WarningBanner({ message, timeRemaining }) {
    const [dismissed, setDismissed] = useState(false);

    if (dismissed) return null;

    const mins = Math.floor((timeRemaining || 0) / 60);
    const secs = (timeRemaining || 0) % 60;

    return (
        <div className="animate-slide-up fixed top-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-lg px-4">
            <div className="glass animate-warning-pulse rounded-2xl p-4 border border-warning-400/30 bg-warning-500/10 shadow-2xl shadow-warning-500/10">
                <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div className="w-10 h-10 rounded-xl bg-warning-500/20 flex items-center justify-center flex-shrink-0">
                        <AlertTriangle className="w-5 h-5 text-warning-400" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-warning-400">
                            Call Ending Soon
                        </h4>
                        <p className="text-xs text-white/60 mt-0.5">
                            {message || `Only ${mins}:${String(secs).padStart(2, '0')} remaining. Wrap up your conversation.`}
                        </p>
                    </div>

                    {/* Timer badge */}
                    <div className="flex-shrink-0 flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-lg bg-warning-500/20 text-warning-400 text-sm font-mono font-bold">
                            {mins}:{String(secs).padStart(2, '0')}
                        </span>
                        <button
                            onClick={() => setDismissed(true)}
                            className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-white/30 hover:text-white/60 hover:bg-white/10 transition-colors cursor-pointer"
                        >
                            <X size={14} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
