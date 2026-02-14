import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Zap, Shield, Users, ArrowRight, Play, Check, Star, Sparkles, Video, Lock, Timer, Globe } from 'lucide-react';

export default function LandingPage() {
    const [isVisible, setIsVisible] = useState(false);
    const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
    const navigate = useNavigate();

    useEffect(() => {
        setIsVisible(true);

        const handleMouseMove = (e) => {
            setCursorPos({ x: e.clientX, y: e.clientY });
        };

        window.addEventListener('mousemove', handleMouseMove, { passive: true });
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    const features = [
        { icon: Timer, title: "Timed Sessions", description: "Set precise call durations with synchronized countdown timers across all participants" },
        { icon: Shield, title: "Secure & Private", description: "End-to-end encrypted video calls with no data retention or tracking" },
        { icon: Globe, title: "Works Anywhere", description: "Cross-network connectivity that works on any device, any network, anywhere" },
        { icon: Video, title: "HD Quality", description: "Crystal clear 1080p video with professional audio quality" },
        { icon: Users, title: "Simple Sharing", description: "One-click invite links - no accounts, no hassle, just share and connect" },
        { icon: Lock, title: "Zero Setup", description: "No downloads, no installations, no sign-ups - instant video calls" }
    ];

    const pricingPlans = [
        { name: "Free", price: "0", features: ["Up to 30min calls", "HD video quality", "Unlimited calls", "Basic timer"], cta: "Start Free" },
        { name: "Pro", price: "9", popular: true, features: ["Unlimited duration", "1080p quality", "Priority support", "Advanced analytics", "Custom branding"], cta: "Start Free Trial" },
        { name: "Enterprise", price: "Custom", features: ["Custom limits", "Dedicated support", "SSO integration", "99.99% uptime SLA", "White labeling"], cta: "Contact Sales" }
    ];

    return (
        <div className="relative min-h-screen bg-black text-white overflow-x-hidden">
            {/* Dynamic Cursor Glow */}
            <div
                className="fixed inset-0 pointer-events-none transition-opacity duration-300"
                style={{
                    background: `radial-gradient(600px circle at ${cursorPos.x}px ${cursorPos.y}px, rgba(99, 102, 241, 0.15), transparent 40%)`
                }}
            />

            {/* Noise Texture Overlay */}
            <div
                className="fixed inset-0 pointer-events-none opacity-[0.03]"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' /%3E%3C/svg%3E")`,
                    backgroundRepeat: 'repeat'
                }}
            />

            {/* Navigation */}
            <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
                <div className="max-w-7xl mx-auto px-6 py-6">
                    <div className="flex items-center justify-between backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl px-6 py-4">
                        <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                                <Clock className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xl font-bold">CallSync</span>
                        </div>

                        <div className="hidden md:flex items-center space-x-8">
                            <a href="#features" className="text-gray-400 hover:text-white transition-colors duration-200">Features</a>
                            <a href="#pricing" className="text-gray-400 hover:text-white transition-colors duration-200">Pricing</a>
                            <button
                                onClick={() => navigate('/start')}
                                className="px-6 py-2.5 bg-white text-black rounded-lg font-semibold hover:scale-105 transition-transform duration-300"
                            >
                                Start Free
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative min-h-screen flex items-center justify-center px-6 pt-32">
                <div className="max-w-7xl mx-auto text-center">
                    {/* Badge */}
                    <div className={`inline-flex items-center space-x-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full mb-8 transition-all duration-600 delay-100 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                        <Sparkles className="w-4 h-4 text-indigo-400" />
                        <span className="text-sm text-gray-400">Video calls that know when to end</span>
                    </div>

                    {/* Headline with Gradient */}
                    <h1
                        className={`text-7xl md:text-8xl lg:text-9xl font-bold tracking-tighter leading-none mb-6 transition-all duration-600 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                        style={{
                            background: 'linear-gradient(to bottom, #ffffff 30%, #737373 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text'
                        }}
                    >
                        Timed Video Calls
                    </h1>

                    {/* Subheadline */}
                    <p className={`text-xl md:text-2xl text-gray-400 mb-12 max-w-3xl mx-auto transition-all duration-600 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                        Set precise time limits on your video calls. Automatic endings, synchronized timers, and professional HD quality—all in your browser.
                    </p>

                    {/* CTA Buttons */}
                    <div className={`flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 transition-all duration-600 delay-400 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                        <button
                            onClick={() => navigate('/start')}
                            className="group px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl font-semibold hover:scale-105 transition-all duration-300 shadow-lg shadow-indigo-500/50 flex items-center"
                        >
                            Start Free Trial
                            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                        </button>
                        <button className="px-8 py-4 bg-white/5 border border-white/10 rounded-xl font-semibold hover:bg-white/10 hover:scale-105 transition-all duration-300 flex items-center">
                            <Play className="w-5 h-5 mr-2" />
                            Watch Demo
                        </button>
                    </div>

                    {/* Product Preview with Glow */}
                    <div className={`relative max-w-5xl mx-auto transition-all duration-600 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
                        <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-white/5 backdrop-blur-xl p-8">
                            {/* Glow Effect */}
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-purple-600/20 blur-3xl" />

                            {/* Mock Interface */}
                            <div className="relative bg-black rounded-2xl border border-white/10 p-4">
                                <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/10">
                                    <div className="flex items-center space-x-2">
                                        <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                                        <span className="text-sm">CallSync</span>
                                    </div>
                                    <div className="flex items-center space-x-4">
                                        <div className="flex items-center space-x-2 text-white/60">
                                            <Clock className="w-4 h-4" />
                                            <span className="text-sm font-mono">15:30</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="aspect-video bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg flex items-center justify-center">
                                    <Video className="w-16 h-16 text-white/20" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="relative py-32 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-20">
                        <h2
                            className="text-5xl md:text-6xl font-bold tracking-tight leading-tight mb-4"
                            style={{
                                background: 'linear-gradient(to bottom, #ffffff 30%, #737373 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text'
                            }}
                        >
                            Everything you need
                        </h2>
                        <p className="text-xl text-gray-400">Professional video calling made effortlessly simple</p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {features.map((feature, index) => (
                            <div
                                key={index}
                                className="group p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl hover:bg-white/10 hover:border-white/20 hover:scale-105 transition-all duration-300 cursor-pointer"
                                style={{
                                    animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`
                                }}
                            >
                                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <feature.icon className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
                                <p className="text-gray-400 leading-relaxed">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section id="pricing" className="relative py-32 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-20">
                        <h2
                            className="text-5xl md:text-6xl font-bold tracking-tight leading-tight mb-4"
                            style={{
                                background: 'linear-gradient(to bottom, #ffffff 30%, #737373 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text'
                            }}
                        >
                            Simple pricing
                        </h2>
                        <p className="text-xl text-gray-400">Choose the plan that works for you</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {pricingPlans.map((plan, index) => (
                            <div
                                key={index}
                                className={`relative p-8 rounded-3xl border transition-all duration-300 hover:scale-105 ${plan.popular
                                        ? 'bg-gradient-to-br from-indigo-500/10 to-purple-600/10 border-indigo-500/50 shadow-2xl shadow-indigo-500/20'
                                        : 'bg-white/5 backdrop-blur-xl border-white/10 hover:border-white/20'
                                    }`}
                            >
                                {plan.popular && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full text-sm font-semibold">
                                        Most Popular
                                    </div>
                                )}

                                <div className="mb-8">
                                    <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                                    <div className="flex items-baseline">
                                        <span className="text-5xl font-bold">${plan.price}</span>
                                        {plan.price !== "Custom" && <span className="text-gray-400 ml-2">/month</span>}
                                    </div>
                                </div>

                                <ul className="space-y-4 mb-8">
                                    {plan.features.map((feature, i) => (
                                        <li key={i} className="flex items-start">
                                            <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                                            <span className="text-gray-300">{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                <button
                                    onClick={() => navigate('/start')}
                                    className={`w-full py-3 rounded-xl font-semibold transition-all duration-300 ${plan.popular
                                            ? 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:scale-105 shadow-lg shadow-indigo-500/50'
                                            : 'bg-white/10 hover:bg-white/20 border border-white/10'
                                        }`}
                                >
                                    {plan.cta}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonial */}
            <section className="relative py-32 px-6">
                <div className="max-w-4xl mx-auto">
                    <div className="p-12 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl text-center">
                        <div className="flex justify-center mb-6">
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} className="w-6 h-6 text-yellow-500 fill-yellow-500" />
                            ))}
                        </div>
                        <p className="text-3xl md:text-4xl font-medium mb-8 leading-relaxed">
                            "CallSync transformed how we run our timed interviews. The synchronized countdown is <span className="bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">brilliant</span>."
                        </p>
                        <div className="flex items-center justify-center space-x-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full" />
                            <div className="text-left">
                                <div className="font-semibold">Sarah Chen</div>
                                <div className="text-gray-400 text-sm">Head of HR, TechCorp</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="relative py-32 px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <h2
                        className="text-5xl md:text-6xl font-bold tracking-tight leading-tight mb-6"
                        style={{
                            background: 'linear-gradient(to bottom, #ffffff 30%, #737373 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text'
                        }}
                    >
                        Ready to get started?
                    </h2>
                    <p className="text-xl text-gray-400 mb-12">
                        No credit card required. Start your first timed call in seconds.
                    </p>
                    <button
                        onClick={() => navigate('/start')}
                        className="group px-10 py-5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl text-lg font-semibold hover:scale-105 transition-all duration-300 shadow-2xl shadow-indigo-500/50 inline-flex items-center"
                    >
                        Start Free Trial
                        <ArrowRight className="w-6 h-6 ml-2 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </section>

            {/* Footer */}
            <footer className="relative py-12 px-6 border-t border-white/10">
                <div className="max-w-7xl mx-auto text-center">
                    <div className="flex items-center justify-center space-x-2 mb-4">
                        <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                            <Clock className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-bold">CallSync</span>
                    </div>
                    <p className="text-gray-500 text-sm">© 2026 CallSync. Video calls that know when to end.</p>
                </div>
            </footer>

            <style>{`
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>
        </div>
    );
}
