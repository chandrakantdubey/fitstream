import { Link } from "react-router-dom";
import { BookOpen, MapPin, Sparkles, Settings, ChevronRight, User, Award, ShieldCheck } from "lucide-react";

export default function MoreHub() {
  const menuItems = [
    {
      title: "Exercise Library",
      desc: "Browse 1,300+ exercises with equipment & muscle filters",
      path: "/library",
      icon: BookOpen,
      color: "text-emerald-400",
      badge: "1,300+ EXERCISES"
    },
    {
      title: "Outdoor GPS Maps",
      desc: "Interactive Leaflet maps for running, cycling & walking",
      path: "/maps",
      icon: MapPin,
      color: "text-blue-400",
      badge: "GPS TRACKER"
    },
    {
      title: "Fitness Knowledge Base",
      desc: "Volume science, progressive overload & 1RM calculator",
      path: "/knowledge",
      icon: Sparkles,
      color: "text-amber-400",
      badge: "TRAINING WIKI"
    },
    {
      title: "Settings & Profile",
      desc: "Physical profile metrics, water goals, and account reset",
      path: "/settings",
      icon: Settings,
      color: "text-zinc-400",
      badge: "PROFILE & PREFS"
    }
  ];

  return (
    <div className="space-y-6 pb-24">
      <div>
        <h1 className="page-title">More & Explore</h1>
        <p className="page-subtitle">
          Access exercise database, outdoor maps, fitness knowledge, and athlete settings.
        </p>
      </div>

      {/* User Quick Badge */}
      <div className="surface p-5 border border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-extrabold text-base">
            FA
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white">FitStream Athlete</h2>
              <span className="badge text-[10px] text-emerald-400 border-emerald-500/30 bg-emerald-500/10">PRO</span>
            </div>
            <p className="text-xs text-zinc-400">demo@fitstream.app</p>
          </div>
        </div>
        <Link
          to="/settings"
          className="btn-ghost text-xs py-2 px-3 flex items-center gap-1 font-bold"
        >
          Profile <ChevronRight size={14} />
        </Link>
      </div>

      {/* Explore Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className="surface p-5 flex flex-col justify-between surface-hover space-y-4 border border-zinc-800"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className={`p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 ${item.color}`}>
                    <Icon size={20} />
                  </div>
                  <span className="badge text-[10px]">{item.badge}</span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">{item.title}</h3>
                  <p className="text-xs text-zinc-400 mt-0.5">{item.desc}</p>
                </div>
              </div>

              <div className="flex items-center justify-end text-xs font-bold text-emerald-400 pt-2 border-t border-zinc-800/80">
                Open <ChevronRight size={14} />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
