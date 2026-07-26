import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../stores/authStore";
import { Settings as SettingsIcon, Volume2, Database, LogOut, RotateCcw, ShieldAlert } from "lucide-react";

const API_BASE = "http://localhost:8000";

export default function Settings() {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);

  const [autoRestTimer, setAutoRestTimer] = useState(true);
  const [units, setUnits] = useState("Metric (kg, km)");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [message, setMessage] = useState("");
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await fetch(`${API_BASE}/auth/me`);
        const data = await res.json();
        setUserProfile(data);
      } catch (err) {
        console.error("Error loading user profile:", err);
      }
    };
    fetchMe();
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleResetToday = async () => {
    try {
      const res = await fetch(`${API_BASE}/reset/today?user_id=1`, { method: "POST" });
      const data = await res.json();
      setMessage(data.message || "Today's tracking metrics reset.");
    } catch (err) {
      console.error("Error resetting today:", err);
    }
  };

  const handleClearRoutines = async () => {
    try {
      const res = await fetch(`${API_BASE}/reset/custom-workouts?user_id=1`, { method: "POST" });
      const data = await res.json();
      setMessage(data.message || "Custom routines cleared.");
    } catch (err) {
      console.error("Error clearing routines:", err);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await fetch(`${API_BASE}/auth/account`, { method: "DELETE" });
      logout();
      navigate("/login");
    } catch (err) {
      console.error("Error deleting account:", err);
    }
  };

  const name = userProfile?.full_name || user?.full_name || "FitStream Athlete";
  const initials = name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "FA";

  return (
    <div className="space-y-6 pb-24 max-w-2xl mx-auto px-1">
      <div>
        <h1 className="page-title flex items-center gap-2">
          <SettingsIcon className="text-emerald-400" size={26} /> Settings & Profile
        </h1>
        <p className="page-subtitle">
          Manage athlete profile, units, voice cues, and data reset preferences.
        </p>
      </div>

      {message && (
        <div className="p-3 bg-emerald-950/60 border border-emerald-500/50 rounded-xl text-xs text-emerald-300 font-semibold">
          {message}
        </div>
      )}

      {/* Athlete Profile Card */}
      <div className="surface p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-zinc-800">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-extrabold text-xl shrink-0">
            {initials}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white">{name}</h2>
              <span className="badge text-[10px] text-emerald-400 border-emerald-500/30 bg-emerald-500/10">
                PRO ATHLETE
              </span>
            </div>
            <p className="text-xs text-zinc-400">{userProfile?.email || user?.email || "athlete@fitstream.app"}</p>
            <div className="text-[11px] text-zinc-500">
              Height: {userProfile?.height_cm || 175} cm • Weight: {userProfile?.weight_kg || 70} kg
            </div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="btn-ghost text-xs py-2.5 px-4 font-bold flex items-center gap-2 w-full sm:w-auto justify-center"
        >
          <LogOut size={16} /> Log Out
        </button>
      </div>

      {/* Live Workout Preferences */}
      <div className="surface p-6 space-y-4 border border-zinc-800">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Volume2 size={18} className="text-emerald-400" /> Live Workout Player Preferences
        </h3>

        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-zinc-800/80">
            <div>
              <div className="text-xs font-semibold text-white">Units Measurement</div>
              <div className="text-[11px] text-zinc-400">Default load & distance system</div>
            </div>
            <select
              value={units}
              onChange={(e) => setUnits(e.target.value)}
              className="bg-zinc-900 border border-zinc-700 text-xs text-white rounded-xl px-3 py-1.5 focus:outline-none"
            >
              <option value="Metric (kg, km)">Metric (kg, km)</option>
              <option value="Imperial (lbs, mi)">Imperial (lbs, mi)</option>
            </select>
          </div>

          <div className="flex items-center justify-between py-2 border-b border-zinc-800/80">
            <div>
              <div className="text-xs font-semibold text-white">Auto Rest Countdowns</div>
              <div className="text-[11px] text-zinc-400">Start rest timer automatically after set completion</div>
            </div>
            <button
              onClick={() => setAutoRestTimer(!autoRestTimer)}
              className={`w-12 h-6 rounded-full p-1 transition-all ${
                autoRestTimer ? "bg-emerald-600" : "bg-zinc-800"
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-all ${
                  autoRestTimer ? "translate-x-6" : "translate-x-0"
                }`}
              ></div>
            </button>
          </div>
        </div>
      </div>

      {/* Reset & Account Controls */}
      <div className="surface p-6 space-y-4 border border-zinc-800">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <RotateCcw size={18} className="text-amber-400" /> Data Reset & Account Management
        </h3>

        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-zinc-800/80">
            <div>
              <div className="text-xs font-semibold text-white">Reset Today's Metrics</div>
              <div className="text-[11px] text-zinc-400">Reset water intake, active minutes, and calories for today</div>
            </div>
            <button
              onClick={handleResetToday}
              className="btn-ghost text-xs px-3 py-1.5 font-bold"
            >
              Reset Today
            </button>
          </div>

          <div className="flex items-center justify-between py-2 border-b border-zinc-800/80">
            <div>
              <div className="text-xs font-semibold text-white">Clear Custom Routines</div>
              <div className="text-[11px] text-zinc-400">Remove all custom routines created with the builder or AI</div>
            </div>
            <button
              onClick={handleClearRoutines}
              className="btn-ghost text-xs px-3 py-1.5 font-bold text-amber-400 border-amber-500/30"
            >
              Clear Routines
            </button>
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <div className="text-xs font-semibold text-red-400">Delete Account & Permanent Wipe</div>
              <div className="text-[11px] text-zinc-400">Permanently delete user profile, workouts, daily logs, and maps</div>
            </div>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="btn-danger text-xs px-3 py-1.5 font-bold"
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-red-500/50 rounded-3xl p-6 max-w-sm w-full space-y-4">
            <div className="flex items-center gap-2 text-red-400 font-bold">
              <ShieldAlert size={20} /> Permanent Account Deletion
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed">
              Are you sure you want to permanently delete your account? All custom routines, 30-day challenge progress, daily logs, and outdoor GPS maps will be permanently removed.
            </p>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="btn-ghost flex-1 py-2.5"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                className="btn-danger flex-1 py-2.5 font-bold"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
