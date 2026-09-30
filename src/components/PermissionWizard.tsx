import React, { useState, useEffect } from "react";
import { 
  Mic, 
  Camera, 
  Phone, 
  BookUser, 
  MessageSquare, 
  MapPin, 
  Image as ImageIcon, 
  Headphones, 
  BatteryCharging, 
  Layers, 
  Bell, 
  Accessibility, 
  Sparkles, 
  Check, 
  ChevronRight, 
  X,
  AlertCircle
} from "lucide-react";
import { MayraLogo } from "./MayraLogo";

interface PermissionWizardProps {
  onComplete: () => void;
  onClose?: () => void;
  lang?: "en" | "bn";
}

interface PermissionItem {
  id: string;
  name: string;
  desc: string;
  icon: any;
  status: "granted" | "pending" | "denied";
  required?: boolean;
}

export const PermissionWizard: React.FC<PermissionWizardProps> = ({
  onComplete,
  onClose,
  lang = "en"
}) => {
  const [step, setStep] = useState<number>(2);
  const isBn = lang === "bn";

  const [phonePermissions, setPhonePermissions] = useState<PermissionItem[]>([
    {
      id: "mic",
      name: isBn ? "মাইক্রোফোন" : "Microphone",
      desc: isBn ? "যাতে আপনি মায়ার সাথে কথা বলতে পারেন। আবশ্যক।" : "So you can talk to Maya. Required.",
      icon: Mic,
      status: "pending",
      required: true
    },
    {
      id: "camera",
      name: isBn ? "ক্যামেরা" : "Camera",
      desc: isBn ? "ছবি তোলা ও ভিশন স্ক্যান করার জন্য।" : "So she can take a photo or look at what you point the phone at.",
      icon: Camera,
      status: "pending"
    },
    {
      id: "calls",
      name: isBn ? "ফোন কল" : "Phone calls",
      desc: isBn ? "যাতে সে আপনার জন্য কল করতে পারে।" : "So she can place a call for you.",
      icon: Phone,
      status: "pending"
    },
    {
      id: "contacts",
      name: isBn ? "যোগাযোগ তালিকা" : "Contacts",
      desc: isBn ? "নাম শুনে নম্বর বের করার জন্য।" : "So a name is enough — she looks up the number.",
      icon: BookUser,
      status: "pending"
    },
    {
      id: "sms",
      name: isBn ? "এসএমএস" : "SMS",
      desc: isBn ? "টেক্সট মেসেজ পাঠানোর জন্য।" : "So she can send a text message.",
      icon: MessageSquare,
      status: "pending"
    },
    {
      id: "location",
      name: isBn ? "লোকেশন" : "Location",
      desc: isBn ? "আবহাওয়া এবং নেভিগেশন জন্য।" : "Weather, navigation, and where you are.",
      icon: MapPin,
      status: "pending"
    },
    {
      id: "gallery",
      name: isBn ? "গ্যালারি ও ফাইল" : "Gallery & files",
      desc: isBn ? "ছবি ও ফাইল খুঁজে বের করার জন্য।" : "So she can find a photo or file and send it.",
      icon: ImageIcon,
      status: "pending"
    },
    {
      id: "manage_calls",
      name: isBn ? "কল ব্যবস্থাপনা" : "Answer & manage calls",
      desc: isBn ? "কে কল করছে ঘোষণা করতে ও রিসিভ করতে।" : "So she can announce who is calling and answer or reject it.",
      icon: Headphones,
      status: "pending"
    }
  ]);

  const [bgPermissions, setBgPermissions] = useState<PermissionItem[]>([
    {
      id: "battery",
      name: isBn ? "ব্যাটারি অপটিমাইজেশন বন্ধ" : "Battery — no optimisation",
      desc: isBn ? "আবশ্যক। ব্যাকগ্রাউন্ডে মায়া চালু রাখার জন্য।" : "Required. Without it the phone kills Maya in the background and she goes quiet. Tap, then choose Allow.",
      icon: BatteryCharging,
      status: "granted",
      required: true
    },
    {
      id: "overlay",
      name: isBn ? "অন্য অ্যাপের উপর প্রদর্শন" : "Display over other apps",
      desc: isBn ? "স্ক্রিনের উপর মায়ার অর্ব প্রদর্শন করার জন্য।" : "So her orb can float on top of whatever you are doing.",
      icon: Layers,
      status: "granted"
    },
    {
      id: "notifications",
      name: isBn ? "বিজ্ঞপ্তি অ্যাক্সেস" : "Notification access",
      desc: isBn ? "মেসেজ পড়তে ও ইনকামিং কল জানতে।" : "To read WhatsApp messages and know who is calling. Turn on \"Maya\" in the list.",
      icon: Bell,
      status: "granted"
    },
    {
      id: "accessibility",
      name: isBn ? "অ্যাক্সেসিবিলিটি সার্ভিস" : "Accessibility service",
      desc: isBn ? "অ্যাপ খোলা ও স্ক্রিন ট্যাপ করার জন্য।" : "So she can open apps, tap, and read the screen for you. Turn on \"Maya\" in the list.",
      icon: Accessibility,
      status: "pending"
    },
    {
      id: "default_assistant",
      name: isBn ? "ডিফল্ট অ্যাসিস্ট্যান্ট" : "Default assistant",
      desc: isBn ? "পাওয়ার বাটন চেপে সরাসরি মায়াকে ডাকতে।" : "Long-press the power button or swipe from a corner to call her, even on the lock screen.",
      icon: Headphones,
      status: "pending"
    }
  ]);

  useEffect(() => {
    if (typeof navigator !== "undefined" && navigator.permissions) {
      navigator.permissions.query({ name: "microphone" as any }).then(p => {
        if (p.state === "granted") {
          updatePhonePermStatus("mic", "granted");
        }
      }).catch(() => {});
      navigator.permissions.query({ name: "camera" as any }).then(p => {
        if (p.state === "granted") {
          updatePhonePermStatus("camera", "granted");
        }
      }).catch(() => {});
      navigator.permissions.query({ name: "geolocation" as any }).then(p => {
        if (p.state === "granted") {
          updatePhonePermStatus("location", "granted");
        }
      }).catch(() => {});
    }
  }, []);

  const updatePhonePermStatus = (id: string, status: "granted" | "pending" | "denied") => {
    setPhonePermissions(prev => prev.map(item => item.id === id ? { ...item, status } : item));
  };

  const updateBgPermStatus = (id: string, status: "granted" | "pending" | "denied") => {
    setBgPermissions(prev => prev.map(item => item.id === id ? { ...item, status } : item));
  };

  const handleRequestPermission = async (item: PermissionItem) => {
    if (item.id === "mic") {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(t => t.stop());
        updatePhonePermStatus("mic", "granted");
      } catch (err) {
        updatePhonePermStatus("mic", "denied");
      }
    } else if (item.id === "camera") {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        stream.getTracks().forEach(t => t.stop());
        updatePhonePermStatus("camera", "granted");
      } catch (err) {
        updatePhonePermStatus("camera", "denied");
      }
    } else if (item.id === "location") {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          () => updatePhonePermStatus("location", "granted"),
          () => updatePhonePermStatus("location", "denied")
        );
      }
    } else {
      updatePhonePermStatus(item.id, item.status === "granted" ? "pending" : "granted");
    }
  };

  const handleAllowAll = async () => {
    try {
      const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioStream.getTracks().forEach(t => t.stop());
      updatePhonePermStatus("mic", "granted");
    } catch {}
    try {
      const videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoStream.getTracks().forEach(t => t.stop());
      updatePhonePermStatus("camera", "granted");
    } catch {}
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        () => updatePhonePermStatus("location", "granted"),
        () => {}
      );
    }
    setPhonePermissions(prev => prev.map(p => ({ ...p, status: "granted" })));
  };

  return (
    <div className="fixed inset-0 z-90 bg-[#040914] text-white flex flex-col justify-between overflow-hidden select-none">
      <header className="p-4 pt-5 border-b border-sky-900/30 bg-[#061026]/95 backdrop-blur-md z-20">
        <div className="flex items-center justify-between max-w-md mx-auto w-full">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#081533] border border-cyan-400/40 p-1 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.3)]">
              <MayraLogo size="sm" />
            </div>
            <div>
              <h2 className="text-base font-bold font-display tracking-wide text-white">
                {isBn ? "মায়া সেটআপ" : "Set up Maya"}
              </h2>
              <p className="text-[11px] font-mono text-cyan-300">
                {isBn ? `ধাপ ${step} / ৩` : `Step ${step} of 3`}
              </p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition"
            >
              <X size={18} />
            </button>
          )}
        </div>

        <div className="grid grid-cols-3 gap-2 mt-3 max-w-md mx-auto w-full">
          <div className={`h-1 rounded-full ${step >= 1 ? "bg-blue-500 shadow-[0_0_6px_#3b82f6]" : "bg-white/10"}`} />
          <div className={`h-1 rounded-full ${step >= 2 ? "bg-blue-500 shadow-[0_0_6px_#3b82f6]" : "bg-white/10"}`} />
          <div className={`h-1 rounded-full ${step >= 3 ? "bg-blue-500 shadow-[0_0_6px_#3b82f6]" : "bg-white/10"}`} />
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 max-w-md mx-auto w-full space-y-4">
        {step === 1 && (
          <div className="py-8 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-20 h-20 rounded-full bg-blue-600/20 border border-blue-400/50 flex items-center justify-center shadow-[0_0_30px_rgba(59,130,246,0.4)]">
              <Mic size={36} className="text-cyan-300" />
            </div>
            <h3 className="text-xl font-bold font-display text-white">
              {isBn ? "ভয়েস অ্যাসিস্ট্যান্ট সক্ষম করুন" : "Enable Voice Assistant"}
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed max-w-xs font-sans">
              {isBn 
                ? "মায়ার সাথে সরাসরি কথা বলার জন্য মাইক্রোফোন পারমিশন প্রয়োজন।"
                : "Maya needs microphone access to listen to your voice and process real-time voice conversations."}
            </p>
            <button
              onClick={async () => {
                try {
                  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                  stream.getTracks().forEach(t => t.stop());
                  updatePhonePermStatus("mic", "granted");
                  setStep(2);
                } catch {
                  setStep(2);
                }
              }}
              className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm font-sans shadow-[0_0_20px_rgba(59,130,246,0.4)] transition"
            >
              {isBn ? "মাইক্রোফোন অনুমতি দিন" : "Allow Microphone"}
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-3">
            <div>
              <h3 className="text-lg font-bold font-display text-white">
                {isBn ? "মায়াকে ফোন ফিচার ব্যবহারের অনুমতি দিন" : "Let Maya use your phone"}
              </h3>
              <p className="text-xs text-slate-400 font-sans mt-0.5 leading-relaxed">
                {isBn 
                  ? "এক ট্যাপে অনুমতি দিন। কেবল মাইক্রোফোন বাধ্যতামূলক; বাকিগুলো মায়াকে আরও দক্ষ করে তোলে।"
                  : "One tap — Android asks for each in turn. Only the microphone is required; the rest make her useful."}
              </p>
            </div>

            <div className="space-y-2.5 pt-1">
              {phonePermissions.map((perm) => {
                const Icon = perm.icon;
                const isGranted = perm.status === "granted";
                return (
                  <div
                    key={perm.id}
                    onClick={() => handleRequestPermission(perm)}
                    className={`p-3.5 rounded-2xl border transition flex items-center justify-between cursor-pointer ${
                      isGranted 
                        ? "bg-[#06142e] border-blue-500/40" 
                        : "bg-[#061026] border-white/5 hover:border-white/15"
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-2xl bg-[#081836] border border-white/10 flex items-center justify-center shrink-0">
                        <Icon size={18} className={isGranted ? "text-cyan-400" : "text-blue-400"} />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-xs font-bold font-display text-white">{perm.name}</h4>
                          {perm.required && (
                            <span className="text-[9px] font-mono text-cyan-300 bg-cyan-950/60 px-1 rounded">
                              {isBn ? "আবশ্যক" : "Required"}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 font-sans mt-0.5 leading-tight pr-2">
                          {perm.desc}
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0">
                      {isGranted ? (
                        <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1 bg-emerald-950/50 border border-emerald-500/30 px-2 py-0.5 rounded-lg">
                          <Check size={12} />
                          <span>{isBn ? "অনুমোদিত" : "Granted"}</span>
                        </span>
                      ) : (
                        <span className="text-xs font-mono font-semibold text-amber-400 bg-amber-950/40 border border-amber-500/30 px-2.5 py-0.5 rounded-lg">
                          {isBn ? "বাকি" : "Pending"}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-3">
            <div>
              <h3 className="text-lg font-bold font-display text-white">
                {isBn ? "ব্যাকগ্রাউন্ডে মায়া চালু রাখুন" : "Keep Maya alive in the background"}
              </h3>
              <p className="text-xs text-slate-400 font-sans mt-0.5 leading-relaxed">
                {isBn
                  ? "ব্যাটারি অপটিমাইজেশন বন্ধ করা আবশ্যক যাতে স্ক্রিন বন্ধ থাকলেও মায়া শুনতে পারে।"
                  : "Battery is required — it is what stops her going quiet when the screen is off. The rest are optional but make her far more useful."}
              </p>
            </div>

            <div className="space-y-2.5 pt-1">
              {bgPermissions.map((perm) => {
                const Icon = perm.icon;
                const isGranted = perm.status === "granted";
                return (
                  <div
                    key={perm.id}
                    onClick={() => updateBgPermStatus(perm.id, isGranted ? "pending" : "granted")}
                    className={`p-3.5 rounded-2xl border transition flex items-center justify-between cursor-pointer ${
                      isGranted 
                        ? "bg-[#06142e] border-blue-500/40" 
                        : "bg-[#061026] border-white/5 hover:border-white/15"
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-2xl bg-[#081836] border border-white/10 flex items-center justify-center shrink-0">
                        <Icon size={18} className={isGranted ? "text-emerald-400" : "text-blue-400"} />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold font-display text-white">{perm.name}</h4>
                        <p className="text-[11px] text-slate-400 font-sans mt-0.5 leading-tight pr-2">
                          {perm.desc}
                        </p>
                      </div>
                    </div>
                    <div className="shrink-0">
                      {isGranted ? (
                        <span className="text-emerald-400 text-sm font-bold">✓</span>
                      ) : (
                        <span className="text-xs font-mono font-semibold text-amber-400 bg-amber-950/40 border border-amber-500/30 px-2.5 py-0.5 rounded-lg">
                          {isBn ? "বাকি" : "Pending"}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <footer className="p-4 bg-[#050c1c] border-t border-sky-900/30 max-w-md mx-auto w-full z-20 space-y-2.5">
        {step === 2 && (
          <>
            <button
              onClick={handleAllowAll}
              className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm font-sans flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(59,130,246,0.4)] transition cursor-pointer"
            >
              <Check size={16} />
              <span>{isBn ? "সব অনুমতি দিন" : "Allow all"}</span>
            </button>
            <button
              onClick={() => setStep(3)}
              className="w-full py-3 rounded-2xl bg-[#061026] hover:bg-[#081836] border border-white/15 text-slate-200 hover:text-white font-semibold text-sm font-sans flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <span>{isBn ? "পরবর্তী ধাপ" : "Continue"}</span>
              <ChevronRight size={16} />
            </button>
            <div className="text-center text-[10px] font-mono text-slate-500">
              {isBn ? "মাইক্রোফোন অনুমতি পাওয়ার পর সক্রিয় হবে।" : "Continue unlocks once the microphone is allowed."}
            </div>
          </>
        )}
        {step === 3 && (
          <button
            onClick={() => {
              if (typeof localStorage !== "undefined") {
                localStorage.setItem("maya_setup_completed", "true");
              }
              onComplete();
            }}
            className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm font-sans flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(59,130,246,0.4)] transition cursor-pointer"
          >
            <Check size={16} />
            <span>{isBn ? "সম্পূর্ণ করুন" : "Finish"}</span>
          </button>
        )}
      </footer>
    </div>
  );
};
