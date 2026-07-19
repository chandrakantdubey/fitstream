import { useState } from "react";
import {
  searchYouTube,
  searchTwitter,
  searchReddit,
  searchBilibili,
  searchXiaohongshu,
  readWeb,
} from "../utils/api";
import {
  Youtube,
  Twitter,
  MessageSquare,
  Tv,
  BookOpen,
  Globe,
  Search,
  Loader2,
  ExternalLink,
} from "lucide-react";

const TABS = [
  {
    id: "youtube",
    icon: Youtube,
    label: "YouTube",
    color: "text-red-400",
    bg: "bg-red-900/20",
  },
  {
    id: "twitter",
    icon: Twitter,
    label: "Twitter",
    color: "text-sky-400",
    bg: "bg-sky-900/20",
  },
  {
    id: "reddit",
    icon: MessageSquare,
    label: "Reddit",
    color: "text-orange-400",
    bg: "bg-orange-900/20",
  },
  {
    id: "bilibili",
    icon: Tv,
    label: "Bilibili",
    color: "text-pink-400",
    bg: "bg-pink-900/20",
  },
  {
    id: "xiaohongshu",
    icon: BookOpen,
    label: "XHS",
    color: "text-rose-300",
    bg: "bg-rose-900/20",
  },
  {
    id: "web",
    icon: Globe,
    label: "Web",
    color: "text-emerald-400",
    bg: "bg-emerald-900/20",
  },
];

export default function Feeds() {
  const [tab, setTab] = useState("youtube");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const search = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      let res;
      switch (tab) {
        case "youtube":
          res = await searchYouTube(query);
          break;
        case "twitter":
          res = await searchTwitter(query);
          break;
        case "reddit":
          res = await searchReddit(query);
          break;
        case "bilibili":
          res = await searchBilibili(query);
          break;
        case "xiaohongshu":
          res = await searchXiaohongshu(query);
          break;
        case "web":
          res = await readWeb(query);
          break;
      }
      setResults([res]);
    } catch (e) {
      setResults([{ error: e.message }]);
    }
    setLoading(false);
  };

  const render = (item, i) => {
    if (item.error)
      return (
        <div
          key={i}
          className="p-4 text-red-400 text-sm bg-red-900/10 rounded-xl border border-red-900/20"
        >
          Error: {item.error}
        </div>
      );

    if (tab === "youtube" && item.videos?.length) {
      return (
        <div key={i} className="grid gap-3">
          {item.videos.map((v, j) => (
            <a
              key={j}
              href={v.url}
              target="_blank"
              rel="noopener noreferrer"
              className="surface surface-hover flex gap-3 p-3 group"
            >
              {v.thumbnail && (
                <img
                  src={v.thumbnail}
                  alt=""
                  className="w-28 h-20 object-cover rounded-lg bg-zinc-800 shrink-0"
                />
              )}
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-zinc-200 line-clamp-2 group-hover:text-brand-300 transition-colors">
                  {v.title}
                </h4>
                <p className="text-xs text-zinc-500 mt-1">
                  {v.channel}{" "}
                  {v.duration ? `• ${Math.floor(v.duration / 60)}m` : ""}
                </p>
                <span className="text-[10px] text-zinc-600 mt-1 block">
                  via {item.backend || "unknown"}
                </span>
              </div>
              <ExternalLink
                size={14}
                className="text-zinc-600 shrink-0 self-start"
              />
            </a>
          ))}
        </div>
      );
    }

    if (tab === "bilibili" && item.videos?.length) {
      return (
        <div key={i} className="grid gap-3">
          {item.videos.map((v, j) => (
            <a
              key={j}
              href={v.url}
              target="_blank"
              rel="noopener noreferrer"
              className="surface surface-hover flex gap-3 p-3 group"
            >
              {v.pic && (
                <img
                  src={v.pic}
                  alt=""
                  className="w-28 h-20 object-cover rounded-lg bg-zinc-800 shrink-0"
                />
              )}
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-zinc-200 line-clamp-2 group-hover:text-pink-300 transition-colors">
                  {v.title}
                </h4>
                <p className="text-xs text-zinc-500 mt-1">
                  {v.author} {v.play ? `• ${v.play} views` : ""}
                </p>
              </div>
            </a>
          ))}
        </div>
      );
    }

    if (item.content || item.tweets || item.posts || item.notes) {
      return (
        <div key={i} className="surface p-4">
          <pre className="text-xs text-zinc-300 whitespace-pre-wrap font-sans leading-relaxed max-h-80 overflow-y-auto">
            {item.content ||
              JSON.stringify(
                item.tweets || item.posts || item.notes,
                null,
                2,
              ).slice(0, 3000)}
          </pre>
          {item.backend && (
            <span className="text-[10px] text-zinc-600 mt-3 block">
              via {item.backend}
            </span>
          )}
        </div>
      );
    }

    return (
      <div key={i} className="text-xs text-zinc-600 p-4">
        No results
      </div>
    );
  };

  const activeTab = TABS.find((t) => t.id === tab);

  return (
    <div className="space-y-4 pb-4 animate-fade-in">
      <h1 className="page-title">Content Feeds</h1>
      <p className="page-subtitle">
        Search across YouTube, Twitter, Reddit, Bilibili & more
      </p>

      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {TABS.map(({ id, icon: Icon, label, color, bg }) => (
          <button
            key={id}
            onClick={() => {
              setTab(id);
              setResults([]);
            }}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
              tab === id
                ? `${bg} ${color} border border-zinc-700/50`
                : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50"
            }`}
          >
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          placeholder={
            tab === "web" ? "Enter URL..." : `Search ${activeTab?.label}...`
          }
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && search()}
          className="input-modern flex-1 text-sm"
        />
        <button onClick={search} disabled={loading} className="btn-brand px-4">
          {loading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Search size={16} />
          )}
        </button>
      </div>

      <div className="space-y-3">
        {results.map((item, i) => render(item, i))}
      </div>
    </div>
  );
}
