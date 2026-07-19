import { Link, useLocation } from "react-router-dom";
import {
  Home,
  BookOpen,
  Dumbbell,
  Newspaper,
  TrendingUp,
  Settings,
} from "lucide-react";

const items = [
  { path: "/", icon: Home, label: "Home" },
  { path: "/library", icon: BookOpen, label: "Library" },
  { path: "/workouts", icon: Dumbbell, label: "Workouts" },
  { path: "/progress", icon: TrendingUp, label: "Progress" },
  { path: "/feeds", icon: Newspaper, label: "Feeds" },
];

export default function Navbar() {
  const { pathname } = useLocation();
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-zinc-900/90 backdrop-blur-xl border-t border-zinc-800/60 z-50">
      <div className="max-w-2xl mx-auto flex justify-around py-2">
        {items.map(({ path, icon: Icon, label }) => (
          <Link
            key={path}
            to={path}
            className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all ${
              pathname === path
                ? "text-brand-400"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <Icon size={20} strokeWidth={pathname === path ? 2.5 : 2} />
            <span className="text-[10px] font-medium">{label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
