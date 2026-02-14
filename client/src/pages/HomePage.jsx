import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, Clock, Zap } from 'lucide-react';

export default function HomePage() {
    const [yourId, setYourId] = useState('');
    const [calleeId, setCalleeId] = useState('');
    const [duration, setDuration] = useState(30);
    const navigate = useNavigate();

    const handleStartCall = async () => {
        if (!yourId.trim() || !calleeId.trim()) return;

        const response = await fetch('/api/sessions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                callerId: yourId.trim(),
                calleeId: calleeId.trim(),
                durationLimit: duration,
            }),
        });

        const session = await response.json();
        sessionStorage.setItem(`session_${session.sessionId}`, JSON.stringify(session));
        navigate(`/call/${session.sessionId}?role=caller`);
    };

    return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center p-4 relative overflow-hidden">
            {/* Futuristic grid background */}
            <div className="absolute inset-0 opacity-5">
                <div className="absolute inset-0" style={{
                    backgroundImage: `
                        linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
                    `,
                    backgroundSize: '50px 50px'
                }} />
            </div>

            {/* Glowing orb effect */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-white/5 rounded-full blur-3xl" />

            {/* Main content */}
            <div className="relative z-10 w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-20 h-20 mb-6 border border-white/20 rounded-full relative">
                        <Phone className="w-8 h-8 text-white" strokeWidth={1.5} />
                        <div className="absolute inset-0 rounded-full border border-white/10 animate-ping"
                            style={{ animationDuration: '3s' }} />
                    </div>
                    <h1 className="text-4xl font-thin tracking-widest mb-2 uppercase">
                        Call<span className="font-bold">Sync</span>
                    </h1>
                    <p className="text-white/40 text-sm tracking-wider font-mono">
                        TIMED VIDEO SESSIONS
                    </p>
                </div>

                {/* Form Card */}
                <div className="border border-white/10 bg-white/5 backdrop-blur-xl rounded-2xl p-8">
                    {/* Input Fields */}
                    <div className="space-y-6 mb-8">
                        <div>
                            <label className="block text-xs text-white/40 mb-2 uppercase tracking-widest font-mono">
                                Your User ID
                            </label>
                            <input
                                type="text"
                                value={yourId}
                                onChange={(e) => setYourId(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleStartCall()}
                                placeholder="Enter your ID"
                                className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/20 focus:border-white/40 focus:outline-none transition-all font-mono"
                                autoFocus
                            />
                        </div>

                        <div>
                            <label className="block text-xs text-white/40 mb-2 uppercase tracking-widest font-mono">
                                Call User ID
                            </label>
                            <input
                                type="text"
                                value={calleeId}
                                onChange={(e) => setCalleeId(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleStartCall()}
                                placeholder="Enter recipient ID"
                                className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/20 focus:border-white/40 focus:outline-none transition-all font-mono"
                            />
                        </div>

                        <div>
                            <label className="block text-xs text-white/40 mb-2 uppercase tracking-widest font-mono flex items-center">
                                <Clock className="w-3 h-3 mr-2" />
                                Duration: {duration} min
                            </label>
                            <input
                                type="range"
                                min="5"
                                max="60"
                                step="5"
                                value={duration}
                                onChange={(e) => setDuration(Number(e.target.value))}
                                className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-white"
                                style={{
                                    background: `linear-gradient(to right, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0.6) ${(duration - 5) / 55 * 100}%, rgba(255,255,255,0.1) ${(duration - 5) / 55 * 100}%, rgba(255,255,255,0.1) 100%)`
                                }}
                            />
                            <div className="flex justify-between text-xs text-white/20 mt-1 font-mono">
                                <span>5m</span>
                                <span>60m</span>
                            </div>
                        </div>
                    </div>

                    {/* Start Button */}
                    <button
                        onClick={handleStartCall}
                        disabled={!yourId.trim() || !calleeId.trim()}
                        className="w-full bg-white text-black py-4 rounded-lg font-mono font-bold tracking-widest uppercase text-sm hover:bg-white/90 disabled:bg-white/10 disabled:text-white/20 disabled:cursor-not-allowed transition-all relative overflow-hidden group"
                    >
                        <span className="relative z-10 flex items-center justify-center">
                            <Zap className="w-4 h-4 mr-2" strokeWidth={2.5} />
                            Start Call
                        </span>
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
                    </button>
                </div>

                {/* Footer */}
                <div className="mt-8 text-center text-xs text-white/20 font-mono">
                    <p>Powered by Jitsi Meet • End-to-end Encrypted</p>
                </div>
            </div>
        </div>
    );
}
