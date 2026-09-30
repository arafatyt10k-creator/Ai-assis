import React, { useState } from "react";
import { 
  Key, 
  Laptop, 
  Sparkles, 
  Check, 
  X, 
  Copy, 
  Zap 
} from "lucide-react";

interface LicenseActivationModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang?: "en" | "bn";
  onActivated?: (key: string) => void;
}

export const LicenseActivationModal: React.FC<LicenseActivationModalProps> = ({
  isOpen,
  onClose,
  lang = "en",
  onActivated
}) => {
  if (!isOpen) return null;
  const isBn = lang === "bn";
  const [licenseKeyInput, setLicenseKeyInput] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [pairingCode] = useState(() => Math.floor(100000 + Math.random() * 900000).toString());
  const [copied, setCopied] = useState(false);

  const handleActivate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!licenseKeyInput.trim()) return;
    setIsSuccess(true);
    setTimeout(() => {
      onActivated?.(licenseKeyInput.trim());
      onClose();
    }, 1200);
  };

  const copyPairingCode = () => {
    navigator.clipboard.writeText(pairingCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-3xl bg-[#081533] border border-cyan-500/40 shadow-2xl p-5 space-y-5 overflow-hidden relative">
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500" />
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-cyan-500/20 text-cyan-300">
              <Zap size={20} className="fill-cyan-300" />
            </div>
            <div>
              <h3 className="text-base font-bold font-display text-white">
                {isBn ? "মায়রা প্রো ও পিসি লিংক অ্যাক্টিভেশন" : "MAYRA Pro & PC Link Activation"}
              </h3>
              <p className="text-[11px] font-mono text-cyan-300/80">
                {isBn ? "আনলিমিটেড টকটাইম ও ডেস্কটপ সিঙ্ক" : "Unlimited Talktime & Desktop Sync"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#061026] border border-white/5 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400">{isBn ? "দৈনিক ফ্রি কোটা" : "Daily Free Quota"}</span>
            <span className="text-cyan-300 font-bold">8:00 min left today</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
            <div className="w-3/4 h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full" />
          </div>
          <p className="text-[10px] font-sans text-slate-400 leading-relaxed">
            {isBn 
              ? "লাইভ ভয়েস স্ট্রিমিং, ইনস্ট্যান্ট স্ক্রিন ভিশন এবং মাল্টি-ডিভাইস সিঙ্ক আনলক করতে আপগ্রেড করুন।"
              : "Upgrade to unlock unlimited live voice streaming, instant screen vision, and multi-device PC syncing."}
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#061026] border border-cyan-500/20 space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-purple-300">
            <Laptop size={15} />
            <span>{isBn ? "পিসি-টু-ফোন পেয়ারিং কোড" : "PC-to-Phone Sync Pairing Code"}</span>
          </div>
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#040914] border border-white/10">
            <span className="text-lg font-mono font-bold tracking-[0.25em] text-white">
              {pairingCode}
            </span>
            <button
              onClick={copyPairingCode}
              className="px-3 py-1 bg-white/5 hover:bg-cyan-500/20 text-cyan-300 rounded-lg text-xs font-mono flex items-center gap-1 transition cursor-pointer"
            >
              {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
              <span>{copied ? (isBn ? "কপি হয়েছে" : "Copied") : (isBn ? "কপি" : "Copy")}</span>
            </button>
          </div>
          <span className="text-[10px] font-mono text-slate-500">
            {isBn ? "আপনার পিসির মায়া ক্লায়েন্টে এই ৬ সংখ্যার পিন লিখুন" : "Enter this 6-digit pin in your PC MAYRA Desktop Client"}
          </span>
        </div>

        <form onSubmit={handleActivate} className="space-y-3">
          <div>
            <label className="text-xs font-mono text-slate-400 block mb-1">
              {isBn ? "লাইসেন্স কি (License Key)" : "Enter License Key"}
            </label>
            <div className="relative flex items-center">
              <Key size={16} className="absolute left-3 text-cyan-400" />
              <input
                type="text"
                value={licenseKeyInput}
                onChange={(e) => setLicenseKeyInput(e.target.value)}
                placeholder="MAYRA-PRO-XXXX-XXXX-XXXX"
                className="w-full bg-[#040914] border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono tracking-wider"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={!licenseKeyInput.trim() || isSuccess}
            className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 hover:opacity-90 disabled:opacity-40 text-white font-bold rounded-xl text-xs font-mono shadow-[0_0_20px_rgba(6,182,212,0.4)] flex items-center justify-center gap-2 transition cursor-pointer"
          >
            {isSuccess ? (
              <>
                <Check size={15} className="text-emerald-300" />
                <span>{isBn ? "সক্রিয় করা হয়েছে!" : "License Successfully Activated!"}</span>
              </>
            ) : (
              <>
                <Sparkles size={15} />
                <span>{isBn ? "লাইসেন্স সক্রিয় করুন" : "Activate License"}</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
