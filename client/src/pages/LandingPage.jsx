import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, Clock, Zap, Shield, Video, Users, Globe, Lock, Timer, Sparkles, ArrowRight, Play } from 'lucide-react';

export default function LandingPage() {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [scrollY, setScrollY] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        const handleMouseMove = (e) => {
            setMousePosition({ x: e.clientX, y: e.clientY });
        };

        const handleScroll = () => {
            setScrollY(window.scrollY);
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    const features = [
        {
            icon: Timer,
            title: "Timed Sessions",
            description: "Set precise call durations with synchronized countdown timers across all participants"
        },
        {
            icon: Shield,
            title: "Secure & Private",
            description: "End-to-end encrypted video calls with no data retention or tracking"
        },
        {
            icon: Globe,
            title: "Works Anywhere",
            description: "Cross-network connectivity that works on any device, any network, anywhere"
        },
        {
            icon: Video,
            title: "HD Quality",
            description: "Crystal clear 1080p video with professional audio quality"
        },
        {
            icon: Users,
            title: "Simple Sharing",
            description: "One-click invite links - no accounts, no hassle, just share and connect"
        },
        {
            icon: Lock,
            title: "Zero Setup",
            description: "No downloads, no installations, no sign-ups - instant video calls"
        }
    ];

    return (
        <div className="min-h-screen bg-black text-white overflow-x-hidden">
            {/* Animated Background */}
            <div className="fixed inset-0 z-0">
                {/* Grid */}
                <div className="absolute inset-0 opacity-[0.02]">
                    <div className="absolute inset-0" style={{
                        backgroundImage: `linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)`,
                        backgroundSize: '100px 100px',
                        transform: `translateY(${scrollY * 0.5}px)`
                    }} />
                </div>

                {/* Floating orbs */}
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse"
                    style={{ transform: `translate(${mousePosition.x * 0.02}px, ${mousePosition.y * 0.02}px)` }} />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse"
                    style={{
                        transform: `translate(${-mousePosition.x * 0.02}px, ${-mousePosition.y * 0.02}px)`,
                        animationDelay: '1s'
                    }} />
            </div>

            {/* Content */}
            <div className="relative z-10">
                {/* Hero Section */}
                <section className="min-h-screen flex items-center justify-center relative px-4">
                    {/* 3D Phone Icon - Floating */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64"
                        style={{
                            transform: `translate(${-50 + mousePosition.x * 0.01}%, ${-50 + mousePosition.y * 0.01}%) rotateX(${mousePosition.y * 0.02}deg) rotateY(${mousePosition.x * 0.02}deg)`,
                            transformStyle: 'preserve-3d'
                        }}>
                        <div className="relative w-full h-full">
                            {/* Rotating rings */}
                            <div className="absolute inset-0 border border-white/10 rounded-full animate-spin"
                                style={{ animationDuration: '20s' }} />
                            <div className="absolute inset-4 border border-white/10 rounded-full animate-spin"
                                style={{ animationDuration: '15s', animationDirection: 'reverse' }} />
                            <div className="absolute inset-8 border border-white/20 rounded-full animate-spin"
                                style={{ animationDuration: '10s' }} />

                            {/* Center icon */}
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-24 h-24 bg-white/5 backdrop-blur-xl border border-white/20 rounded-2xl flex items-center justify-center"
                                    style={{ transform: 'translateZ(50px)' }}>
                                    <Phone className="w-12 h-12 text-white" strokeWidth={1.5} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Hero Text */}
                    <div className="text-center space-y-8 max-w-4xl mx-auto"
                        style={{
                            transform: `translateY(${scrollY * 0.3}px)`,
                            opacity: Math.max(0, 1 - scrollY / 500)
                        }}>
                        <h1 className="text-7xl md:text-8xl font-thin tracking-wider leading-tight">
                            CALL<span className="font-bold">SYNC</span>
                        </h1>

                        <p className="text-xl md:text-2xl text-white/60 font-mono tracking-wide">
                            Timed Video Calls. Beautifully Simple.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-12">
                            <button
                                onClick={() => navigate('/start')}
                                className="group px-8 py-4 bg-white text-black rounded-lg font-mono font-bold tracking-widest uppercase text-sm hover:bg-white/90 transition-all relative overflow-hidden"
                            >
                                <span className="relative z-10 flex items-center">
                                    <Zap className="w-5 h-5 mr-2" />
                                    Start Free Call
                                </span>
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
                            </button>

                            <button className="px-8 py-4 border border-white/20 bg-white/5 hover:bg-white/10 text-white rounded-lg font-mono tracking-widest uppercase text-sm transition-all flex items-center">
                                <Play className="w-4 h-4 mr-2" />
                                Watch Demo
                            </button>
                        </div>

                        {/* Stats */}
                        <div className="flex items-center justify-center gap-12 mt-16 text-center">
                            <div>
                                <div className="text-3xl font-bold">100%</div>
                                <div className="text-sm text-white/40 font-mono">FREE</div>
                            </div>
                            <div className="w-px h-12 bg-white/10" />
                            <div>
                                <div className="text-3xl font-bold">ZERO</div>
                                <div className="text-sm text-white/40 font-mono">SETUP</div>
                            </div>
                            <div className="w-px h-12 bg-white/10" />
                            <div>
                                <div className="text-3xl font-bold">HD</div>
                                <div className="text-sm text-white/40 font-mono">QUALITY</div>
                            </div>
                        </div>
                    </div>

                    {/* Scroll indicator */}
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce"
                        style={{ opacity: Math.max(0, 1 - scrollY / 300) }}>
                        <div className="w-6 h-10 border-2 border-white/20 rounded-full flex justify-center pt-2">
                            <div className="w-1 h-2 bg-white/60 rounded-full" />
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section className="py-32 px-4 relative">
                    <div className="max-w-6xl mx-auto">
                        {/* Section Header */}
                        <div className="text-center mb-20"
                            style={{
                                transform: `translateY(${Math.max(0, (300 - scrollY) * 0.5)}px)`,
                                opacity: Math.min(1, (scrollY - 200) / 300)
                            }}>
                            <div className="inline-flex items-center space-x-2 text-white/40 mb-4">
                                <Sparkles className="w-4 h-4" />
                                <span className="text-sm font-mono tracking-widest uppercase">Features</span>
                            </div>
                            <h2 className="text-5xl font-thin tracking-wide mb-4">
                                Everything You <span className="font-bold">Need</span>
                            </h2>
                            <p className="text-white/60 text-lg">
                                Professional video calling made effortlessly simple
                            </p>
                        </div>

                        {/* Feature Grid */}
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {features.map((feature, index) => (
                                <div
                                    key={index}
                                    className="group relative border border-white/10 bg-white/5 backdrop-blur-xl rounded-2xl p-8 hover:border-white/20 hover:bg-white/10 transition-all duration-500 cursor-pointer"
                                    style={{
                                        transform: `translateY(${Math.max(0, (500 + index * 50 - scrollY) * 0.1)}px)`,
                                        opacity: Math.min(1, (scrollY - 300 - index * 50) / 200)
                                    }}
                                >
                                    {/* Glow effect on hover */}
                                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                    <div className="relative z-10">
                                        <div className="w-12 h-12 border border-white/20 rounded-xl flex items-center justify-center mb-6 group-hover:border-white/40 transition-all">
                                            <feature.icon className="w-6 h-6 text-white" strokeWidth={1.5} />
                                        </div>

                                        <h3 className="text-xl font-bold mb-3 tracking-wide">
                                            {feature.title}
                                        </h3>

                                        <p className="text-white/60 text-sm leading-relaxed">
                                            {feature.description}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-32 px-4">
                    <div className="max-w-4xl mx-auto text-center"
                        style={{
                            transform: `translateY(${Math.max(0, (1000 - scrollY) * 0.2)}px)`,
                            opacity: Math.min(1, (scrollY - 800) / 300)
                        }}>
                        <div className="border border-white/10 bg-white/5 backdrop-blur-xl rounded-3xl p-12 md:p-16 relative overflow-hidden">
                            {/* Background glow */}
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-white/10 rounded-full blur-3xl" />

                            <div className="relative z-10">
                                <h2 className="text-4xl md:text-5xl font-thin tracking-wide mb-6">
                                    Ready to <span className="font-bold">Connect</span>?
                                </h2>
                                <p className="text-white/60 text-lg mb-12 max-w-2xl mx-auto">
                                    No sign-ups. No downloads. No hassle. Just instant, secure, timed video calls.
                                </p>

                                <button
                                    onClick={() => navigate('/start')}
                                    className="group px-10 py-5 bg-white text-black rounded-xl font-mono font-bold tracking-widest uppercase hover:bg-white/90 transition-all relative overflow-hidden inline-flex items-center"
                                >
                                    <span className="relative z-10 flex items-center">
                                        Start Your First Call
                                        <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                                    </span>
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="py-12 px-4 border-t border-white/10">
                    <div className="max-w-6xl mx-auto text-center">
                        <div className="flex items-center justify-center space-x-2 mb-4">
                            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                            <span className="font-thin tracking-widest text-lg uppercase">
                                Call<span className="font-bold">Sync</span>
                            </span>
                        </div>
                        <p className="text-white/40 text-sm font-mono">
                            © 2026 CallSync. Professional timed video calls.
                        </p>
                    </div>
                </footer>
            </div>
        </div>
    );
}
