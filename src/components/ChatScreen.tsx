import React, { useState, useRef, useEffect } from "react";
import { 
  Send, 
  Paperclip, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  Copy, 
  Check, 
  Trash2, 
  Image as ImageIcon,
  X
} from "lucide-react";
import { getBackendBaseUrl } from "../lib/audio";

export interface ChatMessage {
  id: string;
  role: "user" | "model";
  text: string;
  image?: string;
  timestamp: string;
}

interface ChatScreenProps {
  onClose?: () => void;
  initialQuery?: string;
  initialImage?: string;
  onSpeak?: (text: string) => void;
  personality?: string;
}

export const ChatScreen: React.FC<ChatScreenProps> = ({
  onClose,
  initialQuery = "",
  initialImage,
  onSpeak,
  personality = "empathic"
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    if (typeof localStorage !== "undefined") {
      const saved = localStorage.getItem("maya_chat_history");
      if (saved) {
        try { return JSON.parse(saved); } catch {}
      }
    }
    return [
      {
        id: "intro-1",
        role: "model",
        text: "Hello there! I'm Maya, your personal AI assistant. How can I help you today? You can ask me to code, explain complex concepts, solve problems, or plan your tasks.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      }
    ];
  });

  const [inputMessage, setInputMessage] = useState<string>(initialQuery);
  const [attachedImage, setAttachedImage] = useState<string | null>(initialImage || null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [speechEnabled, setSpeechEnabled] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem("maya_chat_history", JSON.stringify(messages.slice(-30)));
    }
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
    if (initialQuery || initialImage) {
      handleSend(initialQuery, initialImage);
    }
  }, []);

  const handleSend = async (textToSend?: string, imageToSend?: string | null) => {
    const text = (textToSend !== undefined ? textToSend : inputMessage).trim();
    const image = imageToSend !== undefined ? imageToSend : attachedImage;
    if (!text && !image) return;
    if (isLoading) return;

    const userMsg: ChatMessage = {
      id: Math.random().toString(36).substring(2, 9),
      role: "user",
      text: text || "Please examine this attached image.",
      image: image || undefined,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInputMessage("");
    setAttachedImage(null);
    setIsLoading(true);

    try {
      const historyPayload = newHistory.slice(-8).map(m => ({
        role: m.role,
        text: m.text
      }));
      const base64 = image ? image.split(",")[1] : undefined;
      const baseUrl = getBackendBaseUrl();
      const res = await fetch(`${baseUrl}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history: historyPayload,
          imageBase64: base64,
          personality
        })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Server error: ${res.status}`);
      }

      const data = await res.json();
      const botReply = data.reply || "Done.";
      const botMsg: ChatMessage = {
        id: Math.random().toString(36).substring(2, 9),
        role: "model",
        text: botReply,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };
      setMessages(prev => [...prev, botMsg]);
      if (speechEnabled && onSpeak) {
        onSpeak(botReply);
      }
    } catch (err: any) {
      console.error("Chat send failure:", err);
      const errMsg: ChatMessage = {
        id: Math.random().toString(36).substring(2, 9),
        role: "model",
        text: `⚠️ Network error: ${err.message || "Failed to reach AI server."}`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImagePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setAttachedImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const copyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const clearChat = () => {
    if (window.confirm("Clear all conversation history?")) {
      setMessages([
        {
          id: "intro-new",
          role: "model",
          text: "Chat memory cleared. How can I assist you now?",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        }
      ]);
    }
  };

  const promptSuggestions = [
    "💻 Help me build a React component",
    "🔬 Explain quantum entanglement simply",
    "📧 Draft a polite follow-up email",
    "⚡ Write a Python automation script",
    "🥗 Healthy meal prep plan for this week"
  ];

  return (
    <div className="fixed inset-0 z-50 bg-[#040814] text-white flex flex-col justify-between overflow-hidden">
      <header className="p-4 flex items-center justify-between border-b border-sky-900/30 bg-[#061026]/95 backdrop-blur-md z-20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 p-0.5 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.4)]">
            <div className="w-full h-full bg-[#050e24] rounded-[14px] flex items-center justify-center font-display font-black text-cyan-400 text-sm">
              M
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold font-display tracking-wide">Maya AI Chat</h2>
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            </div>
            <p className="text-[10px] font-mono text-cyan-300/70">Gemini 2.5 Intelligence Core</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setSpeechEnabled(!speechEnabled)}
            className={`p-2 rounded-xl border transition cursor-pointer ${
              speechEnabled
                ? "bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.3)]"
                : "bg-white/5 border-white/10 text-slate-400 hover:text-white"
            }`}
            title={speechEnabled ? "Voice replies active" : "Enable voice readouts"}
          >
            {speechEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>
          <button
            onClick={clearChat}
            className="p-2 rounded-xl bg-white/5 hover:bg-rose-500/20 border border-white/10 text-slate-400 hover:text-rose-400 transition cursor-pointer"
            title="Clear Chat History"
          >
            <Trash2 size={16} />
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition cursor-pointer"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 max-w-3xl mx-auto w-full">
        {messages.map((msg) => {
          const isUser = msg.role === "user";
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}
            >
              <div className="flex items-center gap-2 mb-1 px-1">
                <span className="text-[10px] font-mono font-semibold text-slate-400">
                  {isUser ? "You" : "Maya"}
                </span>
                <span className="text-[9px] font-mono text-slate-500">{msg.timestamp}</span>
              </div>
              <div
                className={`relative max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 shadow-lg leading-relaxed text-sm ${
                  isUser
                    ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-tr-none shadow-[0_4px_20px_rgba(6,182,212,0.2)]"
                    : "bg-[#081533] border border-cyan-500/20 text-slate-200 rounded-tl-none shadow-[0_4px_20px_rgba(0,0,0,0.4)]"
                }`}
              >
                {msg.image && (
                  <div className="mb-3 rounded-xl overflow-hidden border border-white/20 max-h-60 max-w-xs">
                    <img src={msg.image} alt="User upload" className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="whitespace-pre-wrap font-sans text-xs sm:text-sm">
                  {msg.text}
                </div>
                {!isUser && (
                  <div className="mt-2 pt-2 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-slate-400">
                    <button
                      onClick={() => copyText(msg.id, msg.text)}
                      className="flex items-center gap-1 hover:text-cyan-300 transition cursor-pointer"
                    >
                      {copiedId === msg.id ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                      <span>{copiedId === msg.id ? "Copied" : "Copy text"}</span>
                    </button>
                    {onSpeak && (
                      <button
                        onClick={() => onSpeak(msg.text)}
                        className="flex items-center gap-1 hover:text-cyan-300 transition cursor-pointer"
                      >
                        <Volume2 size={11} />
                        <span>Listen</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
        {isLoading && (
          <div className="flex items-center gap-2 p-3.5 rounded-2xl bg-[#081533] border border-cyan-500/20 max-w-xs text-xs font-mono text-cyan-300">
            <Sparkles className="animate-spin text-cyan-400" size={16} />
            <span>Maya is thinking...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {messages.length <= 2 && (
        <div className="px-4 py-2 flex items-center gap-2 overflow-x-auto max-w-3xl mx-auto w-full select-none">
          {promptSuggestions.map((prompt, i) => (
            <button
              key={i}
              onClick={() => handleSend(prompt)}
              className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-cyan-500/15 border border-white/10 hover:border-cyan-400/40 text-xs font-mono text-slate-300 hover:text-cyan-300 whitespace-nowrap transition shrink-0 cursor-pointer"
            >
              {prompt}
            </button>
          ))}
        </div>
      )}

      <footer className="p-3 bg-[#061026] border-t border-sky-900/30 max-w-3xl mx-auto w-full z-20">
        {attachedImage && (
          <div className="mb-2 flex items-center gap-2 p-2 bg-slate-900 rounded-xl border border-cyan-400/30 w-fit">
            <img src={attachedImage} alt="Attachment" className="w-10 h-10 object-cover rounded-lg" />
            <span className="text-[10px] font-mono text-slate-300">Image attached</span>
            <button
              onClick={() => setAttachedImage(null)}
              className="p-1 text-slate-400 hover:text-rose-400"
            >
              <X size={14} />
            </button>
          </div>
        )}
        <div className="flex items-center gap-2 bg-[#040914] border border-cyan-500/30 rounded-2xl p-1.5 focus-within:border-cyan-400 focus-within:shadow-[0_0_15px_rgba(6,182,212,0.3)] transition">
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            className="hidden"
            onChange={handleImagePick}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2.5 rounded-xl text-slate-400 hover:text-cyan-300 hover:bg-white/5 transition cursor-pointer"
            title="Attach Image"
          >
            <Paperclip size={18} />
          </button>
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Ask Maya anything..."
            className="flex-1 bg-transparent px-2 py-1.5 text-sm text-white placeholder:text-slate-500 focus:outline-none font-sans"
          />
          <button
            onClick={() => handleSend()}
            disabled={(!inputMessage.trim() && !attachedImage) || isLoading}
            className={`p-2.5 rounded-xl font-bold transition cursor-pointer ${
              (inputMessage.trim() || attachedImage) && !isLoading
                ? "bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-[0_0_12px_rgba(6,182,212,0.4)]"
                : "bg-white/5 text-slate-600 cursor-not-allowed"
            }`}
            title="Send Message"
          >
            <Send size={16} />
          </button>
        </div>
      </footer>
    </div>
  );
};
