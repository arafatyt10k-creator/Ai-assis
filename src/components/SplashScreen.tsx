import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Sparkles } from "lucide-react";
import { MayraLogo } from "./MayraLogo";

interface SplashScreenProps {
  onComplete: () => void;
  lang?: "en" | "bn";
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete, lang = "en" }) => {
  const [initStage, setInitStage] = useState(0);
  const isBn = lang === "bn";

  const stages = isBn ? [
    "মায়রা কোর শুরু হচ্ছে...",
    "এআই সার্ভিস ও লাইভ লিঙ্ক চেক করা হচ্ছে...",
    "মেমোরি কোর ও প্রেফারেন্স লোড হচ্ছে...",
    "অ্যান্ড্রয়েড পারমিশন ভেরিফিকেশন...",
    "প্রস্তুত..."
  ] : [
    "Initializing MAYRA Core...",
    "Checking AI Studio & Live services...",
    "Restoring memory core & preferences...",
    "Auditing Android permissions...",
    "Ready to assist you."
  ];

  useEffect(() => {
    const t1 = setTimeout(() => setInitStage(1), 350);
    const t2 = setTimeout(() => setInitStage(2), 750);
    const t3 = setTimeout(() => setInitStage(3), 1150);
    const t4 = setTimeout(() => setInitStage(4), 1550);
    const t5 = setTimeout(() => onComplete(), 1950);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
    };
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-100 bg-[#040814] text-white flex flex-col items-center justify-between p-8 select-none overflow-hidden"
    >
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] h-[420px] bg-cyan-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-[350px] h-[350px] bg-purple-600/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(56,189,248,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(56,189,248,0.02)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

      <div className="h-10" />

      <div className="relative flex flex-col items-center justify-center">
        <div className="relative w-48 h-48 sm:w-56 sm:h-56 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border border-cyan-400/30 border-dashed animate-[spin_20s_linear_infinite]" />
          <div className="absolute inset-3 rounded-full border border-blue-500/40 border-t-2 border-t-cyan-300 animate-[spin_12s_linear_infinite_reverse] drop-shadow-[0_0_12px_rgba(6,182,212,0.6)]" />
          
          <div className="absolute -top-3 text-cyan-400 text-lg font-light drop-shadow-[0_0_8px_#38bdf8]">+</div>
          <div className="absolute -bottom-3 text-cyan-400 text-lg font-light drop-shadow-[0_0_8px_#38bdf8]">+</div>
          <div className="absolute -left-3 text-cyan-400 text-lg font-light drop-shadow-[0_0_8px_#38bdf8]">+</div>
          <div className="absolute -right-3 text-cyan-400 text-lg font-light drop-shadow-[0_0_8px_#38bdf8]">+</div>

          <div className="relative z-10 w-24 h-24 rounded-3xl bg-[#050e24]/90 border border-cyan-400/50 backdrop-blur-xl shadow-[0_0_35px_rgba(6,182,212,0.4)] flex items-center justify-center p-3">
            <MayraLogo size="lg" />
          </div>
        </div>

        <div className="mt-6 text-center">
          <h1 className="text-3xl sm:text-4xl font-black tracking-[0.2em] font-display bg-gradient-to-r from-sky-400 via-blue-300 to-fuchsia-400 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(56,189,248,0.6)]">
            MAYRA <span className="text-cyan-400 text-xl font-mono">AI</span>
          </h1>
          <p className="text-xs font-mono text-cyan-300/70 tracking-[0.3em] uppercase mt-1">
            Premium Android Assistant
          </p>
        </div>
      </div>

      <div className="w-full max-w-xs space-y-3 z-20 mb-6">
        <div className="flex items-center justify-between text-[11px] font-mono">
          <span className="text-cyan-300 flex items-center gap-1.5">
            <Sparkles size={12} className="animate-spin text-cyan-400" />
            <span>{stages[initStage]}</span>
          </span>
          <span className="text-slate-400 font-bold">
            {Math.round(((initStage + 1) / stages.length) * 100)}%
          </span>
        </div>
        <div className="w-full h-1.5 rounded-full bg-slate-900 border border-white/10 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-fuchsia-500 rounded-full shadow-[0_0_10px_#22d3ee]"
            initial={{ width: "10%" }}
            animate={{ width: `${((initStage + 1) / stages.length) * 100}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
        <div className="text-center text-[10px] font-mono text-slate-500">
          Gemini Live 2.5 • Vision & Memory Core v2.5
        </div>
      </div>
    </motion.div>
  );
};
