import { Link, useLocation } from "react-router-dom";
import useAuthStore from "../stores/authStore";
import {
  Flame,
  CalendarCheck,
  Dumbbell,
  BookOpen,
  MapPin,
  Sparkles
} from "lucide-react";

const items = [
  { path: "/", icon: Flame, label: "Today" },
  { path: "/challenges", icon: CalendarCheck, label: "30-Day" },
  { path: "/workouts", icon: Dumbbell, label: "Workouts" },
  { path: "/library", icon: BookOpen, label: "Exercises" },
  { path: "/maps", icon: MapPin, label: "Maps" },
  { path: "/knowledge", icon: Sparkles, label: "Knowledge" },
];

export default function Navbar() {
  const { pathname } = useLocation();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isAuthenticated) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-zinc-950/95 backdrop-blur-xl border-t border-zinc-800/80 z-50 py-1">
      <div className="max-w-2xl mx-auto flex justify-between px-2">
        {items.map(({ path, icon: Icon, label }) => {
          const isActive = pathname === path || (path !== "/" && pathname.startsWith(path));
          return (
            <Link
              key={path}
              to={path}
              className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all ${
                isActive
                  ? "text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Icon size={19} strokeWidth={isActive ? 2.5 : 1.8} />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
