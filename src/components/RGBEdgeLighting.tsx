import React, { useMemo } from "react";
import { LiveState } from "../lib/audio";

export type RGBColorPreset = "rainbow" | "cyan" | "blue" | "purple" | "amber" | "emerald" | "custom";

export interface RGBEdgeLightingConfig {
  enabled: boolean;
  preset: RGBColorPreset;
  customColor?: string;
  speed: "slow" | "normal" | "fast";
  intensity: number; // 0 to 100
  ambientAlwaysOn: boolean;
  batterySaver: boolean;
  reduceMotion: boolean;
}

interface RGBEdgeLightingProps {
  state: LiveState;
  config: RGBEdgeLightingConfig;
}

export const RGBEdgeLighting: React.FC<RGBEdgeLightingProps> = ({
  state,
  config
}) => {
  if (!config.enabled) return null;

  const isActive = state === "listening" || state === "speaking" || state === "connecting";
  const isListening = state === "listening";
  const isSpeaking = state === "speaking";
  const isConnecting = state === "connecting";

  if (!isActive && !config.ambientAlwaysOn) {
    return null;
  }

  const animationDuration = useMemo(() => {
    if (config.reduceMotion) return "0s";
    if (config.batterySaver) return "10s";
    switch (config.speed) {
      case "slow": return "8s";
      case "fast": return "2.5s";
      case "normal":
      default: return "4s";
    }
  }, [config.speed, config.batterySaver, config.reduceMotion]);

  const opacityFactor = useMemo(() => {
    const base = (config.intensity / 100);
    if (isListening || isSpeaking) return Math.min(1, base * 1.25);
    if (isConnecting) return base * 0.9;
    return base * 0.55;
  }, [config.intensity, isListening, isSpeaking, isConnecting]);

  const gradientString = useMemo(() => {
    switch (config.preset) {
      case "cyan":
        return "linear-gradient(90deg, #06b6d4, #3b82f6, #0284c7, #22d3ee, #06b6d4)";
      case "blue":
        return "linear-gradient(90deg, #1e40af, #3b82f6, #60a5fa, #2563eb, #1e40af)";
      case "purple":
        return "linear-gradient(90deg, #9333ea, #c084fc, #e879f9, #7e22ce, #9333ea)";
      case "amber":
        return "linear-gradient(90deg, #d97706, #fbbf24, #f59e0b, #b45309, #d97706)";
      case "emerald":
        return "linear-gradient(90deg, #059669, #34d399, #10b981, #047857, #059669)";
      case "custom":
        const col = config.customColor || "#22d3ee";
        return `linear-gradient(90deg, ${col}, #3b82f6, ${col})`;
      case "rainbow":
      default:
        return "linear-gradient(90deg, #ff007a, #a855f7, #06b6d4, #10b981, #f59e0b, #ff007a)";
    }
  }, [config.preset, config.customColor]);

  return (
    <div 
      className="fixed inset-0 pointer-events-none z-50 overflow-hidden"
      style={{
        opacity: opacityFactor,
        transition: "opacity 0.4s ease-in-out"
      }}
    >
      <div 
        className="absolute inset-0 rounded-[28px] sm:rounded-[36px] p-[3px] sm:p-[4px]"
        style={{
          background: gradientString,
          backgroundSize: config.reduceMotion ? "100% 100%" : "300% 300%",
          animation: config.reduceMotion ? "none" : `rgb-flow ${animationDuration} linear infinite`,
          WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
        }}
      />
      <div 
        className="absolute inset-0 rounded-[28px] sm:rounded-[36px] pointer-events-none"
        style={{
          boxShadow: isListening 
            ? "inset 0 0 25px rgba(6, 182, 212, 0.45), inset 0 0 10px rgba(168, 85, 247, 0.35)" 
            : isSpeaking
            ? "inset 0 0 28px rgba(232, 121, 249, 0.5), inset 0 0 12px rgba(56, 189, 248, 0.4)"
            : "inset 0 0 16px rgba(6, 182, 212, 0.25)",
          transition: "box-shadow 0.3s ease"
        }}
      />
      <div 
        className="absolute -top-10 inset-x-0 h-20 bg-gradient-to-b from-cyan-500/15 via-transparent to-transparent blur-md"
      />
      <div 
        className="absolute -bottom-10 inset-x-0 h-20 bg-gradient-to-t from-blue-500/15 via-transparent to-transparent blur-md"
      />
    </div>
  );
};
