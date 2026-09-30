import React, { useState, useEffect } from "react";
import { 
  Music, 
  Play, 
  Search, 
  ExternalLink, 
  X
} from "lucide-react";
import { getBackendBaseUrl } from "../lib/audio";

interface MusicHubProps {
  onClose?: () => void;
}

interface SongResult {
  videoId: string;
  title: string;
  thumbnail: string;
  author: string;
  duration: string;
}

export const MusicHub: React.FC<MusicHubProps> = ({ onClose }) => {
  const [searchQuery, setSearchQuery] = useState<string>("Synthwave Lofi Chill Beats");
  const [results, setResults] = useState<SongResult[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [activeVideoId, setActiveVideoId] = useState<string | null>("jfKfPfyJRdk");
  const [activeTitle, setActiveTitle] = useState<string>("Lofi Hip Hop Radio - Beats to Relax/Study to");

  const searchMusic = async (queryToSearch?: string) => {
    const q = (queryToSearch || searchQuery).trim();
    if (!q) return;
    setIsSearching(true);
    try {
      const baseUrl = getBackendBaseUrl();
      const res = await fetch(`${baseUrl}/api/youtube-search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      if (Array.isArray(data.results)) {
        setResults(data.results);
      }
    } catch (err) {
      console.error("Failed to search music tracks:", err);
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    searchMusic();
  }, []);

  const genres = [
    { label: "Chill Lofi", query: "Lofi Hip Hop chill study beats" },
    { label: "Synthwave", query: "Synthwave cyberpunk 80s electronic" },
    { label: "Focus Piano", query: "Deep focus ambient piano calm" },
    { label: "Anime OST", query: "Anime acoustic chill soundtrack" },
    { label: "EDM Energy", query: "Gaming EDM electro house mix" },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-[#040814] text-white flex flex-col justify-between overflow-hidden">
      <header className="p-4 flex items-center justify-between border-b border-sky-900/30 bg-[#061026]/95 backdrop-blur-md z-20">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300">
            <Music size={20} />
          </div>
          <div>
            <h2 className="text-base font-bold font-display tracking-wide">Maya Audio Player</h2>
            <p className="text-[11px] font-mono text-cyan-300/70">YouTube Stream & Music Launcher</p>
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

      <div className="p-3 bg-[#050c1c] border-b border-white/5 space-y-2 z-20">
        <div className="flex items-center gap-2 bg-[#081533] border border-cyan-500/30 rounded-xl px-3 py-2">
          <Search size={16} className="text-cyan-400 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && searchMusic()}
            placeholder="Search any song, artist, album, or soundtrack..."
            className="w-full bg-transparent text-xs text-white placeholder:text-slate-500 focus:outline-none font-sans"
          />
          <button
            onClick={() => searchMusic()}
            disabled={isSearching}
            className="px-3 py-1 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg text-xs font-mono transition cursor-pointer"
          >
            {isSearching ? "Searching..." : "Search"}
          </button>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {genres.map((g, i) => (
            <button
              key={i}
              onClick={() => {
                setSearchQuery(g.query);
                searchMusic(g.query);
              }}
              className="px-3 py-1 rounded-xl bg-white/5 hover:bg-cyan-500/20 border border-white/10 hover:border-cyan-400/40 text-[11px] font-mono text-slate-300 hover:text-cyan-300 whitespace-nowrap transition cursor-pointer"
            >
              {g.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 max-w-4xl mx-auto w-full space-y-4">
        {activeVideoId && (
          <div className="p-4 rounded-2xl bg-[#081533] border border-cyan-500/30 shadow-2xl">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                <span className="text-xs font-mono font-bold text-cyan-300">NOW PLAYING</span>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={`https://open.spotify.com/search/${encodeURIComponent(searchQuery)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/40 text-[10px] font-mono text-emerald-300 flex items-center gap-1 transition"
                >
                  <span>Spotify Intent</span>
                  <ExternalLink size={10} />
                </a>
              </div>
            </div>

            <div className="relative aspect-video w-full rounded-xl overflow-hidden border border-white/10 bg-black shadow-inner">
              <iframe
                src={`https://www.youtube.com/embed/${activeVideoId}?autoplay=1&enablejsapi=1`}
                title={activeTitle}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full border-0"
              />
            </div>
            
            <h3 className="text-sm font-bold font-display text-white mt-2 truncate">{activeTitle}</h3>
          </div>
        )}

        <div className="space-y-2">
          <h4 className="text-xs font-mono uppercase tracking-widest text-slate-400 mb-2">
            Recommended Tracks & Search Results
          </h4>

          {isSearching ? (
            <div className="py-8 flex flex-col items-center justify-center gap-2 text-xs font-mono text-cyan-300">
              <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
              <span>Fetching tracks from YouTube proxy...</span>
            </div>
          ) : results.length > 0 ? (
            results.map((item) => (
              <div
                key={item.videoId}
                onClick={() => {
                  setActiveVideoId(item.videoId);
                  setActiveTitle(item.title);
                }}
                className={`p-3 rounded-2xl border transition cursor-pointer flex items-center gap-3 ${
                  activeVideoId === item.videoId
                    ? "bg-cyan-500/15 border-cyan-400/60 shadow-[0_0_15px_rgba(6,182,212,0.2)]"
                    : "bg-[#061026] border-white/5 hover:border-cyan-500/30 hover:bg-[#081533]"
                }`}
              >
                <div className="relative w-20 aspect-video rounded-lg overflow-hidden bg-slate-900 shrink-0">
                  <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <Play size={12} className="text-white fill-white" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h5 className="text-xs font-bold text-white truncate font-sans">{item.title}</h5>
                  <p className="text-[11px] text-slate-400 font-mono mt-0.5 truncate">{item.author}</p>
                </div>
                {item.duration && (
                  <span className="text-[10px] font-mono text-slate-500 shrink-0">
                    {item.duration}
                  </span>
                )}
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-xs text-slate-400 font-mono">
              No tracks found. Try searching for an artist or genre.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
