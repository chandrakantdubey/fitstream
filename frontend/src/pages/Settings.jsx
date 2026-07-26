import { useState } from "react";
import { Settings as SettingsIcon, User, Volume2, ShieldCheck, Database, Trash2, Award } from "lucide-react";

export default function Settings() {
  const [voiceGender, setVoiceGender] = useState("Female");
  const [autoRestTimer, setAutoRestTimer] = useState(true);
  const [units, setUnits] = useState("Metric (kg, km)");

  return (
    <div className="space-y-6 pb-24">
      <div>
        <h1 className="page-title flex items-center gap-2">
          <SettingsIcon className="text-emerald-400" size={26} /> Settings & Profile
        </h1>
        <p className="page-subtitle">
          Manage your athlete profile, units, voice cues, and data preferences.
        </p>
      </div>

      {/* Athlete Profile Card */}
      <div className="surface p-6 flex items-center gap-4 border border-zinc-800">
        <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-extrabold text-xl shrink-0">
          FA
        </div>
        <div className="space-y-1 flex-1">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-white">FitStream Athlete</h2>
            <span className="badge text-[10px] text-emerald-400 border-emerald-500/30 bg-emerald-500/10">
              PRO ATHLETE
            </span>
          </div>
          <p className="text-xs text-zinc-400">demo@fitstream.app</p>
          <div className="text-[11px] text-zinc-500">Member since July 2026</div>
        </div>
      </div>

      {/* Workout Player Preferences */}
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

      {/* Application System & Database */}
      <div className="surface p-6 space-y-4 border border-zinc-800">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Database size={18} className="text-blue-400" /> Database & Storage
        </h3>

        <div className="space-y-3">
          <div className="flex items-center justify-between py-2">
            <div>
              <div className="text-xs font-semibold text-white">Local Cache & Storage</div>
              <div className="text-[11px] text-zinc-400">IndexedDB & SQLite Database Sync</div>
            </div>
            <span className="badge text-emerald-400 bg-emerald-500/10 border-emerald-500/30">
              HEALTHY (v2.1.0)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
