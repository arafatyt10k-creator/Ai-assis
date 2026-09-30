import React, { useState, useEffect, useRef } from "react";
import { MyraaAudioSession, LiveState, getBackendBaseUrl } from "./lib/audio";
import { SpeechAssistant } from "./lib/speechAssistant";
import { MayaOrbVisualizer } from "./components/MayaOrbVisualizer";
import { MyraaCoreVisualizer, MyraaEmotion } from "./components/MyraaCoreVisualizer";
import { MayraLogo } from "./components/MayraLogo";
import { ScanScreen } from "./components/ScanScreen";
import { ChatScreen } from "./components/ChatScreen";
import { StudyMode } from "./components/StudyMode";
import { MusicHub } from "./components/MusicHub";
import { JournalHub } from "./components/JournalHub";
import { PhoneControlHub } from "./components/PhoneControlHub";
import { NotificationsCenter } from "./components/NotificationsCenter";
import { SettingsHub } from "./components/SettingsHub";
import { NavigationDrawer } from "./components/NavigationDrawer";
import { MemoryDashboard } from "./components/MemoryDashboard";
import { ActionHistoryHub } from "./components/ActionHistoryHub";
import { LicenseActivationModal } from "./components/LicenseActivationModal";
import { ApkInstallHub } from "./components/ApkInstallHub";
import { RGBEdgeLighting, RGBEdgeLightingConfig } from "./components/RGBEdgeLighting";
import { SplashScreen } from "./components/SplashScreen";
import { PermissionWizard } from "./components/PermissionWizard";
import { BrowserAgent } from "./components/BrowserAgent";
import { Memory, MemoryCategory } from "./lib/memoryTypes";
import { Language, translations } from "./lib/translations";
import { 
  Menu, 
  Bell, 
  Zap, 
  Music, 
  BookOpen, 
  Edit3, 
  Cloud, 
  Calendar, 
  Heart, 
  Paperclip, 
  Send, 
  Mic, 
  Square,
  Volume2, 
  Home, 
  QrCode, 
  Brain, 
  MessageSquare,
  Lock,
  Download
} from "lucide-react";
import { AnimatePresence } from "motion/react";

