import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Flame,
  Droplet,
  Clock,
  Zap,
  CheckCircle2,
  TrendingUp,
  Plus,
  Play,
  Scale,
  Award,
  ChevronRight,
  Sparkles
} from "lucide-react";

const API_BASE = "http://localhost:8000";

export default function Home() {
  const [dailyLog, setDailyLog] = useState(null);
  const [streakData, setStreakData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showWeightModal, setShowWeightModal] = useState(false);
  const [weightInput, setWeightInput] = useState("");
  const [waistInput, setWaistInput] = useState("");

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [logRes, streakRes] = await Promise.all([
        fetch(`${API_BASE}/daily/log?user_id=1`),
        fetch(`${API_BASE}/daily/streak?user_id=1`)
      ]);
      const logData = await logRes.json();
      const sData = await streakRes.json();
      setDailyLog(logData);
      setStreakData(sData);
    } catch (err) {
      console.error("Error fetching daily dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const addWater = async (amount) => {
    try {
      const res = await fetch(`${API_BASE}/daily/water`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: 1, amount_ml: amount })
      });
      const data = await res.json();
      setDailyLog(prev => prev ? { ...prev, water_ml: data.water_ml } : null);
    } catch (err) {
      console.error("Error updating water:", err);
    }
  };

  const handleSaveMetrics = async (e) => {
    e.preventDefault();
    try {
      await fetch(`${API_BASE}/daily/metrics`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: 1,
          weight_kg: weightInput ? parseFloat(weightInput) : undefined,
          waist_cm: waistInput ? parseFloat(waistInput) : undefined
        })
      });
      setShowWeightModal(false);
      fetchDashboardData();
    } catch (err) {
      console.error("Error saving metrics:", err);
    }
  };

  const quickWorkouts = [
    { title: "7-Min Morning Warmup", duration: "7 min", level: "Beginner", area: "Full Body", id: "warmup-7" },
    { title: "10-Min Abs Scorcher", duration: "10 min", level: "Intermediate", area: "Core", id: "abs-10" },
    { title: "15-Min HIIT Fat Burn", duration: "15 min", level: "Advanced", area: "Cardio", id: "hiit-15" },
    { title: "Bedtime Muscle Stretch", duration: "8 min", level: "All Levels", area: "Recovery", id: "stretch-8" }
  ];

  return (
    <div className="space-y-6 pb-20">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950 via-zinc-900 to-zinc-900 border border-emerald-800/40 p-6 shadow-xl">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex items-center justify-between">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-3">
              <Sparkles size={13} /> FitStream Today
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Keep the Momentum!</h1>
            <p className="text-sm text-zinc-400 mt-1">Track your daily exercises, hydration & progress</p>
          </div>
          <div className="flex flex-col items-center justify-center bg-zinc-900/90 border border-amber-500/30 p-3.5 rounded-2xl shadow-lg">
            <Flame size={28} className="text-amber-500 animate-pulse fill-amber-500" />
            <span className="text-xl font-bold text-white mt-1">{streakData?.current_streak || 0}</span>
            <span className="text-[10px] text-zinc-400 font-medium uppercase tracking-wider">Day Streak</span>
          </div>
        </div>
      </div>

      {/* Daily Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="stat-card flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-400 font-medium">Active Time</span>
            <Clock size={16} className="text-emerald-400" />
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-white">{dailyLog?.active_minutes || 0}</span>
            <span className="text-xs text-zinc-500 ml-1">mins</span>
          </div>
        </div>

        <div className="stat-card flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-400 font-medium">Est. Burned</span>
            <Zap size={16} className="text-amber-400" />
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-white">{dailyLog?.calories_burned || 0}</span>
            <span className="text-xs text-zinc-500 ml-1">kcal</span>
          </div>
        </div>

        <div className="stat-card flex flex-col justify-between col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-400 font-medium">Workouts</span>
            <CheckCircle2 size={16} className="text-blue-400" />
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-white">{dailyLog?.workouts_completed_today || 0}</span>
            <span className="text-xs text-zinc-500 ml-1">today</span>
          </div>
        </div>
      </div>

      {/* Water Intake Tracker Widget */}
      <div className="surface p-5 border border-blue-900/30">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Droplet size={20} className="fill-blue-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Water Intake Tracker</h3>
              <p className="text-xs text-zinc-400">Target: {dailyLog?.target_water_ml || 2500} ml / day</p>
            </div>
          </div>
          <span className="text-lg font-extrabold text-blue-400">{dailyLog?.water_ml || 0} ml</span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-zinc-800 rounded-full h-3 overflow-hidden mb-4 border border-zinc-700/50">
          <div
            className="bg-gradient-to-r from-blue-600 to-cyan-400 h-full transition-all duration-300 rounded-full"
            style={{ width: `${Math.min(100, ((dailyLog?.water_ml || 0) / (dailyLog?.target_water_ml || 2500)) * 100)}%` }}
          ></div>
        </div>

        {/* Quick Add Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => addWater(250)}
            className="flex-1 py-2 px-3 bg-blue-950/60 hover:bg-blue-900/80 text-blue-300 text-xs font-semibold rounded-xl border border-blue-800/40 flex items-center justify-center gap-1 transition-all"
          >
            <Plus size={14} /> +250 ml
          </button>
          <button
            onClick={() => addWater(500)}
            className="flex-1 py-2 px-3 bg-blue-950/60 hover:bg-blue-900/80 text-blue-300 text-xs font-semibold rounded-xl border border-blue-800/40 flex items-center justify-center gap-1 transition-all"
          >
            <Plus size={14} /> +500 ml
          </button>
        </div>
      </div>

      {/* 30-Day Challenge Shortcut Banner */}
      <div className="surface p-5 relative overflow-hidden bg-gradient-to-r from-zinc-900 via-zinc-900 to-emerald-950/50">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold uppercase tracking-wider">
              <Award size={14} /> Featured Program
            </div>
            <h3 className="text-lg font-bold text-white">30-Day Body Transformation</h3>
            <p className="text-xs text-zinc-400 max-w-xs">Structured daily challenges with automatic rest days and difficulty scaling.</p>
          </div>
          <Link
            to="/challenges"
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1 shadow-md shadow-emerald-900/30 transition-all shrink-0"
          >
            Explore <ChevronRight size={16} />
          </Link>
        </div>
      </div>

      {/* Target Area Quick Workouts */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-white">Quick Routines</h2>
          <Link to="/workouts" className="text-xs text-emerald-400 hover:underline font-medium">View All</Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {quickWorkouts.map((w) => (
            <div key={w.id} className="surface p-4 flex items-center justify-between surface-hover">
              <div className="space-y-1">
                <h4 className="text-sm font-semibold text-white">{w.title}</h4>
                <div className="flex items-center gap-2 text-xs text-zinc-400">
                  <span>{w.duration}</span>
                  <span>•</span>
                  <span className="text-emerald-400">{w.area}</span>
                  <span>•</span>
                  <span className="text-zinc-500">{w.level}</span>
                </div>
              </div>
              <Link
                to={`/play/quick-${w.id}`}
                className="p-2.5 rounded-full bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white border border-emerald-500/30 transition-all"
              >
                <Play size={16} className="fill-current" />
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Body Weight Tracker & Activity Heatmap */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Weight Card */}
        <div className="surface p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-zinc-200 font-semibold text-sm">
              <Scale size={18} className="text-emerald-400" /> Body Metrics
            </div>
            <button
              onClick={() => setShowWeightModal(true)}
              className="text-xs text-emerald-400 hover:underline font-medium"
            >
              Update
            </button>
          </div>

          <div className="my-4">
            <div className="text-3xl font-black text-white">
              {dailyLog?.weight_kg ? `${dailyLog.weight_kg} kg` : "Not logged today"}
            </div>
            <p className="text-xs text-zinc-500 mt-0.5">
              Waist: {dailyLog?.waist_cm ? `${dailyLog.waist_cm} cm` : "—"}
            </p>
          </div>

          <div className="text-[11px] text-zinc-500">
            Regularly log metrics to generate progress trends.
          </div>
        </div>

        {/* Activity Calendar Heatmap */}
        <div className="surface p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-zinc-200 font-semibold text-sm">
              <TrendingUp size={18} className="text-amber-400" /> Activity Heatmap
            </div>
            <span className="text-xs text-zinc-400">Past 30 Days</span>
          </div>

          {/* Heatmap Grid */}
          <div className="grid grid-cols-10 gap-1.5 my-3">
            {Array.from({ length: 30 }).map((_, i) => {
              const active = i % 2 === 0 || i % 5 === 0; // demonstration active indicators
              return (
                <div
                  key={i}
                  className={`h-5 rounded-md transition-all ${
                    active
                      ? "bg-emerald-500 shadow-sm shadow-emerald-500/30"
                      : "bg-zinc-800/80 border border-zinc-700/30"
                  }`}
                  title={`Day ${30 - i}`}
                ></div>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-[11px] text-zinc-400">
            <span>Less active</span>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded bg-zinc-800"></span>
              <span className="w-2.5 h-2.5 rounded bg-emerald-500"></span>
            </div>
            <span>Completed workout</span>
          </div>
        </div>
      </div>

      {/* Log Weight Modal */}
      {showWeightModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 max-w-sm w-full space-y-4">
            <h3 className="text-lg font-bold text-white">Log Today's Body Metrics</h3>
            <form onSubmit={handleSaveMetrics} className="space-y-3">
              <div>
                <label className="text-xs text-zinc-400 block mb-1">Body Weight (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="e.g. 75.5"
                  value={weightInput}
                  onChange={(e) => setWeightInput(e.target.value)}
                  className="input-modern w-full"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-400 block mb-1">Waist Circumference (cm)</label>
                <input
                  type="number"
                  step="0.5"
                  placeholder="e.g. 82.0"
                  value={waistInput}
                  onChange={(e) => setWaistInput(e.target.value)}
                  className="input-modern w-full"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowWeightModal(false)}
                  className="btn-ghost flex-1 py-2.5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-brand flex-1 py-2.5"
                >
                  Save Metrics
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
