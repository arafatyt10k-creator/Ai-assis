import React, { useEffect, useState } from "react";
import { LiveState } from "../lib/audio";

interface MayaOrbVisualizerProps {
  state: LiveState;
  subtitle?: string;
  themeColor?: string;
  onOrbClick?: () => void;
  characterMode?: boolean;
}

export const MayaOrbVisualizer: React.FC<MayaOrbVisualizerProps> = ({
  state,
  subtitle = "HOW CAN I HELP YOU?",
  themeColor = "cyan",
  onOrbClick,
  characterMode = false,
}) => {
  const [pulsePhase, setPulsePhase] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPulsePhase((prev) => (prev + 1) % 100);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const isActive = state === "listening" || state === "speaking";
  const isSpeaking = state === "speaking";
  const isListening = state === "listening";

  return (
    <div 
      className="relative w-full max-w-[340px] aspect-square mx-auto flex items-center justify-center select-none cursor-pointer group"
      onClick={onOrbClick}
    >
      {/* Background radial glow */}
      <div 
        className={`absolute inset-0 rounded-full blur-[70px] transition-all duration-700 pointer-events-none ${
          isSpeaking
            ? "bg-purple-600/30 scale-110"
            : isListening
            ? "bg-cyan-500/35 scale-105"
            : "bg-blue-600/20 group-hover:bg-blue-600/30"
        }`} 
      />

      {/* Cyber Circuit Lines (SVG Background) */}
      <svg 
        className="absolute inset-[-20%] w-[140%] h-[140%] pointer-events-none opacity-40"
        viewBox="0 0 400 400"
        fill="none"
      >
        <path d="M 40 200 H 120 L 150 170" stroke="#0284c7" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
        <circle cx="40" cy="200" r="3" fill="#38bdf8" />
        <path d="M 360 200 H 280 L 250 230" stroke="#0284c7" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
        <circle cx="360" cy="200" r="3" fill="#38bdf8" />
        <path d="M 80 80 L 130 130 H 170" stroke="#0284c7" strokeWidth="1" strokeDasharray="2 4" opacity="0.4" />
        <circle cx="80" cy="80" r="2.5" fill="#38bdf8" />
        <path d="M 320 320 L 270 270 H 230" stroke="#0284c7" strokeWidth="1" strokeDasharray="2 4" opacity="0.4" />
        <circle cx="320" cy="320" r="2.5" fill="#38bdf8" />
      </svg>

      {/* Outer Orbit Compass Ring */}
      <div className="absolute inset-0 rounded-full border border-sky-500/25 pointer-events-none flex items-center justify-center">
        <div 
          className="absolute inset-[-2px] rounded-full border border-cyan-400/40 border-dashed animate-[spin_40s_linear_infinite]"
          style={{ animationDirection: isSpeaking ? "reverse" : "normal" }}
        />
        
        <svg className="absolute inset-0 w-full h-full animate-[spin_20s_linear_infinite]" viewBox="0 0 100 100">
          <circle 
            cx="50" 
            cy="50" 
            r="48" 
            stroke="url(#arcGlow)" 
            strokeWidth="2.5" 
            strokeLinecap="round" 
            strokeDasharray="40 260" 
            fill="none" 
          />
          <circle 
            cx="50" 
            cy="50" 
            r="48" 
            stroke="#22d3ee" 
            strokeWidth="3.5" 
            strokeLinecap="round" 
            strokeDasharray="15 285" 
            strokeDashoffset="120"
            fill="none" 
          />
          <defs>
            <linearGradient id="arcGlow" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#a855f7" />
            </linearGradient>
          </defs>
        </svg>

        {/* Major Crosshair Markers (+) */}
        <div className="absolute -top-3 text-cyan-400 text-lg font-light drop-shadow-[0_0_8px_#38bdf8]">+</div>
        <div className="absolute -bottom-3 text-cyan-400 text-lg font-light drop-shadow-[0_0_8px_#38bdf8]">+</div>
        <div className="absolute -left-3 text-cyan-400 text-lg font-light drop-shadow-[0_0_8px_#38bdf8]">+</div>
        <div className="absolute -right-3 text-cyan-400 text-lg font-light drop-shadow-[0_0_8px_#38bdf8]">+</div>
        
        <div className="absolute top-6 left-6 text-sky-400/70 text-xs font-light">+</div>
        <div className="absolute top-6 right-6 text-sky-400/70 text-xs font-light">+</div>
        <div className="absolute bottom-6 left-6 text-sky-400/70 text-xs font-light">+</div>
        <div className="absolute bottom-6 right-6 text-sky-400/70 text-xs font-light">+</div>
      </div>

      {/* Middle Glowing Ring with Counter-Rotation */}
      <div 
        className="absolute inset-5 rounded-full border border-blue-500/40 pointer-events-none flex items-center justify-center animate-[spin_25s_linear_infinite_reverse]"
      >
        <div className="absolute inset-0 rounded-full border-t-2 border-r-2 border-cyan-400/70 drop-shadow-[0_0_10px_#06b6d4]" />
      </div>

      {/* Inner Glowing Core Container */}
      <div className="relative z-10 w-[78%] h-[78%] rounded-full bg-[#050e24]/90 border border-cyan-500/30 backdrop-blur-xl shadow-[inset_0_0_30px_rgba(6,182,212,0.25)] flex flex-col items-center justify-center p-4 text-center overflow-hidden">
        <div className="absolute inset-0 bg-radial-gradient from-cyan-400/10 via-transparent to-transparent pointer-events-none" />

        {/* AI ASSISTANT Badge */}
        <div className="flex items-center gap-1.5 mb-1 z-10">
          <div className="w-4 h-[1px] bg-cyan-400/50" />
          <span className="text-[9px] font-mono tracking-[0.25em] text-cyan-300 font-semibold uppercase">
            AI ASSISTANT
          </span>
          <div className="w-4 h-[1px] bg-cyan-400/50" />
        </div>

        {/* M.A.Y.A Typography */}
        <div className="relative my-0.5 z-10">
          <h1 className="text-3xl sm:text-4xl font-black tracking-[0.15em] font-display bg-gradient-to-r from-sky-400 via-blue-300 to-fuchsia-400 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(56,189,248,0.7)]">
            M<span className="text-cyan-400 text-xl inline-block px-0.5">.</span>A<span className="text-blue-400 text-xl inline-block px-0.5">.</span>Y<span className="text-purple-400 text-xl inline-block px-0.5">.</span>A
          </h1>
        </div>

        {/* Dynamic Sound Waveform (Responding to state) */}
        <div className="flex items-center justify-center gap-[3px] my-2 h-4 z-10">
          {Array.from({ length: 27 }).map((_, i) => {
            const centerIdx = 13;
            const distFromCenter = Math.abs(i - centerIdx);
            const isBar = distFromCenter <= 6;
            
            let height = 3;
            if (isBar) {
              if (isSpeaking) {
                height = 4 + Math.abs(Math.sin((pulsePhase * 0.1) + i * 0.5)) * 14;
              } else if (isListening) {
                height = 3 + Math.abs(Math.sin((pulsePhase * 0.08) + i * 0.3)) * 9;
              } else {
                height = Math.max(3, 10 - distFromCenter * 1.2);
              }
            }

            return (
              <div
                key={i}
                className={`transition-all duration-150 rounded-full ${
                  isSpeaking
                    ? "bg-fuchsia-400 shadow-[0_0_6px_#e879f9]"
                    : isListening
                    ? "bg-cyan-400 shadow-[0_0_6px_#22d3ee]"
                    : "bg-sky-400/70"
                }`}
                style={{
                  width: isBar ? "2.5px" : "2px",
                  height: isBar ? `${height}px` : "2px",
                  opacity: isBar ? 1 : 0.6,
                }}
              />
            );
          })}
        </div>

        {/* Subtitle Caption */}
        <div className="z-10 max-w-[200px] overflow-hidden">
          <span className="text-[9px] font-mono tracking-[0.2em] font-medium text-cyan-200/90 uppercase line-clamp-1 drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">
            {subtitle}
          </span>
        </div>
      </div>
    </div>
  );
};
