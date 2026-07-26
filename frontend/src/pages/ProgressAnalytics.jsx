import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  TrendingUp,
  Scale,
  Activity,
  Clock,
  Zap,
  CheckCircle2,
  ArrowLeft,
  Calendar,
  Sparkles,
  Plus
} from "lucide-react";

const API_BASE = "http://localhost:8000";

export default function ProgressAnalytics() {
  const [dailyLog, setDailyLog] = useState(null);
  const [streakData, setStreakData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [logRes, streakRes] = await Promise.all([
          fetch(`${API_BASE}/daily/log?user_id=1`),
          fetch(`${API_BASE}/daily/streak?user_id=1`)
        ]);
        const lData = await logRes.json();
        const sData = await streakRes.json();
        setDailyLog(lData);
        setStreakData(sData);
      } catch (err) {
        console.error("Error loading analytics data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const currentW = dailyLog?.weight_kg || 70.0;
  const targetW = dailyLog?.target_weight_kg || 68.0;
  const height = dailyLog?.height_cm || 175.0;
  const diff = parseFloat((currentW - targetW).toFixed(1));

  return (
    <div className="space-y-6 pb-24 max-w-2xl mx-auto px-1">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <TrendingUp className="text-emerald-400" size={26} /> Progress Analytics
          </h1>
          <p className="page-subtitle">
            Body weight progress toward target goal, measurement logs & activity history.
          </p>
        </div>
        <Link
          to="/"
          className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white"
        >
          <ArrowLeft size={18} />
        </Link>
      </div>

      {/* Weight Progress & Target Goal Card */}
      <div className="surface p-6 border border-zinc-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-white font-bold text-base">
            <Scale size={20} className="text-emerald-400" /> Weight Progress & Goal Target
          </div>
          <span className="badge text-[10px] text-emerald-400 border-emerald-500/30 bg-emerald-500/10 font-bold">
            {dailyLog?.bmi_category || "Normal Weight"}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800">
            <div className="text-xs text-zinc-400 font-medium">Current Weight</div>
            <div className="text-2xl font-black text-white mt-1">{currentW} <span className="text-xs text-zinc-500 font-normal">kg</span></div>
          </div>

          <div className="bg-zinc-950 p-4 rounded-2xl border border-emerald-500/40">
            <div className="text-xs text-emerald-400 font-medium">Target Weight</div>
            <div className="text-2xl font-black text-emerald-400 mt-1">{targetW} <span className="text-xs text-zinc-500 font-normal">kg</span></div>
          </div>

          <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800">
            <div className="text-xs text-zinc-400 font-medium">Remaining</div>
            <div className="text-2xl font-black text-amber-400 mt-1">{Math.abs(diff)} <span className="text-xs text-zinc-500 font-normal">kg</span></div>
            <div className="text-[10px] text-zinc-500 mt-0.5">{diff > 0 ? "To Lose" : "To Gain"}</div>
          </div>
        </div>

        {/* Visual Progress Bar */}
        <div className="space-y-1.5 pt-2">
          <div className="flex justify-between text-xs text-zinc-400 font-medium">
            <span>Goal Weight Gap</span>
            <span className="text-emerald-400 font-bold">{diff === 0 ? "Goal Reached!" : `${Math.abs(diff)} kg remaining`}</span>
          </div>
          <div className="w-full bg-zinc-800 h-3 rounded-full overflow-hidden border border-zinc-700/50">
            <div
              className="bg-gradient-to-r from-emerald-600 to-emerald-400 h-full transition-all duration-300 rounded-full"
              style={{ width: `${Math.max(10, Math.min(100, 100 - (Math.abs(diff) / currentW) * 100))}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Body Measurements Card */}
      <div className="surface p-6 border border-zinc-800 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Activity size={18} className="text-emerald-400" /> Body Circumference Measurements
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800 text-center">
            <div className="text-xs text-zinc-500">Waist</div>
            <div className="text-xl font-extrabold text-white mt-1">
              {dailyLog?.waist_cm || "--"} <span className="text-xs text-zinc-500 font-normal">cm</span>
            </div>
          </div>

          <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800 text-center">
            <div className="text-xs text-zinc-500">Chest</div>
            <div className="text-xl font-extrabold text-white mt-1">
              {dailyLog?.chest_cm || "--"} <span className="text-xs text-zinc-500 font-normal">cm</span>
            </div>
          </div>

          <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800 text-center">
            <div className="text-xs text-zinc-500">Biceps</div>
            <div className="text-xl font-extrabold text-white mt-1">
              {dailyLog?.bicep_cm || "--"} <span className="text-xs text-zinc-500 font-normal">cm</span>
            </div>
          </div>

          <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800 text-center">
            <div className="text-xs text-zinc-500">Thighs</div>
            <div className="text-xl font-extrabold text-white mt-1">
              {dailyLog?.thigh_cm || "--"} <span className="text-xs text-zinc-500 font-normal">cm</span>
            </div>
          </div>
        </div>
      </div>

      {/* Workout History & Activity Summary */}
      <div className="surface p-6 border border-zinc-800 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Calendar size={18} className="text-emerald-400" /> Activity Performance Summary
        </h3>

        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800">
            <div className="text-xs text-zinc-500">Total Workouts</div>
            <div className="text-2xl font-black text-emerald-400 mt-1">{streakData?.total_workouts || 0}</div>
          </div>

          <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800">
            <div className="text-xs text-zinc-500">Active Minutes</div>
            <div className="text-2xl font-black text-white mt-1">{dailyLog?.active_minutes || 0} m</div>
          </div>

          <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800">
            <div className="text-xs text-zinc-500">Est Burned</div>
            <div className="text-2xl font-black text-amber-400 mt-1">{dailyLog?.calories_burned || 0} k</div>
          </div>
        </div>
      </div>
    </div>
  );
}