export default function App() {
  const [showSplash, setShowSplash] = useState<boolean>(true);
  const [showPermissionWizard, setShowPermissionWizard] = useState<boolean>(false);

  const [currentRoute, setCurrentRoute] = useState<"home" | "scan" | "memories" | "chat">("home");
  const [activeModal, setActiveModal] = useState<"study" | "music" | "journal" | "phone" | "notifications" | "settings" | "action_history" | "license" | "apk_hub" | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);

  const [lang, setLang] = useState<Language>(() => {
    return (typeof localStorage !== "undefined" ? (localStorage.getItem("maya_lang") as Language) : null) || "en";
  });
  const t = translations[lang];
  const isBn = lang === "bn";

  const toggleLanguage = () => {
    const next = lang === "en" ? "bn" : "en";
    setLang(next);
    if (typeof localStorage !== "undefined") {
      localStorage.setItem("maya_lang", next);
    }
  };

  const [state, setState] = useState<LiveState>("disconnected");
  const [voiceEngine, setVoiceEngine] = useState<"live_websocket" | "speech_synthesis">("live_websocket");
  const [assistantPersonality, setAssistantPersonality] = useState<string>("empathic");
  const [voiceName, setVoiceName] = useState<string>("Aoede");
  const [speechRate, setSpeechRate] = useState<number>(1.0);
  const [themeColor, setThemeColor] = useState<string>("cyan");
  const [visualizerMode, setVisualizerMode] = useState<"hud" | "anime">("hud");

  const [rgbLightingConfig, setRgbLightingConfig] = useState<RGBEdgeLightingConfig>(() => {
    if (typeof localStorage !== "undefined") {
      const saved = localStorage.getItem("maya_rgb_config");
      if (saved) {
        try { return JSON.parse(saved); } catch {}
      }
    }
    return {
      enabled: true,
      preset: "rainbow",
      speed: "normal",
      intensity: 85,
      ambientAlwaysOn: false,
      batterySaver: false,
      reduceMotion: false
    };
  });

  useEffect(() => {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem("maya_rgb_config", JSON.stringify(rgbLightingConfig));
    }
  }, [rgbLightingConfig]);

  const [userCaption, setUserCaption] = useState<string>("");
  const [modelCaption, setModelCaption] = useState<string>("");
  const [activeEmotion, setActiveEmotion] = useState<MyraaEmotion>("idle");
  const [characterState, setCharacterState] = useState<"idle" | "thinking" | "talking">("idle");
  const [errorText, setErrorText] = useState<string | null>(null);

  const [weatherData, setWeatherData] = useState<{ temp: number; condition: string; mood: string; city: string }>({
    temp: 24,
    condition: isBn ? "স্বাভাবিক" : "Partly Cloudy",
    mood: isBn ? "উষ্ণ" : "Warm",
    city: "Local"
  });
  const [todayMood, setTodayMood] = useState<string>(isBn ? "উষ্ণ" : "Warm");
  const [energyPoints, setEnergyPoints] = useState<number>(1);
  const [chatInputValue, setChatInputValue] = useState<string>("");

  const [isScreenSharing, setIsScreenSharing] = useState<boolean>(false);
  const [isScreenSharingPaused, setIsScreenSharingPaused] = useState<boolean>(false);
  const [screenVisionMode, setScreenVisionMode] = useState<boolean>(true);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const screenVideoRef = useRef<HTMLVideoElement | null>(null);
  const screenCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const screenIntervalRef = useRef<any>(null);

  const [memories, setMemories] = useState<Memory[]>([]);
  const [activeProjectorUrl, setActiveProjectorUrl] = useState<string | null>(null);
  const [browserTrigger, setBrowserTrigger] = useState<any>(null);

  const sessionRef = useRef<MyraaAudioSession | null>(null);
  const speechAssistantRef = useRef<SpeechAssistant | null>(null);

  useEffect(() => {
    const baseUrl = getBackendBaseUrl();
    fetch(`${baseUrl}/api/memories`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setMemories(data);
      })
      .catch(err => console.warn("Memories load fallback:", err));

    if (typeof navigator !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          fetch(`${baseUrl}/api/weather?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`)
            .then(res => res.json())
            .then(data => {
              if (data && data.temp !== undefined) {
                setWeatherData({
                  temp: data.temp,
                  condition: data.condition || (isBn ? "পরিষ্কার আকাশ" : "Clear Sky"),
                  mood: data.mood || (isBn ? "উষ্ণ" : "Warm"),
                  city: data.city || "Local"
                });
                setTodayMood(data.mood || (isBn ? "উষ্ণ" : "Warm"));
              }
            })
            .catch(() => {});
        },
        () => {
          fetch(`${baseUrl}/api/weather`)
            .then(res => res.json())
            .then(data => data && setWeatherData(data))
            .catch(() => {});
        }
      );
    }
  }, [isBn]);

  useEffect(() => {
    sessionRef.current = new MyraaAudioSession({
      onStateChange: (newState) => {
        setState(newState);
        if (newState === "disconnected") {
          setUserCaption("");
          setModelCaption("");
          setActiveEmotion("idle");
          setCharacterState("idle");
        } else if (newState === "listening") {
          setActiveEmotion("idle");
          setCharacterState("idle");
        } else if (newState === "speaking") {
          setCharacterState("talking");
        }
      },
      onTranscription: (role, text) => {
        if (role === "user") {
          setUserCaption(text);
          setModelCaption("");
          setCharacterState("thinking");
        } else if (role === "model") {
          setModelCaption(prev => prev + text);
          setUserCaption("");
        }
      },
      onToolCall: (name, args, callback) => {
        console.log(`[Tool Call]: ${name}`, args);
        if (name === "browserOpen" || name === "openWebsite") {
          setActiveProjectorUrl(args.url || "https://youtube.com");
          setBrowserTrigger({
            type: "browserOpen",
            args,
            id: Math.random().toString(),
            callback: (res: any) => {
              callback(res);
              setBrowserTrigger(null);
            }
          });
        } else if (name === "changeBackground") {
          const colorName = args.color?.toLowerCase();
          if (colorName) setThemeColor(colorName);
          callback({ result: `Theme updated to ${colorName}` });
        } else {
          callback({ error: `Tool ${name} executed.` });
        }
      },
      onError: (err) => {
        console.warn("WebSocket Live Error:", err);
        setErrorText(err);
      },
      onMemorySync: (updatedMemories) => {
        if (Array.isArray(updatedMemories)) setMemories(updatedMemories);
      }
    });

    speechAssistantRef.current = new SpeechAssistant({
      voiceName,
      rate: speechRate,
      lang: isBn ? "bn-BD" : "en-US"
    });

    speechAssistantRef.current.onTranscript = (transcript, isFinal) => {
      setUserCaption(transcript);
      if (isFinal) {
        handleSendVoiceQueryToChat(transcript);
      }
    };

    speechAssistantRef.current.onStateChange = (speechState) => {
      if (speechState === "listening") setState("listening");
      else if (speechState === "speaking") {
        setState("speaking");
        setCharacterState("talking");
      } else if (speechState === "idle") {
        setState("disconnected");
        setCharacterState("idle");
      }
    };

    return () => {
      sessionRef.current?.disconnect();
      speechAssistantRef.current?.stopSpeaking();
      speechAssistantRef.current?.stopListening();
    };
  }, [voiceName, speechRate, isBn]);

  const handleSendVoiceQueryToChat = async (queryText: string) => {
    if (!queryText.trim()) return;
    setState("connecting");
    setCharacterState("thinking");
    try {
      const baseUrl = getBackendBaseUrl();
      const res = await fetch(`${baseUrl}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: queryText,
          personality: assistantPersonality,
          language: lang
        })
      });
      const data = await res.json();
      const reply = data.reply || (isBn ? "সম্পন্ন হয়েছে।" : "Done.");
      setModelCaption(reply);
      speechAssistantRef.current?.speak(reply, () => {
        setState("disconnected");
        setCharacterState("idle");
      });
    } catch (err) {
      console.error("Voice chat fallback error:", err);
      setState("disconnected");
    }
  };

  const handleToggleVoice = async () => {
    setErrorText(null);
    if (state !== "disconnected") {
      sessionRef.current?.disconnect();
      speechAssistantRef.current?.stopSpeaking();
      speechAssistantRef.current?.stopListening();
      setState("disconnected");
      return;
    }

    if (voiceEngine === "live_websocket") {
      try {
        await sessionRef.current?.connect();
      } catch (e: any) {
        console.warn("Live WebSocket connection fallback:", e);
        setVoiceEngine("speech_synthesis");
        speechAssistantRef.current?.startListening();
      }
    } else {
      speechAssistantRef.current?.startListening();
    }
  };

  const captureFrameAndSend = () => {
    const video = screenVideoRef.current;
    if (!video || isScreenSharingPaused || !screenVisionMode || state === "disconnected") return;
    try {
      if (video.videoWidth === 0 || video.videoHeight === 0) return;
      if (!screenCanvasRef.current) screenCanvasRef.current = document.createElement("canvas");
      const canvas = screenCanvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const maxDim = 960;
      let width = video.videoWidth;
      let height = video.videoHeight;
      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }
      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(video, 0, 0, width, height);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.55);
      const base64 = dataUrl.split(",")[1];
      sessionRef.current?.sendVideoFrame(base64);
    } catch (e) {
      console.error("Frame capture error:", e);
    }
  };

  const startScreenSharing = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, frameRate: { ideal: 5 } },
        audio: false
      });
      screenStreamRef.current = stream;
      const video = document.createElement("video");
      video.srcObject = stream;
      video.muted = true;
      video.playsInline = true;
      video.play().catch(() => {});
      screenVideoRef.current = video;
      setIsScreenSharing(true);
      setIsScreenSharingPaused(false);
      stream.getVideoTracks()[0].onended = () => stopScreenSharing();
      if (screenIntervalRef.current) clearInterval(screenIntervalRef.current);
      screenIntervalRef.current = setInterval(captureFrameAndSend, 2000);
      setTimeout(captureFrameAndSend, 500);
      if (state === "disconnected") {
        handleToggleVoice();
      }
    } catch (e: any) {
      console.warn("Screen share declined:", e);
    }
  };

  const stopScreenSharing = () => {
    if (screenIntervalRef.current) {
      clearInterval(screenIntervalRef.current);
      screenIntervalRef.current = null;
    }
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach(t => t.stop());
      screenStreamRef.current = null;
    }
    if (screenVideoRef.current) {
      screenVideoRef.current.pause();
      screenVideoRef.current = null;
    }
    setIsScreenSharing(false);
    setIsScreenSharingPaused(false);
  };

  const handleAddManualMemory = async (category: MemoryCategory, text: string) => {
    try {
      const baseUrl = getBackendBaseUrl();
      const res = await fetch(`${baseUrl}/api/memories`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, text })
      });
      const saved = await res.json();
      if (saved && saved.id) setMemories(prev => [...prev, saved]);
    } catch (e) {
      console.error("Memory save error:", e);
    }
  };

  const handleDeleteMemory = async (id: string) => {
    try {
      const baseUrl = getBackendBaseUrl();
      await fetch(`${baseUrl}/api/memories/${id}`, { method: "DELETE" });
      setMemories(prev => prev.filter(m => m.id !== id));
    } catch (e) {
      console.error("Memory delete error:", e);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return t.greetingMorning;
    if (hour >= 12 && hour < 18) return t.greetingAfternoon;
    return t.greetingNight;
  };

  const todayDate = new Date();
  const dayNumber = todayDate.getDate();
  const dayAndMonth = todayDate.toLocaleDateString(isBn ? "bn-BD" : "en-US", { weekday: "short", month: "short" });
  const isListening = state === "listening";
  const isSpeaking = state === "speaking";

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#040914] text-white flex flex-col justify-between select-none">
      <RGBEdgeLighting
        state={state}
        config={rgbLightingConfig}
      />

      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-900/20 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-cyan-900/15 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(56,189,248,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(56,189,248,0.015)_1px,transparent_1px)] bg-[size:36px_36px] pointer-events-none opacity-40" />

      {visualizerMode === "anime" && (
        <div className="absolute inset-0 z-0 pointer-events-none">
          <MyraaCoreVisualizer
            session={sessionRef.current}
            state={state}
            themeColor={themeColor}
            activeEmotion={activeEmotion}
            characterState={characterState}
          />
        </div>
      )}

      <header className="relative z-30 flex items-center justify-between w-full max-w-md mx-auto px-5 pt-3.5 pb-1">
        <button
          onClick={() => setIsDrawerOpen(true)}
          className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 transition cursor-pointer"
          title="Open Menu"
        >
          <Menu size={22} />
        </button>

        <div 
          className="flex items-center gap-1.5 cursor-pointer" 
          onClick={() => setVisualizerMode(visualizerMode === "hud" ? "anime" : "hud")}
        >
          <span className="text-lg font-bold font-display tracking-tight text-white">
            {t.assistantTitle}
          </span>
          <span className={`w-1.5 h-1.5 rounded-full ${
            state === "listening" || state === "speaking" ? "bg-cyan-400 animate-pulse" : "bg-cyan-400/50"
          }`} />
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setActiveModal("apk_hub")}
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-400/40 text-[10px] font-mono font-bold shadow-[0_0_10px_rgba(6,182,212,0.2)] transition cursor-pointer"
            title="Download APK / Install on Phone"
          >
            <Download size={11} className="text-cyan-300 animate-bounce" />
            <span>APK</span>
          </button>
          <button
            onClick={toggleLanguage}
            className="px-2 py-1 rounded-xl bg-white/5 hover:bg-cyan-500/20 text-cyan-300 border border-white/10 text-[10px] font-mono transition cursor-pointer"
            title="Toggle Language"
          >
            {isBn ? "EN" : "বাংলা"}
          </button>
          <button
            onClick={() => setActiveModal("notifications")}
            className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 transition relative cursor-pointer"
            title="Notifications"
          >
            <Bell size={18} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_6px_#22d3ee]" />
          </button>
          <div 
            onClick={() => setActiveModal("settings")}
            className="cursor-pointer"
            title="Profile & Settings"
          >
            <MayraLogo size="sm" />
          </div>
        </div>
      </header>

      <div className="relative z-30 w-full max-w-md mx-auto px-5 py-1">
        <div className="p-3 rounded-2xl bg-[#081533]/85 border border-cyan-500/25 backdrop-blur-md shadow-lg flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-1.5 rounded-lg bg-blue-500/20 text-blue-300 shrink-0">
              <Lock size={14} />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold font-sans text-white truncate">
                {t.freeModeTitle}
              </div>
              <div className="text-[10px] font-mono text-slate-400 truncate">
                {t.freeModeDesc}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => setActiveModal("apk_hub")}
              className="px-2.5 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 font-bold text-xs font-mono border border-cyan-400/40 transition cursor-pointer"
              title="Install APK"
            >
              APK
            </button>
            <button
              onClick={() => setActiveModal("license")}
              className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs font-mono shadow-[0_0_12px_rgba(37,99,235,0.4)] transition cursor-pointer"
            >
              {t.activate}
            </button>
          </div>
        </div>
      </div>

      <main className="relative z-10 flex-1 w-full max-w-md mx-auto px-5 flex flex-col justify-between overflow-y-auto pb-24">
        <div className="flex items-start justify-between mt-1">
          <div>
            <span className="text-sm font-light text-slate-400 font-sans block">
              {getGreeting()}
            </span>
            <h2 className="text-2xl font-bold font-display text-white tracking-wide">
              {t.greetingUser}
            </h2>
            <p className="text-xs text-cyan-300/80 font-sans mt-0.5">
              {isListening 
                ? t.listeningStatus 
                : isSpeaking 
                ? t.speakingStatus 
                : t.readyStatus}
            </p>
          </div>

          <div 
            onClick={() => setEnergyPoints(prev => (prev % 5) + 1)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-[#081533] border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.2)] cursor-pointer hover:scale-105 transition"
          >
            <Zap size={14} className="text-amber-400 fill-amber-400" />
            <div className="flex flex-col text-right">
              <span className="text-xs font-bold font-mono text-white leading-tight">{energyPoints}</span>
              <span className="text-[9px] font-mono text-slate-400 leading-tight">{t.energy}</span>
            </div>
          </div>
        </div>

        {(modelCaption || userCaption) && (
          <div className="my-1.5 p-2.5 rounded-2xl bg-[#061026]/90 border border-cyan-500/30 text-center text-xs font-sans text-cyan-200 line-clamp-2">
            {modelCaption || userCaption}
          </div>
        )}

        <div className="my-auto py-1 flex items-center justify-center">
          <MayaOrbVisualizer
            state={state}
            subtitle={
              state === "listening" 
                ? (isBn ? "শুনছি..." : "LISTENING TO YOU...") 
                : state === "speaking" 
                ? (isBn ? "মায়া কথা বলছে..." : "MAYA IS SPEAKING...") 
                : t.howCanIHelp
            }
            onOrbClick={handleToggleVoice}
            characterMode={visualizerMode === "anime"}
          />
        </div>

        <div className="grid grid-cols-3 gap-2.5 my-1.5">
          <button
            onClick={() => setActiveModal("music")}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-2xl bg-[#061026]/80 border border-cyan-500/25 hover:border-cyan-400/60 shadow-[0_4px_15px_rgba(0,0,0,0.3)] hover:scale-[1.02] transition cursor-pointer"
          >
            <Music size={15} className="text-cyan-400" />
            <span className="text-xs font-bold font-display text-white">{t.music}</span>
          </button>
          <button
            onClick={() => setActiveModal("study")}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-2xl bg-[#061026]/80 border border-cyan-500/25 hover:border-cyan-400/60 shadow-[0_4px_15px_rgba(0,0,0,0.3)] hover:scale-[1.02] transition cursor-pointer"
          >
            <BookOpen size={15} className="text-purple-400" />
            <span className="text-xs font-bold font-display text-white">{t.study}</span>
          </button>
          <button
            onClick={() => setActiveModal("journal")}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-2xl bg-[#061026]/80 border border-cyan-500/25 hover:border-cyan-400/60 shadow-[0_4px_15px_rgba(0,0,0,0.3)] hover:scale-[1.02] transition cursor-pointer"
          >
            <Edit3 size={15} className="text-pink-400" />
            <span className="text-xs font-bold font-display text-white">{t.journal}</span>
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2.5 my-1.5">
          <div 
            onClick={() => setActiveModal("phone")}
            className="p-3 rounded-2xl bg-[#061026]/80 border border-cyan-500/20 shadow-md flex flex-col justify-between h-24 cursor-pointer hover:border-cyan-400/40 transition"
          >
            <div className="flex items-center gap-1 text-[11px] font-sans text-slate-300">
              <Cloud size={13} className="text-cyan-400" />
              <span>{t.weather}</span>
            </div>
            <div>
              <div className="text-lg font-bold font-display text-white leading-none">
                {weatherData.temp}°
              </div>
              <div className="text-[10px] font-mono text-slate-400 mt-1 truncate">
                {weatherData.condition}
              </div>
            </div>
          </div>

          <div 
            onClick={() => setActiveModal("phone")}
            className="p-3 rounded-2xl bg-[#061026]/80 border border-cyan-500/20 shadow-md flex flex-col justify-between h-24 cursor-pointer hover:border-cyan-400/40 transition"
          >
            <div className="flex items-center gap-1 text-[11px] font-sans text-slate-300">
              <Calendar size={13} className="text-blue-400" />
              <span>{t.today}</span>
            </div>
            <div>
              <div className="text-lg font-bold font-display text-white leading-none">
                {dayNumber}
              </div>
              <div className="text-[10px] font-mono text-slate-400 mt-1">
                {dayAndMonth}
              </div>
            </div>
          </div>

          <div 
            onClick={() => setActiveModal("journal")}
            className="p-3 rounded-2xl bg-[#061026]/80 border border-cyan-500/20 shadow-md flex flex-col justify-between h-24 cursor-pointer hover:border-pink-500/40 transition"
          >
            <div className="flex items-center gap-1 text-[11px] font-sans text-slate-300">
              <Heart size={13} className="text-pink-400 fill-pink-400" />
              <span>{t.mood}</span>
            </div>
            <div>
              <div className="text-base font-bold font-display text-pink-300 leading-none">
                {todayMood}
              </div>
              <div className="text-[10px] font-mono text-slate-400 mt-1">
                {t.allGood}
              </div>
            </div>
          </div>
        </div>

        <div className="relative mt-1.5 mb-1 flex items-center gap-2 bg-[#061026] border border-cyan-500/30 rounded-full px-3 py-1.5 shadow-[0_0_15px_rgba(6,182,212,0.15)] focus-within:border-cyan-400 focus-within:shadow-[0_0_20px_rgba(6,182,212,0.3)] transition">
          <button
            onClick={() => setCurrentRoute("scan")}
            className="p-1.5 text-slate-400 hover:text-cyan-300 transition cursor-pointer"
            title="Scan & Vision"
          >
            <Paperclip size={16} />
          </button>
          <input
            type="text"
            value={chatInputValue}
            onChange={(e) => setChatInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && chatInputValue.trim()) {
                setCurrentRoute("chat");
              }
            }}
            placeholder={t.askPlaceholder}
            className="flex-1 bg-transparent text-xs text-white placeholder:text-slate-500 focus:outline-none font-sans"
          />
          <button
            onClick={() => {
              if (chatInputValue.trim()) {
                setCurrentRoute("chat");
              }
            }}
            className="p-1.5 text-cyan-400 hover:text-cyan-300 transition cursor-pointer"
            title="Send"
          >
            <Send size={15} />
          </button>
        </div>
      </main>

      <div className="absolute bottom-16 inset-x-0 z-30 flex justify-center pointer-events-none">
        <div className="relative pointer-events-auto">
          {(isListening || isSpeaking) && (
            <>
              <div className="absolute -inset-3 rounded-full border border-cyan-400/40 animate-ping pointer-events-none" />
              <div className="absolute -inset-6 rounded-full border border-blue-500/30 animate-pulse pointer-events-none" />
            </>
          )}
          <button
            onClick={handleToggleVoice}
            className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer shadow-2xl ${
              state === "disconnected"
                ? "bg-gradient-to-tr from-blue-600 via-cyan-500 to-sky-400 text-white shadow-[0_0_25px_rgba(6,182,212,0.5)] hover:scale-110 active:scale-95"
                : isListening
                ? "bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-[0_0_35px_rgba(59,130,246,0.8)] scale-105"
                : isSpeaking
                ? "bg-gradient-to-tr from-purple-600 to-fuchsia-500 text-white shadow-[0_0_35px_rgba(168,85,247,0.7)] scale-105"
                : "bg-amber-500 text-slate-950 animate-spin"
            }`}
            title={state === "disconnected" ? "Push to talk with Maya" : "Stop"}
          >
            {state === "disconnected" ? (
              <Mic size={24} />
            ) : isListening ? (
              <Square size={18} className="fill-white text-white" />
            ) : isSpeaking ? (
              <Volume2 size={24} />
            ) : (
              <div className="w-6 h-6 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
            )}
          </button>
        </div>
      </div>

      <nav className="relative z-30 w-full max-w-md mx-auto px-6 py-2.5 bg-[#030712]/95 border-t border-sky-900/30 backdrop-blur-xl flex items-center justify-between">
        {[
          { id: "home", label: t.homeTab, icon: Home },
          { id: "scan", label: t.scanTab, icon: QrCode },
          { id: "memories", label: t.memoriesTab, icon: Brain },
          { id: "chat", label: t.chatTab, icon: MessageSquare },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = currentRoute === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setCurrentRoute(tab.id as any)}
              className={`flex flex-col items-center gap-1 transition cursor-pointer ${
                isActive ? "text-cyan-400 font-bold" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Icon size={18} className={isActive ? "drop-shadow-[0_0_6px_#22d3ee]" : ""} />
              <span className="text-[10px] font-sans">{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {currentRoute === "scan" && (
        <ScanScreen
          onClose={() => setCurrentRoute("home")}
          onSendToChat={(text, img) => {
            setChatInputValue(text);
            setCurrentRoute("chat");
          }}
          lang={lang}
        />
      )}

      {currentRoute === "memories" && (
        <MemoryDashboard
          isOpen={true}
          onClose={() => setCurrentRoute("home")}
          memories={memories}
          onAddMemory={handleAddManualMemory}
          onDeleteMemory={handleDeleteMemory}
          themeColor={themeColor}
        />
      )}

      {currentRoute === "chat" && (
        <ChatScreen
          onClose={() => setCurrentRoute("home")}
          initialQuery={chatInputValue}
          personality={assistantPersonality}
          onSpeak={(text) => speechAssistantRef.current?.speak(text)}
        />
      )}

      {activeModal === "study" && (
        <StudyMode onClose={() => setActiveModal(null)} />
      )}

      {activeModal === "music" && (
        <MusicHub onClose={() => setActiveModal(null)} />
      )}

      {activeModal === "journal" && (
        <JournalHub
          onClose={() => setActiveModal(null)}
          onSaveMood={(m) => setTodayMood(m)}
        />
      )}

      {activeModal === "phone" && (
        <PhoneControlHub onClose={() => setActiveModal(null)} />
      )}

      {activeModal === "notifications" && (
        <NotificationsCenter
          onClose={() => setActiveModal(null)}
          onOpenChatWithDraft={(draft) => {
            setActiveModal(null);
            setChatInputValue(draft);
            setCurrentRoute("chat");
          }}
        />
      )}

      {activeModal === "action_history" && (
        <ActionHistoryHub
          onClose={() => setActiveModal(null)}
          lang={lang}
        />
      )}

      {activeModal === "license" && (
        <LicenseActivationModal
          isOpen={true}
          onClose={() => setActiveModal(null)}
          lang={lang}
        />
      )}

      {activeModal === "apk_hub" && (
        <ApkInstallHub
          isOpen={true}
          onClose={() => setActiveModal(null)}
          lang={lang}
        />
      )}

      {activeModal === "settings" && (
        <SettingsHub
          onClose={() => setActiveModal(null)}
          currentVoice={voiceName}
          onVoiceChange={(v) => setVoiceName(v)}
          currentRate={speechRate}
          onRateChange={(r) => setSpeechRate(r)}
          currentTheme={themeColor}
          onThemeChange={(t) => setThemeColor(t)}
          currentPersonality={assistantPersonality}
          onPersonalityChange={(p) => setAssistantPersonality(p)}
          currentLanguage={lang}
          onLanguageChange={(newLang) => setLang(newLang)}
          edgeLightingConfig={rgbLightingConfig}
          onEdgeLightingChange={(cfg) => setRgbLightingConfig(cfg)}
          onOpenActionHistory={() => {
            setActiveModal("action_history");
          }}
          onOpenLicenseModal={() => {
            setActiveModal("license");
          }}
          onOpenPermissionWizard={() => {
            setShowPermissionWizard(true);
          }}
        />
      )}

      {showPermissionWizard && (
        <PermissionWizard
          onComplete={() => setShowPermissionWizard(false)}
          onClose={() => setShowPermissionWizard(false)}
          lang={lang}
        />
      )}

      <NavigationDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        activeTab={currentRoute}
        onNavigate={(route) => {
          if (route === "permission_wizard") {
            setShowPermissionWizard(true);
          } else if (["home", "scan", "memories", "chat"].includes(route)) {
            setCurrentRoute(route as any);
          } else {
            setActiveModal(route as any);
          }
        }}
        isScreenSharing={isScreenSharing}
        onToggleScreenShare={isScreenSharing ? stopScreenSharing : startScreenSharing}
        currentLanguage={lang}
        onToggleLanguage={toggleLanguage}
      />

      <AnimatePresence>
        {showSplash && (
          <SplashScreen
            onComplete={() => setShowSplash(false)}
            lang={lang}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {activeProjectorUrl && (
          <BrowserAgent
            url={activeProjectorUrl}
            onClose={() => {
              setActiveProjectorUrl(null);
              setBrowserTrigger(null);
            }}
            actionTrigger={browserTrigger}
          />
        )}
      </AnimatePresence>

      {isScreenSharing && (
        <div className="absolute bottom-24 right-4 z-50 p-3 rounded-2xl border border-cyan-400/40 bg-[#081533]/90 backdrop-blur-xl shadow-2xl flex flex-col gap-2 max-w-xs">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span className="text-[10px] font-mono text-cyan-300 font-bold">
                {t.screenVisionActive}
              </span>
            </div>
            <button
              onClick={stopScreenSharing}
              className="px-2 py-0.5 rounded-lg bg-rose-500/20 text-rose-300 text-[10px] font-mono hover:bg-rose-500/30 cursor-pointer"
            >
              {t.stopScreenVision}
            </button>
          </div>
          <div className="flex flex-wrap gap-1 pt-1 border-t border-white/5">
            <button
              onClick={() => {
                captureFrameAndSend();
                handleSendVoiceQueryToChat(isBn ? "আমার স্ক্রিনে কি আছে?" : "What is on my screen right now?");
              }}
              className="px-2 py-1 bg-white/5 hover:bg-cyan-500/20 text-[10px] font-mono text-cyan-300 rounded-md border border-cyan-400/20 transition cursor-pointer"
            >
              {isBn ? "স্ক্রিন বিশ্লেষণ" : "Analyze Screen"}
            </button>
            <button
              onClick={() => {
                captureFrameAndSend();
                handleSendVoiceQueryToChat(isBn ? "স্ক্রিনে কোনো সমস্যা দেখতে পাচ্ছ?" : "Are there any visible errors on screen?");
              }}
              className="px-2 py-1 bg-white/5 hover:bg-cyan-500/20 text-[10px] font-mono text-purple-300 rounded-md border border-purple-400/20 transition cursor-pointer"
            >
              {isBn ? "ত্রুটি খুঁজুন" : "Find Error"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
