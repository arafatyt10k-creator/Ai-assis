import React, { useState, useEffect, useRef } from "react";
import { 
  X, 
  ExternalLink, 
  Cpu, 
  AlertCircle, 
  Terminal, 
  Copy, 
  Check, 
  Layers, 
  Globe, 
  RefreshCw, 
  ArrowLeft,
  ArrowRight,
  Home,
  Plus,
  Search,
  Play,
  Sparkles,
  Shield,
  BookOpen
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { getBackendBaseUrl } from "../lib/audio";

interface LogItem {
  id: string;
  text: string;
  type: "info" | "success" | "error" | "action";
}

interface Tab {
  id: string;
  url: string;
  title: string;
  history: string[];
  currentIndex: number;
  isLoading: boolean;
  openedExternally?: boolean;
}

interface BrowserAgentProps {
  url: string;
  onClose: () => void;
  onActionComplete?: (result: any) => void;
  actionTrigger?: {
    type: string;
    args: any;
    id: string;
    callback: (res: any) => void;
  } | null;
}

export const BrowserAgent: React.FC<BrowserAgentProps> = ({
  url: initialUrl,
  onClose,
  actionTrigger
}) => {
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string>("");
  const [inputValue, setInputValue] = useState<string>("");

  const [isLocalConnected, setIsLocalConnected] = useState<boolean>(false);
  const [localLogs, setLocalLogs] = useState<LogItem[]>([]);
  const [showLocalConsole, setShowLocalConsole] = useState<boolean>(false);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const [diagnosticReason, setDiagnosticReason] = useState<string | null>(null);
  const [diagnosticStatus, setDiagnosticStatus] = useState<"secure" | "restricted" | "error" | "analyzing" | "blank">("blank");
  const [jsErrors, setJsErrors] = useState<string[]>([]);
  const [loadTimeMs, setLoadTimeMs] = useState<number>(0);
  const [showDebugPanel, setShowDebugPanel] = useState<boolean>(false);
  const [iframeOnLoadCount, setIframeOnLoadCount] = useState<number>(0);

  const [ytSearchResults, setYtSearchResults] = useState<any[]>([]);
  const [ytSearchLoading, setYtSearchLoading] = useState<boolean>(false);
  const [ytSearchError, setYtSearchError] = useState<string | null>(null);

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const loadStartRef = useRef<number>(0);

  const checkIsRestricted = (urlStr: string): { restricted: boolean; reason: string } => {
    if (!urlStr || urlStr === "about:blank") return { restricted: false, reason: "" };
    try {
      const parsed = new URL(urlStr);
      const hostname = parsed.hostname.toLowerCase();
      
      if (hostname.includes("youtube.com") && !parsed.pathname.includes("/embed") && !parsed.pathname.includes("/results")) {
        return { 
          restricted: true, 
          reason: "YouTube utilizes 'X-Frame-Options: SAMEORIGIN' security headers." 
        };
      }
      if (hostname.includes("youtu.be")) {
        return { 
          restricted: true, 
          reason: "YouTu.be redirect urls enforce strict top-level browser navigation." 
        };
      }
      if (hostname.includes("google.com") && !parsed.pathname.includes("/search")) {
        return { 
          restricted: true, 
          reason: "Google security parameters prohibit iframe embedding of account consoles." 
        };
      }
      if (hostname.includes("chatgpt.com") || hostname.includes("openai.com")) {
        return { 
          restricted: true, 
          reason: "OpenAI requires secure browser authentication checks." 
        };
      }
      if (hostname.includes("gmail.com") || hostname.includes("mail.google.com")) {
        return { 
          restricted: true, 
          reason: "Gmail demands authenticated, non-nested visual scopes." 
        };
      }
      if (hostname.includes("github.com")) {
        return { 
          restricted: true, 
          reason: "GitHub deploys 'X-Frame-Options: deny' on all repositories." 
        };
      }
      return { restricted: false, reason: "" };
    } catch {
      return { restricted: false, reason: "" };
    }
  };

  useEffect(() => {
    if (initialUrl) {
      const startUrl = initialUrl === "about:blank" ? "about:blank" : initialUrl;
      const restrictions = checkIsRestricted(startUrl);
      
      const newTab: Tab = {
        id: Math.random().toString(36).substring(2, 9),
        url: startUrl,
        title: getCleanTitleFromUrl(startUrl),
        history: [startUrl],
        currentIndex: 0,
        isLoading: startUrl !== "about:blank" && !restrictions.restricted,
        openedExternally: restrictions.restricted
      };
      
      setTabs([newTab]);
      setActiveTabId(newTab.id);
      setInputValue(startUrl === "about:blank" ? "" : startUrl);

      if (startUrl !== "about:blank") {
        loadStartRef.current = Date.now();
        if (restrictions.restricted) {
          setDiagnosticStatus("restricted");
          setDiagnosticReason(restrictions.reason);
          window.open(startUrl, "_blank", "noopener,noreferrer");
        } else {
          setDiagnosticStatus("analyzing");
        }
      } else {
        setDiagnosticStatus("blank");
      }
    }
  }, [initialUrl]);

  const activeTab = tabs.find(t => t.id === activeTabId);

  useEffect(() => {
    if (activeTab) {
      setInputValue(activeTab.url === "about:blank" ? "" : activeTab.url);
      
      if (activeTab.url.includes("youtube.com/results")) {
        setYtSearchLoading(true);
        setYtSearchError(null);
        try {
          const urlObj = new URL(activeTab.url);
          const q = urlObj.searchParams.get("search_query") || "";
          const baseUrl = getBackendBaseUrl();
          
          fetch(`${baseUrl}/api/youtube-search?q=${encodeURIComponent(q)}`)
            .then(res => {
              if (!res.ok) throw new Error(`HTTP status ${res.status}`);
              return res.json();
            })
            .then(data => {
              setYtSearchResults(data.results || []);
              setYtSearchLoading(false);
              setTabs(prev => prev.map(t => t.id === activeTabId ? { ...t, isLoading: false } : t));
            })
            .catch(err => {
              console.error("[YouTube Search Error]:", err);
              setYtSearchError(err.message || "Failed loading YouTube results.");
              setYtSearchLoading(false);
              setTabs(prev => prev.map(t => t.id === activeTabId ? { ...t, isLoading: false } : t));
            });
        } catch (e: any) {
          setYtSearchError("Invalid YouTube search URL structure.");
          setYtSearchLoading(false);
        }
      } else {
        setYtSearchResults([]);
      }
    }
  }, [activeTabId, activeTab?.url]);

  useEffect(() => {
    let isMounted = true;
    const fetchStatus = async () => {
      try {
        const res = await fetch("http://localhost:3001/api/status", { mode: "cors" });
        if (res.ok && isMounted) {
          const data = await res.json();
          setIsLocalConnected(true);
          if (data.logs && Array.isArray(data.logs)) {
            setLocalLogs(data.logs);
          }
        }
      } catch (err) {
        if (isMounted) {
          setIsLocalConnected(false);
        }
      }
    };
    fetchStatus();
    const interval = setInterval(fetchStatus, 4000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const getCleanTitleFromUrl = (urlStr: string): string => {
    if (!urlStr || urlStr === "about:blank") return "Start Page";
    try {
      const parsed = new URL(urlStr);
      if (parsed.hostname.includes("youtube.com")) {
        if (parsed.searchParams.get("v")) return "YouTube Stream";
        if (parsed.pathname.includes("/results")) return `YouTube: ${parsed.searchParams.get("search_query") || ""}`;
        return "YouTube Projector";
      }
      if (parsed.hostname.includes("google.com")) {
        return "Google Search";
      }
      return parsed.hostname.replace("www.", "");
    } catch {
      return "Portal";
    }
  };

  const navigateToUrl = (targetUrl: string) => {
    let finalUrl = targetUrl.trim();
    if (finalUrl === "about:blank") {
      setTabs(prev => prev.map(t => t.id === activeTabId ? {
        ...t,
        url: "about:blank",
        title: "Start Page",
        history: [...t.history.slice(0, t.currentIndex + 1), "about:blank"],
        currentIndex: t.currentIndex + 1,
        isLoading: false
      } : t));
      setDiagnosticStatus("blank");
      setDiagnosticReason(null);
      return;
    }

    const isDomain = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?(\?.*)?(#.*)?$/i.test(finalUrl);
    if (isDomain) {
      if (!finalUrl.startsWith("http://") && !finalUrl.startsWith("https://")) {
        finalUrl = "https://" + finalUrl;
      }
    } else {
      finalUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(finalUrl)}`;
    }

    loadStartRef.current = Date.now();
    setDiagnosticStatus("analyzing");
    setDiagnosticReason(null);
    const restrictions = checkIsRestricted(finalUrl);

    setTabs(prev => prev.map(t => {
      if (t.id === activeTabId) {
        const nextHistory = t.history.slice(0, t.currentIndex + 1);
        nextHistory.push(finalUrl);
        return {
          ...t,
          url: finalUrl,
          title: getCleanTitleFromUrl(finalUrl),
          history: nextHistory,
          currentIndex: nextHistory.length - 1,
          isLoading: !restrictions.restricted,
          openedExternally: restrictions.restricted
        };
      }
      return t;
    }));

    if (restrictions.restricted) {
      setDiagnosticStatus("restricted");
      setDiagnosticReason(restrictions.reason);
      try {
        window.open(finalUrl, "_blank", "noopener,noreferrer");
      } catch (err: any) {}
    }
  };

  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      navigateToUrl(inputValue);
    }
  };

  const handleNewTab = (initialUrlStr: string = "about:blank") => {
    const newTab: Tab = {
      id: Math.random().toString(36).substring(2, 9),
      url: initialUrlStr,
      title: getCleanTitleFromUrl(initialUrlStr),
      history: [initialUrlStr],
      currentIndex: 0,
      isLoading: false
    };
    setTabs(prev => [...prev, newTab]);
    setActiveTabId(newTab.id);
  };

  const handleCloseTab = (idToClose: string) => {
    if (tabs.length <= 1) {
      onClose();
      return;
    }
    const idx = tabs.findIndex(t => t.id === idToClose);
    const updated = tabs.filter(t => t.id !== idToClose);
    setTabs(updated);
    if (activeTabId === idToClose) {
      const fallbackIdx = Math.max(0, idx - 1);
      setActiveTabId(updated[fallbackIdx].id);
    }
  };

  const handleBack = () => {
    if (activeTab && activeTab.currentIndex > 0) {
      const targetIdx = activeTab.currentIndex - 1;
      setTabs(prev => prev.map(t => t.id === activeTabId ? {
        ...t,
        url: t.history[targetIdx],
        currentIndex: targetIdx,
        isLoading: true
      } : t));
    }
  };

  const handleForward = () => {
    if (activeTab && activeTab.currentIndex < activeTab.history.length - 1) {
      const targetIdx = activeTab.currentIndex + 1;
      setTabs(prev => prev.map(t => t.id === activeTabId ? {
        ...t,
        url: t.history[targetIdx],
        currentIndex: targetIdx,
        isLoading: true
      } : t));
    }
  };

  const handleRefresh = () => {
    const iframe = iframeRef.current;
    if (iframe && activeTab) {
      loadStartRef.current = Date.now();
      setDiagnosticStatus("analyzing");
      iframe.src = getRenderUrl(activeTab.url);
    }
  };

  const getRenderUrl = (urlStr: string) => {
    if (!urlStr || urlStr === "about:blank") return "about:blank";
    const ytIdMatcher = urlStr.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/i);
    if (ytIdMatcher && ytIdMatcher[1]) {
      return `https://www.youtube.com/embed/${ytIdMatcher[1]}?autoplay=1&enablejsapi=1`;
    }
    if (urlStr.includes("youtube.com/results")) {
      return "about:blank";
    }
    const baseUrl = getBackendBaseUrl();
    return `${baseUrl}/api/web-proxy?url=${encodeURIComponent(urlStr)}`;
  };

  const handleIframeLoadComplete = () => {
    if (activeTab) {
      const dur = Date.now() - loadStartRef.current;
      setLoadTimeMs(dur);
      setDiagnosticStatus("secure");
      setIframeOnLoadCount(prev => prev + 1);
      setTabs(prev => prev.map(t => t.id === activeTabId ? {
        ...t,
        isLoading: false,
        title: getCleanTitleFromUrl(t.url)
      } : t));
    }
  };

  return (
    <div
      id="myraa-playwright-automation-hud"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl animate-fade-in text-left select-none"
    >
      <div className="relative w-full max-w-5xl h-[88vh] flex flex-col rounded-3xl border border-white/10 bg-slate-900/85 shadow-[0_0_90px_rgba(168,85,247,0.4)] overflow-hidden">
        <div className="relative z-10 px-4 pt-4 pb-1 border-b border-white/5 bg-slate-950/70 flex items-end justify-between gap-4">
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none max-w-[80%]">
            {tabs.map((tab) => {
              const isActive = tab.id === activeTabId;
              return (
                <div
                  key={tab.id}
                  onClick={() => setActiveTabId(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl transition-all duration-200 cursor-pointer text-xs font-mono select-none outline-none ${
                    isActive 
                      ? "bg-slate-900 border border-b-transparent border-white/10 text-white font-semibold shadow-inner" 
                      : "text-slate-500 hover:text-slate-300 bg-transparent hover:bg-white/5"
                  }`}
                >
                  <Globe size={11} className={tab.isLoading ? "animate-spin text-purple-400" : isActive ? "text-indigo-400" : "text-slate-500"} />
                  <span className="truncate max-w-[120px]">{tab.title}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCloseTab(tab.id);
                    }}
                    className="p-0.5 rounded hover:bg-white/10 text-slate-500 hover:text-white transition cursor-pointer"
                  >
                    <X size={10} />
                  </button>
                </div>
              );
            })}
            <button
              onClick={() => handleNewTab()}
              className="p-1 px-1.5 ml-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-slate-400 hover:text-white transition-all cursor-pointer"
              title="Spawn New Tab"
            >
              <Plus size={14} />
            </button>
          </div>

          <div className="flex items-center gap-3 pb-2.5">
            <button
              onClick={() => setShowDebugPanel(!showDebugPanel)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[10px] font-mono tracking-wider font-extrabold cursor-pointer transition ${
                showDebugPanel 
                  ? "bg-amber-900/20 border-amber-500/30 text-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.15)]" 
                  : "bg-white/5 border-white/5 text-slate-400 hover:text-white"
              }`}
            >
              <Terminal size={12} className={showDebugPanel ? "text-amber-400 animate-pulse" : ""} />
              <span>DEBUG {showDebugPanel ? "ON" : "OFF"}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 px-3 rounded-xl bg-rose-950/20 hover:bg-rose-950/40 border border-rose-500/30 text-rose-300 hover:text-rose-100 transition font-sans text-xs cursor-pointer flex items-center gap-1"
            >
              <X size={13} /> Close
            </button>
          </div>
        </div>

        <div className="relative z-10 px-5 py-3 border-b border-white/5 bg-slate-900/80 flex items-center gap-3.5 shadow-md">
          <div className="flex items-center gap-2">
            <button
              onClick={handleBack}
              disabled={!activeTab || activeTab.currentIndex <= 0}
              className="p-2 rounded-xl transition text-slate-400 hover:text-white hover:bg-white/5 disabled:opacity-25 disabled:hover:bg-transparent cursor-pointer"
              title="Back"
            >
              <ArrowLeft size={16} />
            </button>
            <button
              onClick={handleForward}
              disabled={!activeTab || activeTab.currentIndex >= activeTab.history.length - 1}
              className="p-2 rounded-xl transition text-slate-400 hover:text-white hover:bg-white/5 disabled:opacity-25 disabled:hover:bg-transparent cursor-pointer"
              title="Forward"
            >
              <ArrowRight size={16} />
            </button>
            <button
              onClick={handleRefresh}
              disabled={!activeTab || activeTab.url === "about:blank"}
              className="p-2 rounded-xl transition text-slate-400 hover:text-white hover:bg-white/5 disabled:opacity-20 cursor-pointer"
              title="Refresh"
            >
              <RefreshCw size={14} className={activeTab?.isLoading ? "animate-spin" : ""} />
            </button>
            <button
              onClick={() => navigateToUrl("about:blank")}
              className="p-2 rounded-xl transition text-slate-400 hover:text-white hover:bg-white/5 cursor-pointer"
              title="Home Start Page"
            >
              <Home size={15} />
            </button>
          </div>

          <form onSubmit={handleAddressSubmit} className="flex-1 relative flex items-center">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type web address or search query..."
              className="w-full py-2 pl-10 pr-12 rounded-xl border border-white/10 bg-slate-950/70 text-slate-200 placeholder-slate-600 text-xs focus:outline-none focus:border-purple-500/40 focus:ring-1 focus:ring-purple-500/40 tracking-wide transition font-mono"
            />
            <Search size={14} className="absolute left-3.5 text-slate-500" />
            <button
              type="submit"
              className="absolute right-2 text-[10px] font-mono tracking-widest uppercase font-bold text-slate-400 hover:text-purple-400 transition cursor-pointer"
            >
              Go
            </button>
          </form>
        </div>

        <div className="relative z-10 flex-1 flex overflow-hidden">
          <div className="flex-1 flex flex-col overflow-hidden bg-[#07070c] relative">
            {activeTab?.url === "about:blank" ? (
              <div className="flex-1 overflow-y-auto p-8 flex flex-col items-center justify-center space-y-8 select-none text-center scrollbar-none">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-3 max-w-lg"
                >
                  <div className="mx-auto w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shadow-2xl shadow-purple-500/5 col-span-1">
                    <Globe size={26} className="text-purple-400 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold font-mono tracking-widest text-[#f5f3ff] uppercase flex items-center justify-center gap-1.5">
                      <Sparkles size={14} className="text-purple-400" /> Web Navigation Console
                    </h3>
                    <p className="text-[10px] text-slate-500 font-mono tracking-wide mt-1 leading-normal max-w-sm mx-auto uppercase">
                      Fast responsive web browser stream with secure sandbox support.
                    </p>
                  </div>
                </motion.div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 w-full max-w-2xl text-left">
                  {[
                    { name: "YouTube", desc: "Interactive media search and stream", url: "https://youtube.com", icon: <Play size={13} />, color: "text-red-400 bg-red-950/10 border-red-500/20 hover:border-red-500/40" },
                    { name: "Wikipedia", desc: "Global encyclopedia articles", url: "https://wikipedia.org", icon: <BookOpen size={13} />, color: "text-emerald-400 bg-emerald-950/10 border-emerald-500/20 hover:border-emerald-500/40" },
                    { name: "Google Search", desc: "Search result portal", url: "https://google.com", icon: <Search size={13} />, color: "text-blue-400 bg-blue-950/10 border-blue-500/20 hover:border-blue-500/40" },
                    { name: "DuckDuckGo Proxy", desc: "Lightweight search indexes in nested viewport", url: "https://duckduckgo.com", icon: <Shield size={13} />, color: "text-orange-400 bg-orange-950/15 border-orange-500/20 hover:border-orange-500/40" }
                  ].map((shortcut, i) => (
                    <motion.div
                      key={shortcut.name}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      onClick={() => navigateToUrl(shortcut.url)}
                      className={`p-3.5 rounded-2xl border ${shortcut.color} hover:bg-white/5 cursor-pointer hover:shadow-lg transition duration-200 group flex flex-col justify-between h-24`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="p-1 rounded-lg bg-white/5 text-xs text-slate-300">{shortcut.icon}</span>
                        <ArrowRight size={11} className="opacity-0 group-hover:opacity-100 text-slate-300 transition duration-200" />
                      </div>
                      <div>
                        <span className="text-xs font-bold font-mono tracking-wide text-slate-200">{shortcut.name}</span>
                        <p className="text-[9px] text-slate-400 font-mono mt-0.5 leading-normal max-w-[170px] truncate">{shortcut.desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            ) : diagnosticStatus === "restricted" ? (
              <div className="flex-1 w-full h-full p-8 flex flex-col items-center justify-center bg-slate-950/80 text-center relative overflow-y-auto scrollbar-none">
                <div className="max-w-xl p-8 rounded-3xl border border-amber-500/20 bg-slate-900/60 backdrop-blur-md space-y-6 shadow-2xl">
                  <div className="mx-auto w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                    <Shield size={22} className="text-amber-400" />
                  </div>
                  
                  <div className="space-y-2">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-amber-500">
                      SECURE REDIRECTION
                    </span>
                    <h3 className="text-sm font-bold font-mono text-white uppercase tracking-wide">
                      Opened in Browser Tab
                    </h3>
                    <p className="text-xs font-sans text-slate-400 leading-relaxed max-w-md mx-auto">
                      Detected secure sandbox constraints for <span className="font-mono text-indigo-300 font-semibold">{getCleanTitleFromUrl(activeTab?.url || "")}</span>. Loaded in a native browser tab to preserve security.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2.5 justify-center pt-2">
                    <button
                      onClick={() => window.open(activeTab?.url, "_blank", "noopener,noreferrer")}
                      className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold font-mono transition duration-200 cursor-pointer flex items-center gap-1.5 justify-center"
                    >
                      <ExternalLink size={13} /> Open in Tab
                    </button>
                    <button
                      onClick={() => navigateToUrl("about:blank")}
                      className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-xs font-mono transition cursor-pointer justify-center"
                    >
                      Return to Start
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 w-full h-full relative overflow-hidden">
                <iframe
                  ref={iframeRef}
                  src={getRenderUrl(activeTab?.url || "about:blank")}
                  onLoad={handleIframeLoadComplete}
                  className="w-full h-full border-0 absolute inset-0 bg-[#07070a]"
                  allow="autoplay; encrypted-media; fullscreen"
                />
                {activeTab?.isLoading && (
                  <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center space-y-4">
                    <div className="w-10 h-10 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                    <span className="font-mono text-[10px] text-purple-300 animate-pulse tracking-[0.25em] font-bold uppercase">
                      Loading Page...
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
