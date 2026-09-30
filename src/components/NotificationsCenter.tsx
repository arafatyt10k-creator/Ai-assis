import React, { useState } from "react";
import { 
  Bell, 
  Trash2, 
  X, 
  Send,
  Sparkles
} from "lucide-react";

interface NotificationItem {
  id: string;
  sender: string;
  app: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: "message" | "reminder" | "system";
}

interface NotificationsCenterProps {
  onClose?: () => void;
  onOpenChatWithDraft?: (draft: string) => void;
}

export const NotificationsCenter: React.FC<NotificationsCenterProps> = ({
  onClose,
  onOpenChatWithDraft
}) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: "1",
      sender: "Alex Chen",
      app: "WhatsApp",
      title: "New Message from Alex",
      message: "Hey, did you finish reviewing the MAYRA Android UI update? Let me know when you're free!",
      time: "10 mins ago",
      read: false,
      type: "message"
    },
    {
      id: "2",
      sender: "Calendar",
      app: "System Schedule",
      title: "Upcoming Sync Meeting",
      message: "Project Architecture review with team in 45 minutes on Google Meet.",
      time: "35 mins ago",
      read: false,
      type: "reminder"
    },
    {
      id: "3",
      sender: "Maya Intelligence",
      app: "MAYRA AI",
      title: "Memory Core Consolidations",
      message: "Synced new preferences and your study goals into long-term recollections.",
      time: "2 hours ago",
      read: true,
      type: "system"
    }
  ]);

  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [activeReplyingId, setActiveReplyingId] = useState<string | null>(null);

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const generateAIReply = (n: NotificationItem) => {
    const draft = `Hi ${n.sender.split(" ")[0]}, thanks for reaching out! I've reviewed the update and everything looks great. Let's sync soon!`;
    setReplyDrafts(prev => ({ ...prev, [n.id]: draft }));
    setActiveReplyingId(n.id);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#040814] text-white flex flex-col justify-between overflow-hidden">
      <header className="p-4 flex items-center justify-between border-b border-sky-900/30 bg-[#061026]/95 backdrop-blur-md z-20">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300">
            <Bell size={20} />
          </div>
          <div>
            <h2 className="text-base font-bold font-display tracking-wide">Notifications Center</h2>
            <p className="text-[11px] font-mono text-cyan-300/70">Android Notifications & AI Quick Replies</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={markAllRead}
            className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-slate-300 hover:text-white transition cursor-pointer"
          >
            Mark Read
          </button>
          <button
            onClick={clearAll}
            className="p-2 rounded-xl bg-white/5 hover:bg-rose-500/20 border border-white/10 text-slate-400 hover:text-rose-400 transition cursor-pointer"
          >
            <Trash2 size={16} />
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition cursor-pointer"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 max-w-2xl mx-auto w-full space-y-3">
        {notifications.length > 0 ? (
          notifications.map((n) => (
            <div
              key={n.id}
              className={`p-4 rounded-3xl border transition shadow-lg space-y-2 ${
                !n.read 
                  ? "bg-[#081533] border-cyan-500/40 shadow-[0_0_20px_rgba(6,182,212,0.15)]" 
                  : "bg-[#061026] border-white/5 opacity-80"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-400">
                    {n.app}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">• {n.time}</span>
                </div>
                {!n.read && (
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                )}
              </div>
              <h4 className="text-xs font-bold text-white font-sans">{n.title}</h4>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">{n.message}</p>
              {n.type === "message" && (
                <div className="pt-2 border-t border-white/5 space-y-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => generateAIReply(n)}
                      className="px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 text-cyan-300 text-xs font-mono flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Sparkles size={12} />
                      <span>Draft AI Reply</span>
                    </button>
                  </div>
                  {activeReplyingId === n.id && (
                    <div className="p-3 rounded-2xl bg-[#040914] border border-cyan-500/30 space-y-2">
                      <textarea
                        value={replyDrafts[n.id] || ""}
                        onChange={(e) => setReplyDrafts({ ...replyDrafts, [n.id]: e.target.value })}
                        rows={2}
                        className="w-full bg-transparent text-xs text-white placeholder:text-slate-500 focus:outline-none font-sans resize-none"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setActiveReplyingId(null)}
                          className="px-3 py-1 text-xs font-mono text-slate-400 hover:text-white cursor-pointer"
                        >
                          Dismiss
                        </button>
                        <button
                          onClick={() => {
                            if (onOpenChatWithDraft) {
                              onOpenChatWithDraft(replyDrafts[n.id]);
                            }
                            setActiveReplyingId(null);
                          }}
                          className="px-3 py-1 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg text-xs font-mono flex items-center gap-1 cursor-pointer"
                        >
                          <Send size={11} />
                          <span>Send Reply</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="py-16 text-center text-xs font-mono text-slate-400">
            No notifications available. All caught up!
          </div>
        )}
      </div>
    </div>
  );
};
