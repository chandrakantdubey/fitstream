import { Link, useLocation } from "react-router-dom";
import useAuthStore from "../stores/authStore";
import {
  Flame,
  CalendarCheck,
  Dumbbell,
  Grid
} from "lucide-react";

const items = [
  { path: "/", icon: Flame, label: "Today" },
  { path: "/challenges", icon: CalendarCheck, label: "30-Day" },
  { path: "/workouts", icon: Dumbbell, label: "Workouts" },
  { path: "/more", icon: Grid, label: "More" }
];

export default function Navbar() {
  const { pathname } = useLocation();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isAuthenticated) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-zinc-950/95 backdrop-blur-xl border-t border-zinc-800/80 z-50 py-1.5">
      <div className="max-w-md mx-auto flex justify-around px-4">
        {items.map(({ path, icon: Icon, label }) => {
          const isActive = pathname === path || (path !== "/" && pathname.startsWith(path));
          return (
            <Link
              key={path}
              to={path}
              className={`flex flex-col items-center gap-1 px-4 py-1.5 rounded-2xl transition-all ${
                isActive
                  ? "text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
              <span className="text-[11px] font-bold">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
