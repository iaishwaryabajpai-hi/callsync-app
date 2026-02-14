import { useRef, useEffect } from 'react';
import { VideoOff, User } from 'lucide-react';

export default function VideoPanel({ stream, isLocal, label, isVideoOff }) {
    const videoRef = useRef(null);

    useEffect(() => {
        const video = videoRef.current;
        if (!video || !stream) return;

        // Attach stream
        video.srcObject = stream;

        // Force play (required on mobile Safari)
        const playPromise = video.play();
        if (playPromise) {
            playPromise.catch((err) => {
                console.log('Video autoplay blocked, will retry:', err.message);
                // Retry on user interaction
                const retry = () => {
                    video.play().catch(() => { });
                    document.removeEventListener('touchstart', retry);
                    document.removeEventListener('click', retry);
                };
                document.addEventListener('touchstart', retry, { once: true });
                document.addEventListener('click', retry, { once: true });
            });
        }

        return () => {
            video.srcObject = null;
        };
    }, [stream]);

    return (
        <div className="relative rounded-2xl overflow-hidden bg-surface-card border border-white/5 aspect-video group">
            {/* Always render the video element - hide/show with CSS */}
            <video
                ref={videoRef}
                autoPlay
                playsInline
                muted={isLocal}
                controls={false}
                style={{
                    display: stream && !isVideoOff ? 'block' : 'none',
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transform: isLocal ? 'scaleX(-1)' : 'none',  // Mirror local video
                }}
            />

            {/* Placeholder when no stream or video is off */}
            {(!stream || isVideoOff) && (
                <div className="w-full h-full flex flex-col items-center justify-center bg-surface-card">
                    <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-3">
                        {isVideoOff ? (
                            <VideoOff size={28} className="text-white/20" />
                        ) : (
                            <User size={28} className="text-white/20" />
                        )}
                    </div>
                    <span className="text-xs text-white/30">{label || (isLocal ? 'You' : 'Remote')}</span>
                </div>
            )}

            {/* Label overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${stream ? 'bg-emerald-400' : 'bg-white/20'}`} />
                    <span className="text-xs text-white/80 font-medium">{label}</span>
                    {isLocal && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary-600/40 text-primary-200 ml-auto">
                            You
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}
