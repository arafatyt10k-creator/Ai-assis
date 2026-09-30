import React from "react";
import { 
  Home, 
  QrCode, 
  Brain, 
  MessageSquare, 
  BookOpen, 
  Music, 
  Heart, 
  Smartphone, 
  Settings, 
  Bell, 
  Monitor, 
  X, 
  Activity, 
  Zap, 
  Globe, 
  ShieldCheck 
} from "lucide-react";
import { MayraLogo } from "./MayraLogo";
import { Language, translations } from "../lib/translations";

interface NavigationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: string;
  onNavigate: (route: string) => void;
  isScreenSharing?: boolean;
  onToggleScreenShare?: () => void;
  currentLanguage?: Language;
  onToggleLanguage?: () => void;
}

export const NavigationDrawer: React.FC<NavigationDrawerProps> = ({
  isOpen,
  onClose,
  activeTab,
  onNavigate,
  isScreenSharing = false,
  onToggleScreenShare,
  currentLanguage = "en",
  onToggleLanguage
}) => {
  if (!isOpen) return null;
  const isBn = currentLanguage === "bn";
  const t = translations[currentLanguage];

  const menuItems = [
    { id: "home", label: t.homeTab, icon: Home, badge: "Main" },
    { id: "apk_hub", label: isBn ? "এপিকে ও মোবাইল ইনস্টল" : "APK & Mobile Install", icon: Smartphone, badge: "APK" },
    { id: "scan", label: isBn ? "ভিশন ও স্ক্যানার" : "Vision & Scanner", icon: QrCode },
    { id: "chat", label: t.chatTab, icon: MessageSquare },
    { id: "memories", label: t.memoriesTab, icon: Brain },
    { id: "study", label: t.study, icon: BookOpen },
    { id: "music", label: t.music, icon: Music },
    { id: "journal", label: t.journal, icon: Heart },
    { id: "phone", label: t.phoneControl, icon: Smartphone },
    { id: "permission_wizard", label: isBn ? "পারমিশন উইজার্ড" : "Permission Wizard", icon: ShieldCheck, badge: "Setup" },
    { id: "action_history", label: t.actionHistory, icon: Activity, badge: "New" },
    { id: "notifications", label: t.notifications, icon: Bell },
    { id: "license", label: isBn ? "প্রো ও পিসি লিংক" : "Pro & PC Link", icon: Zap },
    { id: "settings", label: t.settings, icon: Settings },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex">
      <div 
        className="w-full max-w-[300px] h-full bg-[#050e24] border-r border-cyan-500/20 shadow-2xl flex flex-col justify-between p-5 overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          <div className="flex items-center justify-between pb-4 mb-3 border-b border-white/5">
            <MayraLogo size="md" showText />
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>

          <div className="mb-3 p-2 rounded-2xl bg-[#061026] border border-cyan-500/20 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-300">
              <Globe size={14} />
              <span>{isBn ? "ভাষা: বাংলা" : "Language: English"}</span>
            </div>
            <button
              onClick={onToggleLanguage}
              className="px-2.5 py-1 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-[10px] font-mono border border-cyan-400/40 transition cursor-pointer"
            >
              {isBn ? "Switch English" : "বাংলা"}
            </button>
          </div>

          <div className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id);
                    onClose();
                  }}
                  className={`w-full p-2.5 rounded-2xl border text-left text-xs font-mono font-medium flex items-center justify-between transition cursor-pointer ${
                    isActive
                      ? "bg-cyan-500/20 border-cyan-400/50 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.25)]"
                      : "bg-transparent border-transparent text-slate-300 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={16} className={isActive ? "text-cyan-400" : "text-slate-400"} />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="pt-4 mt-4 border-t border-white/5 space-y-2">
          {onToggleScreenShare && (
            <button
              onClick={() => {
                onToggleScreenShare();
                onClose();
              }}
              className={`w-full p-2.5 rounded-xl border text-xs font-mono flex items-center justify-center gap-2 transition cursor-pointer ${
                isScreenSharing
                  ? "bg-cyan-500/20 border-cyan-400 text-cyan-300 animate-pulse"
                  : "bg-white/5 hover:bg-white/10 border-white/10 text-slate-300 hover:text-white"
              }`}
            >
              <Monitor size={14} />
              <span>{isScreenSharing ? (isBn ? "স্ক্রিন ভিশন সক্রিয়" : "Screen Vision Active") : (isBn ? "স্ক্রিন শেয়ার করুন" : "Share Screen")}</span>
            </button>
          )}
          <div className="text-center text-[10px] font-mono text-slate-500 pt-1">
            MAYRA AI v2.5 Android Edition
          </div>
        </div>
      </div>

      <div className="flex-1 h-full" onClick={onClose} />
    </div>
  );
};
