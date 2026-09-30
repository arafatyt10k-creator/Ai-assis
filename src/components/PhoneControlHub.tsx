import React, { useState, useEffect } from "react";
import { 
  Smartphone, 
  Phone, 
  MessageSquare, 
  Send, 
  Flashlight, 
  Volume2, 
  Battery, 
  Wifi, 
  X, 
  Search, 
  ExternalLink, 
  Compass, 
  AlertTriangle 
} from "lucide-react";

interface PhoneControlHubProps {
  onClose?: () => void;
}

interface Contact {
  name: string;
  phone: string;
  role: string;
}

export const PhoneControlHub: React.FC<PhoneControlHubProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<"actions" | "calls" | "sms" | "whatsapp" | "apps">("actions");
  
  const [contacts] = useState<Contact[]>([
    { name: "Alex Chen", phone: "+1 (555) 234-5678", role: "Work / Engineering" },
    { name: "Sarah Miller", phone: "+1 (555) 876-5432", role: "Design Lead" },
    { name: "Family Line", phone: "+1 (555) 999-0000", role: "Home" },
    { name: "Medical Clinic", phone: "+1 (555) 444-1234", role: "Services" },
  ]);
  const [searchContact, setSearchContact] = useState<string>("");

  const [targetPhone, setTargetPhone] = useState<string>("+1 (555) 234-5678");
  const [targetName, setTargetName] = useState<string>("Alex Chen");
  const [messageDraft, setMessageDraft] = useState<string>("Hey Alex, checking in regarding our MAYRA assistant roadmap. Let's sync tomorrow at 10 AM!");

  const [pendingAction, setPendingAction] = useState<{
    type: "call" | "sms" | "whatsapp";
    recipient: string;
    number: string;
    message?: string;
  } | null>(null);

  const [batteryLevel, setBatteryLevel] = useState<number | null>(null);
  const [isCharging, setIsCharging] = useState<boolean>(false);
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== "undefined" ? navigator.onLine : true);
  const [torchActive, setTorchActive] = useState<boolean>(false);

  useEffect(() => {
    if (typeof navigator !== "undefined" && "getBattery" in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        setBatteryLevel(Math.round(battery.level * 100));
        setIsCharging(battery.charging);
        battery.addEventListener("levelchange", () => {
          setBatteryLevel(Math.round(battery.level * 100));
        });
        battery.addEventListener("chargingchange", () => {
          setIsCharging(battery.charging);
        });
      });
    }

    const updateOnline = () => setIsOnline(navigator.onLine);
    window.addEventListener("online", updateOnline);
    window.addEventListener("offline", updateOnline);
    return () => {
      window.removeEventListener("online", updateOnline);
      window.removeEventListener("offline", updateOnline);
    };
  }, []);

  const initiateCallConfirmation = (c: Contact) => {
    setPendingAction({
      type: "call",
      recipient: c.name,
      number: c.phone
    });
  };

  const initiateSMSConfirmation = () => {
    setPendingAction({
      type: "sms",
      recipient: targetName || targetPhone,
      number: targetPhone,
      message: messageDraft
    });
  };

  const initiateWhatsAppConfirmation = () => {
    setPendingAction({
      type: "whatsapp",
      recipient: targetName || targetPhone,
      number: targetPhone,
      message: messageDraft
    });
  };

  const executeConfirmedAction = () => {
    if (!pendingAction) return;
    if (pendingAction.type === "call") {
      const cleanNumber = pendingAction.number.replace(/[^0-9+]/g, "");
      window.location.href = `tel:${cleanNumber}`;
    } else if (pendingAction.type === "sms") {
      const cleanNumber = pendingAction.number.replace(/[^0-9+]/g, "");
      window.location.href = `sms:${cleanNumber}?body=${encodeURIComponent(pendingAction.message || "")}`;
    } else if (pendingAction.type === "whatsapp") {
      const cleanNumber = pendingAction.number.replace(/[^0-9]/g, "");
      const waUrl = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(pendingAction.message || "")}`;
      window.open(waUrl, "_blank");
    }
    setPendingAction(null);
  };

  const appShortcuts = [
    { name: "YouTube", url: "https://youtube.com", icon: "🎬" },
    { name: "Google Maps", url: "https://maps.google.com", icon: "🗺️" },
    { name: "WhatsApp", url: "https://web.whatsapp.com", icon: "💬" },
    { name: "Spotify", url: "https://open.spotify.com", icon: "🎵" },
    { name: "Google Chrome", url: "https://google.com", icon: "🌐" },
    { name: "Camera App", url: "#", action: "camera", icon: "📸" },
    { name: "Calculator", url: "#", action: "calc", icon: "🔢" },
    { name: "Settings Hub", url: "#", action: "settings", icon: "⚙️" },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-[#040814] text-white flex flex-col justify-between overflow-hidden">
      <header className="p-4 flex items-center justify-between border-b border-sky-900/30 bg-[#061026]/95 backdrop-blur-md z-20">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300">
            <Smartphone size={20} />
          </div>
          <div>
            <h2 className="text-base font-bold font-display tracking-wide">Phone Control Hub</h2>
            <p className="text-[11px] font-mono text-cyan-300/70">Android System Intents & Communications</p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition cursor-pointer"
          >
            <X size={18} />
          </button>
        )}
      </header>

      <div className="flex items-center gap-1.5 p-3 bg-[#050c1c] border-b border-white/5 overflow-x-auto z-20">
        {[
          { id: "actions", label: "Device Controls", icon: Smartphone },
          { id: "calls", label: "Calls & Contacts", icon: Phone },
          { id: "sms", label: "SMS Composer", icon: MessageSquare },
          { id: "whatsapp", label: "WhatsApp Chat", icon: Send },
          { id: "apps", label: "App Launchers", icon: Compass },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-medium transition cursor-pointer shrink-0 ${
                isActive
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-[0_0_10px_rgba(6,182,212,0.3)]"
                  : "bg-white/5 text-slate-400 hover:text-white"
              }`}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <div className="flex-1 overflow-y-auto p-4 max-w-3xl mx-auto w-full space-y-4">
        {activeTab === "actions" && (
          <div className="space-y-4">
            <div className="p-4 rounded-3xl bg-[#081533] border border-cyan-500/20 shadow-xl grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-2xl bg-[#061026] border border-white/5 flex items-center gap-3">
                <Battery size={24} className={isCharging ? "text-emerald-400 animate-pulse" : "text-cyan-400"} />
                <div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Battery</span>
                  <p className="text-sm font-bold font-mono text-white">
                    {batteryLevel !== null ? `${batteryLevel}%` : "85% (Optimized)"}
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-[#061026] border border-white/5 flex items-center gap-3">
                <Wifi size={24} className={isOnline ? "text-cyan-400" : "text-rose-400"} />
                <div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Network</span>
                  <p className="text-sm font-bold font-mono text-white">
                    {isOnline ? "5G / Wi-Fi Active" : "Offline"}
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-[#061026] border border-white/5 flex items-center gap-3">
                <Smartphone size={24} className="text-purple-400" />
                <div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase">OS Runtime</span>
                  <p className="text-sm font-bold font-mono text-white">Android Web Intent</p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-3xl bg-[#061026] border border-white/10 shadow-lg space-y-3">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-300">
                Hardware & System Quick Actions
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setTorchActive(!torchActive)}
                  className={`p-4 rounded-2xl border transition flex items-center justify-between cursor-pointer ${
                    torchActive 
                      ? "bg-amber-500/20 border-amber-400 text-amber-300 shadow-[0_0_15px_#f59e0b]" 
                      : "bg-[#081533] border-white/5 hover:border-white/20 text-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Flashlight size={20} />
                    <div className="text-left">
                      <div className="text-xs font-bold font-display">Torch / Light</div>
                      <div className="text-[10px] font-mono text-slate-400">{torchActive ? "Enabled" : "Disabled"}</div>
                    </div>
                  </div>
                  <div className={`w-3 h-3 rounded-full ${torchActive ? "bg-amber-400 shadow-[0_0_8px_#f59e0b]" : "bg-white/10"}`} />
                </button>

                <button
                  onClick={() => {
                    const audio = new Audio("data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU"+Array(200).join("120"));
                    audio.play().catch(() => {});
                  }}
                  className="p-4 rounded-2xl bg-[#081533] border border-white/5 hover:border-cyan-500/40 text-slate-300 hover:text-white transition flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <Volume2 size={20} className="text-cyan-400" />
                    <div className="text-left">
                      <div className="text-xs font-bold font-display">Sound Speaker</div>
                      <div className="text-[10px] font-mono text-slate-400">Test Chime</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-cyan-400">Play</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "calls" && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 bg-[#081533] border border-cyan-500/30 rounded-2xl px-3 py-2">
              <Search size={16} className="text-cyan-400" />
              <input
                type="text"
                value={searchContact}
                onChange={(e) => setSearchContact(e.target.value)}
                placeholder="Search contacts..."
                className="w-full bg-transparent text-xs text-white placeholder:text-slate-500 focus:outline-none font-sans"
              />
            </div>

            <div className="space-y-2">
              {contacts
                .filter(c => c.name.toLowerCase().includes(searchContact.toLowerCase()) || c.phone.includes(searchContact))
                .map((contact, i) => (
                  <div
                    key={i}
                    className="p-3.5 rounded-2xl bg-[#061026] border border-white/5 hover:border-cyan-500/30 shadow-md flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500/20 to-blue-600/20 border border-cyan-400/30 flex items-center justify-center font-bold text-cyan-300 text-sm">
                        {contact.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white font-sans">{contact.name}</h4>
                        <p className="text-[11px] font-mono text-cyan-300/80">{contact.phone}</p>
                        <span className="text-[9px] font-mono text-slate-500 uppercase">{contact.role}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => initiateCallConfirmation(contact)}
                        className="p-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/40 text-emerald-300 flex items-center gap-1.5 text-xs font-mono shadow-md transition cursor-pointer"
                      >
                        <Phone size={14} />
                        <span>Call</span>
                      </button>
                      <button
                        onClick={() => {
                          setTargetName(contact.name);
                          setTargetPhone(contact.phone);
                          setActiveTab("sms");
                        }}
                        className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition cursor-pointer"
                        title="Draft SMS"
                      >
                        <MessageSquare size={14} />
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {activeTab === "sms" && (
          <div className="p-4 rounded-3xl bg-[#061026] border border-cyan-500/20 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-300">
                SMS Message Dispatcher
              </h3>
              <span className="text-[10px] font-mono text-slate-400">Uses Android SMS Intent</span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-mono text-slate-400 block mb-1">Recipient Name / Phone</label>
                <input
                  type="text"
                  value={targetPhone}
                  onChange={(e) => setTargetPhone(e.target.value)}
                  className="w-full bg-[#040914] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] font-mono text-slate-400 block mb-1">Message Preview</label>
                <textarea
                  value={messageDraft}
                  onChange={(e) => setMessageDraft(e.target.value)}
                  rows={4}
                  className="w-full bg-[#040914] border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-cyan-400 font-sans resize-none"
                />
                <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1">
                  <span>Character count: {messageDraft.length}</span>
                  <span>1 SMS segment</span>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={initiateSMSConfirmation}
                  className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 hover:opacity-90 text-white font-bold rounded-xl text-xs font-mono shadow-[0_0_15px_rgba(6,182,212,0.4)] flex items-center gap-2 transition cursor-pointer"
                >
                  <Send size={14} />
                  <span>Review & Send SMS</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "whatsapp" && (
          <div className="p-4 rounded-3xl bg-[#061026] border border-emerald-500/30 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-300">
                WhatsApp Direct Link & Intent
              </h3>
              <span className="text-[10px] font-mono text-emerald-400">Official Web/App Intent</span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-mono text-slate-400 block mb-1">Phone Number (with Country Code)</label>
                <input
                  type="text"
                  value={targetPhone}
                  onChange={(e) => setTargetPhone(e.target.value)}
                  placeholder="+1234567890"
                  className="w-full bg-[#040914] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-400 font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] font-mono text-slate-400 block mb-1">Message Text</label>
                <textarea
                  value={messageDraft}
                  onChange={(e) => setMessageDraft(e.target.value)}
                  rows={4}
                  className="w-full bg-[#040914] border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-400 font-sans resize-none"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={initiateWhatsAppConfirmation}
                  className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs font-mono shadow-[0_0_15px_rgba(16,185,129,0.4)] flex items-center gap-2 transition cursor-pointer"
                >
                  <Send size={14} />
                  <span>Open WhatsApp Chat</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "apps" && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {appShortcuts.map((app, idx) => (
              <a
                key={idx}
                href={app.url}
                target={app.url.startsWith("http") ? "_blank" : undefined}
                rel="noreferrer"
                className="p-4 rounded-2xl bg-[#061026] border border-white/5 hover:border-cyan-400/40 hover:bg-[#081533] transition flex flex-col items-center justify-center gap-2 text-center group shadow-md"
              >
                <span className="text-2xl group-hover:scale-110 transition transform">{app.icon}</span>
                <span className="text-xs font-bold text-white font-sans">{app.name}</span>
                <span className="text-[9px] font-mono text-slate-500 flex items-center gap-0.5">
                  <span>Launch</span>
                  <ExternalLink size={9} />
                </span>
              </a>
            ))}
          </div>
        )}
      </div>

      {pendingAction && (
        <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="p-5 rounded-3xl bg-[#081533] border border-cyan-400/50 shadow-2xl max-w-sm w-full space-y-4">
            <div className="flex items-center gap-2.5 text-amber-400">
              <AlertTriangle size={20} />
              <h3 className="text-sm font-bold font-display uppercase tracking-wide text-white">
                Confirm Outgoing Action
              </h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              Maya is preparing to initiate a <strong className="text-cyan-300 uppercase">{pendingAction.type}</strong> to:
            </p>
            <div className="p-3 rounded-2xl bg-[#040914] border border-white/10 space-y-1">
              <div className="text-xs font-bold text-white">{pendingAction.recipient}</div>
              <div className="text-xs font-mono text-cyan-300">{pendingAction.number}</div>
              {pendingAction.message && (
                <div className="text-[11px] text-slate-400 font-sans italic border-t border-white/5 pt-1 mt-1 line-clamp-3">
                  &ldquo;{pendingAction.message}&rdquo;
                </div>
              )}
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setPendingAction(null)}
                className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-slate-300 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={executeConfirmedAction}
                className="flex-1 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs font-mono shadow-[0_0_15px_rgba(6,182,212,0.4)] transition cursor-pointer"
              >
                Confirm & Open
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
