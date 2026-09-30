import React, { useState, useEffect } from "react";
import { 
  Heart, 
  Save, 
  Trash2, 
  Feather,
  X
} from "lucide-react";

interface JournalHubProps {
  onClose?: () => void;
  onSaveMood?: (mood: string) => void;
}

interface JournalEntry {
  id: string;
  date: string;
  mood: string;
  energy: number;
  text: string;
  gratitude: string;
}

export const JournalHub: React.FC<JournalHubProps> = ({ onClose, onSaveMood }) => {
  const [entries, setEntries] = useState<JournalEntry[]>(() => {
    if (typeof localStorage !== "undefined") {
      const saved = localStorage.getItem("maya_journal_entries");
      if (saved) {
        try { return JSON.parse(saved); } catch {}
      }
    }
    return [
      {
        id: "1",
        date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        mood: "Warm",
        energy: 85,
        text: "Had an exceptionally productive day upgrading MAYRA assistant. Focused on clean UI design and reliable integrations.",
        gratitude: "Grateful for fast progress and clear engineering architecture."
      }
    ];
  });

  const [selectedMood, setSelectedMood] = useState<string>("Warm");
  const [energyLevel, setEnergyLevel] = useState<number>(80);
  const [entryText, setEntryText] = useState<string>("");
  const [gratitudeText, setGratitudeText] = useState<string>("");

  useEffect(() => {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem("maya_journal_entries", JSON.stringify(entries));
    }
  }, [entries]);

  const moods = [
    { label: "Warm", emoji: "😊", color: "from-pink-500 to-rose-500" },
    { label: "Energized", emoji: "⚡", color: "from-amber-400 to-orange-500" },
    { label: "Calm", emoji: "🌿", color: "from-cyan-400 to-blue-500" },
    { label: "Focused", emoji: "🎯", color: "from-indigo-400 to-purple-500" },
    { label: "Reflective", emoji: "🌙", color: "from-violet-400 to-fuchsia-500" },
  ];

  const handleSaveEntry = () => {
    if (!entryText.trim() && !gratitudeText.trim()) return;
    const newEntry: JournalEntry = {
      id: Math.random().toString(36).substring(2, 9),
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      mood: selectedMood,
      energy: energyLevel,
      text: entryText,
      gratitude: gratitudeText
    };
    setEntries([newEntry, ...entries]);
    setEntryText("");
    setGratitudeText("");
    onSaveMood?.(selectedMood);
  };

  const deleteEntry = (id: string) => {
    setEntries(entries.filter(e => e.id !== id));
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#040814] text-white flex flex-col justify-between overflow-hidden">
      <header className="p-4 flex items-center justify-between border-b border-sky-900/30 bg-[#061026]/95 backdrop-blur-md z-20">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-pink-500/20 text-pink-300">
            <Heart size={20} />
          </div>
          <div>
            <h2 className="text-base font-bold font-display tracking-wide">Daily Journal & Mood</h2>
            <p className="text-[11px] font-mono text-pink-300/70">Reflections, Mood Tracking & Growth</p>
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

      <div className="flex-1 overflow-y-auto p-4 max-w-3xl mx-auto w-full space-y-5">
        <div className="p-4 rounded-3xl bg-[#081533] border border-cyan-500/20 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold font-display text-white">How are you feeling right now?</h3>
            <span className="text-xs font-mono text-cyan-300">{selectedMood}</span>
          </div>

          <div className="grid grid-cols-5 gap-2">
            {moods.map((m) => (
              <button
                key={m.label}
                onClick={() => {
                  setSelectedMood(m.label);
                  onSaveMood?.(m.label);
                }}
                className={`p-3 rounded-2xl border transition flex flex-col items-center gap-1.5 cursor-pointer ${
                  selectedMood === m.label
                    ? "bg-pink-500/20 border-pink-400 text-white shadow-[0_0_15px_rgba(244,63,94,0.3)] scale-105"
                    : "bg-[#061026] border-white/5 hover:border-white/20 text-slate-300"
                }`}
              >
                <span className="text-xl">{m.emoji}</span>
                <span className="text-[10px] font-mono">{m.label}</span>
              </button>
            ))}
          </div>

          <div className="pt-2 border-t border-white/5 space-y-1">
            <div className="flex justify-between text-xs font-mono text-slate-300">
              <span>Energy Level</span>
              <span className="text-cyan-300 font-bold">{energyLevel}%</span>
            </div>
            <input
              type="range"
              min="10"
              max="100"
              value={energyLevel}
              onChange={(e) => setEnergyLevel(Number(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-[#061026] border border-white/10 shadow-lg space-y-3">
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-300 font-bold uppercase tracking-wider">
            <Feather size={14} />
            <span>Today's Reflection</span>
          </div>
          <textarea
            value={entryText}
            onChange={(e) => setEntryText(e.target.value)}
            placeholder="What's on your mind today? Insights, challenges, accomplishments..."
            rows={3}
            className="w-full bg-[#040914] border border-cyan-500/20 rounded-2xl p-3 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 font-sans resize-none"
          />
          <input
            type="text"
            value={gratitudeText}
            onChange={(e) => setGratitudeText(e.target.value)}
            placeholder="One thing you're grateful for today..."
            className="w-full bg-[#040914] border border-cyan-500/20 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none font-sans"
          />
          <div className="flex justify-end pt-1">
            <button
              onClick={handleSaveEntry}
              disabled={!entryText.trim() && !gratitudeText.trim()}
              className="px-4 py-2 bg-gradient-to-r from-pink-500 to-cyan-500 hover:opacity-90 disabled:opacity-30 text-white font-bold rounded-xl text-xs font-mono shadow-md flex items-center gap-1.5 transition cursor-pointer"
            >
              <Save size={13} />
              <span>Save Journal Entry</span>
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="text-xs font-mono uppercase tracking-widest text-slate-400">
            Past Journal Logs ({entries.length})
          </h4>
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="p-4 rounded-2xl bg-[#061026] border border-white/5 hover:border-white/10 shadow-md space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono text-cyan-400 font-bold">{entry.mood}</span>
                  <span className="text-[10px] font-mono text-slate-500">• {entry.date}</span>
                </div>
                <button
                  onClick={() => deleteEntry(entry.id)}
                  className="p-1 text-slate-500 hover:text-rose-400 transition cursor-pointer"
                >
                  <Trash2 size={13} />
                </button>
              </div>
              {entry.text && (
                <p className="text-xs text-slate-300 leading-relaxed font-sans">{entry.text}</p>
              )}
              {entry.gratitude && (
                <div className="p-2 rounded-xl bg-pink-950/20 border border-pink-500/20 text-[11px] font-sans text-pink-300">
                  💖 Gratitude: {entry.gratitude}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
