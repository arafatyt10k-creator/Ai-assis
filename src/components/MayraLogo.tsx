import React from "react";

interface MayraLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  showText?: boolean;
}

export const MayraLogo: React.FC<MayraLogoProps> = ({
  size = "md",
  className = "",
  showText = false
}) => {
  const getDimensions = () => {
    switch (size) {
      case "sm": return { width: 32, height: 32, text: "text-xs" };
      case "lg": return { width: 64, height: 64, text: "text-lg" };
      case "xl": return { width: 96, height: 96, text: "text-2xl" };
      case "md":
      default: return { width: 40, height: 40, text: "text-sm" };
    }
  };

  const dim = getDimensions();

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      <div 
        className="relative flex items-center justify-center rounded-2xl overflow-hidden p-0.5 bg-gradient-to-br from-cyan-400 via-blue-600 to-indigo-900 shadow-[0_0_15px_rgba(6,182,212,0.4)]"
        style={{ width: dim.width, height: dim.height }}
      >
        <div className="w-full h-full bg-[#050b18] rounded-[14px] flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-radial-gradient from-cyan-500/20 via-transparent to-transparent pointer-events-none" />
          
          <svg 
            viewBox="0 0 100 100" 
            className="w-4/5 h-4/5 drop-shadow-[0_0_6px_rgba(34,211,238,0.8)]"
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="50" cy="50" r="44" stroke="url(#cyanGlow)" strokeWidth="2.5" strokeDasharray="6 4" opacity="0.7" />
            <circle cx="50" cy="50" r="38" stroke="#38bdf8" strokeWidth="1.5" opacity="0.5" />
            
            <line x1="50" y1="2" x2="50" y2="10" stroke="#22d3ee" strokeWidth="2" strokeLinecap="round" />
            <line x1="50" y1="90" x2="50" y2="98" stroke="#22d3ee" strokeWidth="2" strokeLinecap="round" />
            <line x1="2" y1="50" x2="10" y2="50" stroke="#22d3ee" strokeWidth="2" strokeLinecap="round" />
            <line x1="90" y1="50" x2="98" y2="50" stroke="#22d3ee" strokeWidth="2" strokeLinecap="round" />

            <path 
              d="M26 68 V32 L50 54 L74 32 V68" 
              stroke="url(#mayaGrad)" 
              strokeWidth="6" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
            />
            
            <circle cx="50" cy="54" r="4" fill="#a855f7" filter="url(#glowFilter)" />
            <circle cx="50" cy="54" r="2.5" fill="#ffffff" />

            <defs>
              <linearGradient id="cyanGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#22d3ee" />
                <stop offset="50%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#a855f7" />
              </linearGradient>
              <linearGradient id="mayaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="50%" stopColor="#60a5fa" />
                <stop offset="100%" stopColor="#e879f9" />
              </linearGradient>
              <filter id="glowFilter" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>
          </svg>
        </div>
      </div>
      {showText && (
        <div className="flex flex-col">
          <span className={`font-display font-bold tracking-wider text-white ${dim.text}`}>
            MAYRA <span className="text-cyan-400 text-[10px] font-mono font-normal">AI</span>
          </span>
          <span className="text-[10px] text-cyan-300/70 font-mono tracking-widest uppercase">
            Android Assistant
          </span>
        </div>
      )}
    </div>
  );
};
