import {
    Mic,
    MicOff,
    Video,
    VideoOff,
    PhoneOff,
} from 'lucide-react';

export default function CallControls({
    isMuted,
    isVideoOff,
    onToggleMute,
    onToggleVideo,
    onEndCall,
    disabled,
}) {
    return (
        <div className="flex items-center justify-center gap-4">
            {/* Mute */}
            <button
                onClick={onToggleMute}
                disabled={disabled}
                className={`group relative w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 ${isMuted
                        ? 'bg-danger-500/20 text-danger-400 hover:bg-danger-500/30 ring-1 ring-danger-500/30'
                        : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white ring-1 ring-white/10'
                    } ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
                title={isMuted ? 'Unmute' : 'Mute'}
            >
                {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
                <span className="absolute -bottom-6 text-[10px] font-medium text-white/40 opacity-0 group-hover:opacity-100 transition-opacity">
                    {isMuted ? 'Unmute' : 'Mute'}
                </span>
            </button>

            {/* Video toggle */}
            <button
                onClick={onToggleVideo}
                disabled={disabled}
                className={`group relative w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 ${isVideoOff
                        ? 'bg-danger-500/20 text-danger-400 hover:bg-danger-500/30 ring-1 ring-danger-500/30'
                        : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white ring-1 ring-white/10'
                    } ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
                title={isVideoOff ? 'Turn on camera' : 'Turn off camera'}
            >
                {isVideoOff ? <VideoOff size={20} /> : <Video size={20} />}
                <span className="absolute -bottom-6 text-[10px] font-medium text-white/40 opacity-0 group-hover:opacity-100 transition-opacity">
                    {isVideoOff ? 'Start Cam' : 'Stop Cam'}
                </span>
            </button>

            {/* End call */}
            <button
                onClick={onEndCall}
                disabled={disabled}
                className={`group relative w-16 h-16 rounded-full flex items-center justify-center bg-danger-500 text-white hover:bg-danger-600 transition-all duration-300 shadow-lg shadow-danger-500/25 hover:shadow-danger-500/40 hover:scale-105 active:scale-95 ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
                    }`}
                title="End call"
            >
                <PhoneOff size={24} />
                <span className="absolute -bottom-6 text-[10px] font-medium text-white/40 opacity-0 group-hover:opacity-100 transition-opacity">
                    End
                </span>
            </button>
        </div>
    );
}
