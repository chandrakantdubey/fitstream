import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import useAuthStore from "../stores/authStore";
import { BookOpen, MapPin, Sparkles, Settings, ChevronRight, TrendingUp } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export default function MoreHub() {
  const user = useAuthStore((state) => state.user);
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await fetch(`${API_BASE}/auth/me`);
        const data = await res.json();
        setUserProfile(data);
      } catch (err) {
        console.error("Error loading profile:", err);
      }
    };
    fetchMe();
  }, []);

  const name = userProfile?.full_name || user?.full_name || "FitStream Athlete";
  const initials = name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "FA";

  const menuItems = [
    {
      title: "Progress Analytics",
      desc: "Weight tracking, body measurements & performance trends",
      path: "/analytics",
      icon: TrendingUp,
      color: "text-emerald-400 border-emerald-500/20 bg-emerald-500/10",
      badge: "BODY CHARTS"
    },
    {
      title: "Exercise Library",
      desc: "Browse 1,300+ exercises with equipment & muscle filters",
      path: "/library",
      icon: BookOpen,
      color: "text-blue-400 border-blue-500/20 bg-blue-500/10",
      badge: "1,300+ EXERCISES"
    },
    {
      title: "Outdoor GPS Maps",
      desc: "Interactive Leaflet maps for running, cycling & walking",
      path: "/maps",
      icon: MapPin,
      color: "text-cyan-400 border-cyan-500/20 bg-cyan-500/10",
      badge: "GPS TRACKER"
    },
    {
      title: "Fitness Knowledge Base",
      desc: "1RM Calculator, TDEE Macros & progressive overload science",
      path: "/knowledge",
      icon: Sparkles,
      color: "text-amber-400 border-amber-500/20 bg-amber-500/10",
      badge: "TRAINING WIKI"
    },
    {
      title: "Settings & Profile",
      desc: "Physical profile metrics, water goals, and account reset",
      path: "/settings",
      icon: Settings,
      color: "text-zinc-400 border-zinc-700/50 bg-zinc-900",
      badge: "PROFILE & PREFS"
    }
  ];

  return (
    <div className="space-y-6 pb-24 max-w-2xl mx-auto px-1">
      <div>
        <h1 className="page-title">More & Explore</h1>
        <p className="page-subtitle">
          Access exercise database, outdoor maps, fitness knowledge, and athlete settings.
        </p>
      </div>

      {/* User Quick Badge */}
      <div className="card-gradient-emerald p-5 rounded-3xl flex items-center justify-between shadow-lg glow-emerald">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-extrabold text-base">
            {initials}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white">{name}</h2>
              <span className="badge text-[10px] text-emerald-400 border-emerald-500/30 bg-emerald-500/10">PRO ATHLETE</span>
            </div>
            <p className="text-xs text-zinc-400">{userProfile?.email || user?.email || "athlete@fitstream.app"}</p>
          </div>
        </div>
        <Link
          to="/settings"
          className="btn-ghost text-xs py-2 px-3 flex items-center gap-1 font-bold border-emerald-500/30 text-emerald-400"
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
                  <div className={`p-2.5 rounded-xl border ${item.color}`}>
                    <Icon size={20} />
                  </div>
                  <span className="badge text-[10px] text-zinc-400 border-zinc-800 bg-zinc-950">{item.badge}</span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">{item.title}</h3>
                  <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">{item.desc}</p>
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
