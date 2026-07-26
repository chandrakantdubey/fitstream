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
  Sparkles,
  User,
  Activity
} from "lucide-react";

const API_BASE = "http://localhost:8000";

export default function Home() {
  const [dailyLog, setDailyLog] = useState(null);
  const [streakData, setStreakData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showCustomWaterModal, setShowCustomWaterModal] = useState(false);
  const [customWaterInput, setCustomWaterInput] = useState("");

  const [heightInput, setHeightInput] = useState("");
  const [weightInput, setWeightInput] = useState("");
  const [targetWeightInput, setTargetWeightInput] = useState("");
  const [ageInput, setAgeInput] = useState("");
  const [waistInput, setWaistInput] = useState("");
  const [bicepInput, setBicepInput] = useState("");

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

      if (logData) {
        if (logData.height_cm) setHeightInput(logData.height_cm);
        if (logData.weight_kg) setWeightInput(logData.weight_kg);
        if (logData.target_weight_kg) setTargetWeightInput(logData.target_weight_kg);
        if (logData.age) setAgeInput(logData.age);
        if (logData.waist_cm) setWaistInput(logData.waist_cm);
        if (logData.bicep_cm) setBicepInput(logData.bicep_cm);
      }
    } catch (err) {
      console.error("Error fetching daily dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const addWater = async (amount, setExact = false) => {
    try {
      const res = await fetch(`${API_BASE}/daily/water`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: "1", amount_ml: amount, set_exact: setExact })
      });
      const data = await res.json();
      setDailyLog(prev => prev ? { ...prev, water_ml: data.water_ml } : null);
    } catch (err) {
      console.error("Error updating water:", err);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      await fetch(`${API_BASE}/daily/metrics`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: "1",
          height_cm: heightInput ? parseFloat(heightInput) : undefined,
          weight_kg: weightInput ? parseFloat(weightInput) : undefined,
          target_weight_kg: targetWeightInput ? parseFloat(targetWeightInput) : undefined,
          age: ageInput ? parseInt(ageInput) : undefined,
          waist_cm: waistInput ? parseFloat(waistInput) : undefined,
          bicep_cm: bicepInput ? parseFloat(bicepInput) : undefined
        })
      });
      setShowProfileModal(false);
      fetchDashboardData();
    } catch (err) {
      console.error("Error saving physical profile:", err);
    }
  };

  // Ring calculations
  const activeMins = dailyLog?.active_minutes || 0;
  const activePct = Math.min(100, Math.round((activeMins / 30) * 100)); // Target 30 mins

  const cals = dailyLog?.calories_burned || 0;
  const calsPct = Math.min(100, Math.round((cals / 300) * 100)); // Target 300 kcal

  const waterMl = dailyLog?.water_ml || 0;
  const waterTarget = dailyLog?.target_water_ml || 2450;
  const waterPct = Math.min(100, Math.round((waterMl / waterTarget) * 100));

  const quickWorkouts = [
    { title: "7-Min Morning Warmup", duration: "7 min", level: "Beginner", area: "Full Body", id: "warmup-7" },
    { title: "10-Min Abs Scorcher", duration: "10 min", level: "Intermediate", area: "Core", id: "abs-10" },
    { title: "15-Min HIIT Fat Burn", duration: "15 min", level: "Advanced", area: "Cardio", id: "hiit-15" },
    { title: "Bedtime Muscle Stretch", duration: "8 min", level: "All Levels", area: "Recovery", id: "stretch-8" }
  ];

  return (
    <div className="space-y-6 pb-24 max-w-2xl mx-auto px-1">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950 via-zinc-900 to-zinc-900 border border-emerald-800/40 p-6 shadow-xl">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex items-center justify-between">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-3">
              <Sparkles size={13} /> FitStream Today
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Keep Moving Forward!</h1>
            <p className="text-sm text-zinc-400 mt-1">Track workouts, hydration & physical metrics</p>
          </div>
          <div className="flex flex-col items-center justify-center bg-zinc-900/90 border border-amber-500/30 p-3.5 rounded-2xl shadow-lg">
            <Flame size={28} className="text-amber-500 animate-pulse fill-amber-500" />
            <span className="text-xl font-bold text-white mt-1">{streakData?.current_streak || 0}</span>
            <span className="text-[10px] text-zinc-400 font-medium uppercase tracking-wider">Day Streak</span>
          </div>
        </div>
      </div>

      {/* 3 Dynamic Activity Progress Rings */}
      <div className="surface p-6 border border-zinc-800 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Activity size={18} className="text-emerald-400" /> Daily Goal Progress Rings
        </h3>

        <div className="grid grid-cols-3 gap-3 text-center">
          {/* Active Minutes Ring */}
          <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800 flex flex-col items-center justify-between space-y-2">
            <div className="relative w-16 h-16 flex items-center justify-center">
              <svg className="w-16 h-16 transform -rotate-90">
                <circle cx="32" cy="32" r="26" stroke="#27272a" strokeWidth="6" fill="transparent" />
                <circle
                  cx="32"
                  cy="32"
                  r="26"
                  stroke="#10b981"
                  strokeWidth="6"
                  strokeDasharray="163"
                  strokeDashoffset={163 - (163 * activePct) / 100}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-500"
                />
              </svg>
              <Clock size={18} className="text-emerald-400 absolute" />
            </div>
            <div>
              <div className="text-base font-extrabold text-white">{activeMins} <span className="text-[10px] text-zinc-400">/ 30m</span></div>
              <div className="text-[10px] text-emerald-400 font-semibold mt-0.5">Active Time</div>
            </div>
          </div>

          {/* Calories Burned Ring */}
          <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800 flex flex-col items-center justify-between space-y-2">
            <div className="relative w-16 h-16 flex items-center justify-center">
              <svg className="w-16 h-16 transform -rotate-90">
                <circle cx="32" cy="32" r="26" stroke="#27272a" strokeWidth="6" fill="transparent" />
                <circle
                  cx="32"
                  cy="32"
                  r="26"
                  stroke="#f59e0b"
                  strokeWidth="6"
                  strokeDasharray="163"
                  strokeDashoffset={163 - (163 * calsPct) / 100}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-500"
                />
              </svg>
              <Zap size={18} className="text-amber-400 absolute" />
            </div>
            <div>
              <div className="text-base font-extrabold text-white">{cals} <span className="text-[10px] text-zinc-400">/ 300k</span></div>
              <div className="text-[10px] text-amber-400 font-semibold mt-0.5">Est. Burned</div>
            </div>
          </div>

          {/* Hydration Goal Ring */}
          <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800 flex flex-col items-center justify-between space-y-2">
            <div className="relative w-16 h-16 flex items-center justify-center">
              <svg className="w-16 h-16 transform -rotate-90">
                <circle cx="32" cy="32" r="26" stroke="#27272a" strokeWidth="6" fill="transparent" />
                <circle
                  cx="32"
                  cy="32"
                  r="26"
                  stroke="#3b82f6"
                  strokeWidth="6"
                  strokeDasharray="163"
                  strokeDashoffset={163 - (163 * waterPct) / 100}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-500"
                />
              </svg>
              <Droplet size={18} className="text-blue-400 absolute fill-blue-400" />
            </div>
            <div>
              <div className="text-base font-extrabold text-white">{waterMl} <span className="text-[10px] text-zinc-400">ml</span></div>
              <div className="text-[10px] text-blue-300 font-semibold mt-0.5">{waterPct}% Hydrated</div>
            </div>
          </div>
        </div>
      </div>

      {/* User Physical Profile Card */}
      <div className="surface p-6 border border-zinc-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-white font-bold text-base">
            <User size={20} className="text-emerald-400" /> Physical Profile & Body Stats
          </div>
          <button
            onClick={() => setShowProfileModal(true)}
            className="btn-ghost text-xs py-1.5 px-3 font-semibold text-emerald-400 border-emerald-500/30"
          >
            Edit Profile
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-zinc-950 p-3.5 rounded-2xl border border-zinc-800/80">
            <div className="text-xs text-zinc-500 font-medium">Height</div>
            <div className="text-xl font-extrabold text-white mt-1">
              {dailyLog?.height_cm || 175} <span className="text-xs font-normal text-zinc-400">cm</span>
            </div>
          </div>

          <div className="bg-zinc-950 p-3.5 rounded-2xl border border-zinc-800/80">
            <div className="text-xs text-zinc-500 font-medium">Weight</div>
            <div className="text-xl font-extrabold text-white mt-1">
              {dailyLog?.weight_kg || 70} <span className="text-xs font-normal text-zinc-400">kg</span>
            </div>
            {dailyLog?.target_weight_kg && (
              <div className="text-[10px] text-emerald-400 mt-0.5">Target: {dailyLog.target_weight_kg} kg</div>
            )}
          </div>

          <div className="bg-zinc-950 p-3.5 rounded-2xl border border-zinc-800/80">
            <div className="text-xs text-zinc-500 font-medium">BMI</div>
            <div className="text-xl font-extrabold text-emerald-400 mt-1">
              {dailyLog?.bmi || 22.9}
            </div>
            <div className="text-[10px] text-zinc-400 mt-0.5">{dailyLog?.bmi_category || "Normal"}</div>
          </div>

          <div className="bg-zinc-950 p-3.5 rounded-2xl border border-zinc-800/80">
            <div className="text-xs text-zinc-500 font-medium">BMR Calories</div>
            <div className="text-xl font-extrabold text-amber-400 mt-1">
              {dailyLog?.bmr_calories || 1680} <span className="text-xs font-normal text-zinc-400">kcal</span>
            </div>
            <div className="text-[10px] text-zinc-400 mt-0.5">Basal rate</div>
          </div>
        </div>
      </div>

      {/* Hydration Tracker Widget */}
      <div className="surface p-6 border border-blue-900/30">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Droplet size={22} className="fill-blue-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Hydration Tracker</h3>
              <p className="text-xs text-zinc-400">Target: {waterTarget} ml / day (weight based)</p>
            </div>
          </div>
          <span className="text-xl font-extrabold text-blue-400">{waterMl} ml</span>
        </div>

        <div className="w-full bg-zinc-800 rounded-full h-3.5 overflow-hidden mb-4 border border-zinc-700/50">
          <div
            className="bg-gradient-to-r from-blue-600 to-cyan-400 h-full transition-all duration-300 rounded-full"
            style={{ width: `${waterPct}%` }}
          ></div>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          <button
            onClick={() => addWater(250)}
            className="py-2.5 px-3 bg-blue-950/60 hover:bg-blue-900/80 text-blue-300 text-xs font-semibold rounded-xl border border-blue-800/40 flex items-center justify-center gap-1 transition-all"
          >
            <Plus size={14} /> +250 ml
          </button>
          <button
            onClick={() => addWater(500)}
            className="py-2.5 px-3 bg-blue-950/60 hover:bg-blue-900/80 text-blue-300 text-xs font-semibold rounded-xl border border-blue-800/40 flex items-center justify-center gap-1 transition-all"
          >
            <Plus size={14} /> +500 ml
          </button>
          <button
            onClick={() => addWater(750)}
            className="py-2.5 px-3 bg-blue-950/60 hover:bg-blue-900/80 text-blue-300 text-xs font-semibold rounded-xl border border-blue-800/40 flex items-center justify-center gap-1 transition-all"
          >
            <Plus size={14} /> +750 ml
          </button>
          <button
            onClick={() => setShowCustomWaterModal(true)}
            className="py-2.5 px-3 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-semibold rounded-xl border border-zinc-700/50 flex items-center justify-center gap-1 transition-all col-span-3 sm:col-span-1"
          >
            Custom Amount
          </button>
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
            <div key={w.id} className="surface p-4 flex items-center justify-between surface-hover border border-zinc-800">
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

      {/* Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 max-w-md w-full space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-white">Update Physical Profile</h3>
            <form onSubmit={handleSaveProfile} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">Height (cm)</label>
                  <input
                    type="number"
                    step="0.5"
                    placeholder="175"
                    value={heightInput}
                    onChange={(e) => setHeightInput(e.target.value)}
                    className="input-modern w-full"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">Age</label>
                  <input
                    type="number"
                    placeholder="25"
                    value={ageInput}
                    onChange={(e) => setAgeInput(e.target.value)}
                    className="input-modern w-full"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">Current Weight (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="70.0"
                    value={weightInput}
                    onChange={(e) => setWeightInput(e.target.value)}
                    className="input-modern w-full"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">Target Weight (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="68.0"
                    value={targetWeightInput}
                    onChange={(e) => setTargetWeightInput(e.target.value)}
                    className="input-modern w-full"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowProfileModal(false)}
                  className="btn-ghost flex-1 py-2.5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-brand flex-1 py-2.5 font-bold"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Custom Water Modal */}
      {showCustomWaterModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 max-w-sm w-full space-y-4">
            <h3 className="text-lg font-bold text-white">Log Water Intake (ml)</h3>
            <div>
              <input
                type="number"
                placeholder="e.g. 350"
                value={customWaterInput}
                onChange={(e) => setCustomWaterInput(e.target.value)}
                className="input-modern w-full"
              />
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowCustomWaterModal(false)}
                className="btn-ghost flex-1 py-2.5"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (customWaterInput) {
                    addWater(parseInt(customWaterInput));
                    setShowCustomWaterModal(false);
                    setCustomWaterInput("");
                  }
                }}
                className="btn-brand flex-1 py-2.5 font-bold"
              >
                Add Water
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
