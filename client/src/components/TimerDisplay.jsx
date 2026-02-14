import { useEffect, useState } from 'react';

export default function TimerDisplay({ timeRemaining, totalDuration }) {
    const [pulse, setPulse] = useState(false);

    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    const percentage = (timeRemaining / totalDuration) * 100;

    // Warning state when less than 1 minute
    const isWarning = timeRemaining < 60 && timeRemaining > 0;

    useEffect(() => {
        if (isWarning) {
            setPulse(true);
            const timer = setTimeout(() => setPulse(false), 500);
            return () => clearTimeout(timer);
        }
    }, [timeRemaining, isWarning]);

    // Circular progress stroke
    const radius = 28;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
        <div className="flex items-center space-x-3">
            {/* Circular Progress Timer */}
            <div className="relative">
                <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 64 64">
                    {/* Background circle */}
                    <circle
                        cx="32"
                        cy="32"
                        r={radius}
                        stroke="rgba(255, 255, 255, 0.1)"
                        strokeWidth="2"
                        fill="none"
                    />
                    {/* Progress circle */}
                    <circle
                        cx="32"
                        cy="32"
                        r={radius}
                        stroke={isWarning ? "#ffffff" : "#ffffff"}
                        strokeWidth="2"
                        fill="none"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        className={`transition-all duration-300 ${isWarning ? 'opacity-100 animate-pulse' : 'opacity-60'}`}
                        style={{
                            filter: isWarning ? 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.8))' : 'none'
                        }}
                    />
                </svg>

                {/* Time text in center */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className={`text-sm font-mono font-bold tracking-wider ${isWarning ? 'text-white' : 'text-white/80'
                        } transition-all ${pulse ? 'scale-110' : 'scale-100'}`}>
                        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                    </span>
                </div>
            </div>

            {/* Label */}
            <div className="flex flex-col">
                <span className="text-xs text-white/40 uppercase tracking-widest font-mono">
                    {isWarning ? 'Ending Soon' : 'Time Left'}
                </span>
            </div>
        </div>
    );
}
