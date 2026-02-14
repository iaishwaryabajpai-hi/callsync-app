import { useMemo } from 'react';

export default function TimerDisplay({ timeRemaining, durationLimit, status }) {
    const totalSeconds = (durationLimit || 30) * 60;
    const remaining = timeRemaining ?? totalSeconds;

    const minutes = Math.floor(remaining / 60);
    const seconds = remaining % 60;
    const formatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

    const progress = totalSeconds > 0 ? ((totalSeconds - remaining) / totalSeconds) * 100 : 0;
    const isWarning = status === 'warning' || remaining <= 120;
    const isCritical = remaining <= 30;

    // SVG ring calculations
    const radius = 90;
    const circumference = 2 * Math.PI * radius;
    const dashOffset = circumference - (progress / 100) * circumference;

    const ringColor = useMemo(() => {
        if (isCritical) return '#ef4444';
        if (isWarning) return '#f59e0b';
        return '#6366f1';
    }, [isCritical, isWarning]);

    const glowColor = useMemo(() => {
        if (isCritical) return 'rgba(239,68,68,0.4)';
        if (isWarning) return 'rgba(245,158,11,0.4)';
        return 'rgba(99,102,241,0.3)';
    }, [isCritical, isWarning]);

    return (
        <div className="flex flex-col items-center gap-4">
            {/* Circular timer ring */}
            <div className="relative w-56 h-56 flex items-center justify-center">
                <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 200 200">
                    {/* Background ring */}
                    <circle
                        cx="100"
                        cy="100"
                        r={radius}
                        fill="none"
                        stroke="rgba(255,255,255,0.06)"
                        strokeWidth="8"
                    />
                    {/* Progress ring */}
                    <circle
                        cx="100"
                        cy="100"
                        r={radius}
                        fill="none"
                        stroke={ringColor}
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={dashOffset}
                        className="timer-ring"
                        style={{
                            filter: `drop-shadow(0 0 8px ${glowColor})`,
                        }}
                    />
                </svg>

                {/* Time text */}
                <div className="relative z-10 text-center">
                    <div
                        className={`text-5xl font-bold font-mono tracking-wider ${isCritical
                                ? 'text-danger-500 animate-countdown-pulse'
                                : isWarning
                                    ? 'text-warning-500'
                                    : 'text-white'
                            }`}
                    >
                        {formatted}
                    </div>
                    <div className="text-xs text-white/40 mt-1 font-medium uppercase tracking-widest">
                        {status === 'active' ? 'remaining' : status === 'warning' ? 'ending soon' : status}
                    </div>
                </div>

                {/* Ambient glow ring (warning/critical) */}
                {(isWarning || isCritical) && status !== 'ended' && (
                    <div
                        className="absolute inset-0 rounded-full animate-ring opacity-30"
                        style={{ border: `2px solid ${ringColor}` }}
                    />
                )}
            </div>

            {/* Progress bar (linear) */}
            <div className="w-full max-w-md">
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div
                        className="h-full rounded-full transition-all duration-1000"
                        style={{
                            width: `${progress}%`,
                            background: `linear-gradient(90deg, ${ringColor}, ${isCritical ? '#f87171' : isWarning ? '#fbbf24' : '#818cf8'
                                })`,
                            boxShadow: `0 0 12px ${glowColor}`,
                        }}
                    />
                </div>
                <div className="flex justify-between mt-1.5 text-[10px] text-white/30 font-medium">
                    <span>0:00</span>
                    <span>{Math.floor(totalSeconds / 60)}:00</span>
                </div>
            </div>
        </div>
    );
}
