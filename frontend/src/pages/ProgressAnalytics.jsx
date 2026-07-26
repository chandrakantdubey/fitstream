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
  BarChart2,
  PieChart
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export default function ProgressAnalytics() {
  const [dailyLog, setDailyLog] = useState(null);
  const [streakData, setStreakData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hoveredPoint, setHoveredPoint] = useState(null);

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
  const diff = parseFloat((currentW - targetW).toFixed(1));

  // Weight History Trend Line Data Points
  const weightData = [
    { date: "Jul 20", weight: 73.5 },
    { date: "Jul 21", weight: 72.8 },
    { date: "Jul 22", weight: 72.0 },
    { date: "Jul 23", weight: 71.4 },
    { date: "Jul 24", weight: 70.8 },
    { date: "Jul 25", weight: 70.2 },
    { date: "Jul 26", weight: currentW }
  ];

  // Weekly Active Minutes 7-Day Bar Data
  const weeklyActivityData = [
    { day: "Mon", minutes: 25, cals: 220 },
    { day: "Tue", minutes: 35, cals: 310 },
    { day: "Wed", minutes: 40, cals: 350 },
    { day: "Thu", minutes: 15, cals: 140 },
    { day: "Fri", minutes: 45, cals: 410 },
    { day: "Sat", minutes: 30, cals: 280 },
    { day: "Sun", minutes: dailyLog?.active_minutes || 20, cals: dailyLog?.calories_burned || 180 }
  ];

  // SVG Chart Dimensions
  const svgWidth = 500;
  const svgHeight = 160;
  const minW = 66;
  const maxW = 75;

  const points = weightData.map((d, index) => {
    const x = (index / (weightData.length - 1)) * (svgWidth - 40) + 20;
    const y = svgHeight - 30 - ((d.weight - minW) / (maxW - minW)) * (svgHeight - 50);
    return { x, y, ...d };
  });

  const pathD = points.reduce((acc, point, i) => {
    return i === 0 ? `M ${point.x} ${point.y}` : `${acc} L ${point.x} ${point.y}`;
  }, "");

  const areaD = `${pathD} L ${points[points.length - 1].x} ${svgHeight - 20} L ${points[0].x} ${svgHeight - 20} Z`;
  const targetY = svgHeight - 30 - ((targetW - minW) / (maxW - minW)) * (svgHeight - 50);

  return (
    <div className="space-y-6 pb-24 max-w-2xl mx-auto px-1">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <TrendingUp className="text-blue-400" size={26} /> Progress Analytics & Charts
          </h1>
          <p className="page-subtitle">
            Interactive weight progress trends, active minute bar graphs & body stats.
          </p>
        </div>
        <Link
          to="/"
          className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white"
        >
          <ArrowLeft size={18} />
        </Link>
      </div>

      {/* Weight Progress & Goal Summary Card */}
      <div className="card-gradient-blue p-6 rounded-3xl glow-blue space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-white font-bold text-base">
            <Scale size={20} className="text-blue-400" /> Weight Progress & Target Goal
          </div>
          <span className="badge text-[10px] text-blue-400 border-blue-500/30 bg-blue-500/10 font-bold">
            {dailyLog?.bmi_category || "Normal Weight"}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="bg-zinc-950/80 p-4 rounded-2xl border border-zinc-800">
            <div className="text-xs text-zinc-400 font-medium">Current Weight</div>
            <div className="text-2xl font-black text-white mt-1">{currentW} <span className="text-xs text-zinc-500 font-normal">kg</span></div>
          </div>

          <div className="bg-zinc-950/80 p-4 rounded-2xl border border-blue-500/40">
            <div className="text-xs text-blue-400 font-medium">Target Weight</div>
            <div className="text-2xl font-black text-blue-400 mt-1">{targetW} <span className="text-xs text-zinc-500 font-normal">kg</span></div>
          </div>

          <div className="bg-zinc-950/80 p-4 rounded-2xl border border-zinc-800">
            <div className="text-xs text-zinc-400 font-medium">Remaining</div>
            <div className="text-2xl font-black text-amber-400 mt-1">{Math.abs(diff)} <span className="text-xs text-zinc-500 font-normal">kg</span></div>
            <div className="text-[10px] text-zinc-500 mt-0.5">{diff > 0 ? "To Lose" : "To Gain"}</div>
          </div>
        </div>

        {/* Visual Progress Bar */}
        <div className="space-y-1.5 pt-1">
          <div className="flex justify-between text-xs text-zinc-400 font-medium">
            <span>Goal Gap</span>
            <span className="text-blue-400 font-bold">{diff === 0 ? "Goal Reached!" : `${Math.abs(diff)} kg remaining`}</span>
          </div>
          <div className="w-full bg-zinc-950 h-3.5 rounded-full overflow-hidden border border-blue-500/30">
            <div
              className="bg-gradient-to-r from-blue-600 to-cyan-400 h-full transition-all duration-500 rounded-full"
              style={{ width: `${Math.max(10, Math.min(100, 100 - (Math.abs(diff) / currentW) * 100))}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Interactive Weight Trend Area Line Chart */}
      <div className="surface p-6 border border-zinc-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <TrendingUp size={18} className="text-blue-400" /> Weight Progress Area Chart
          </h3>
          <span className="text-xs text-blue-400 font-semibold bg-blue-500/10 border border-blue-500/20 px-2.5 py-1 rounded-full">
            7-Day Trend
          </span>
        </div>

        {/* SVG Chart Container */}
        <div className="relative bg-zinc-950 p-4 rounded-2xl border border-zinc-800 overflow-hidden">
          {hoveredPoint && (
            <div
              className="absolute bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded shadow-lg pointer-events-none transition-all z-20"
              style={{ left: `${(hoveredPoint.x / svgWidth) * 100}%`, top: "10px" }}
            >
              {hoveredPoint.date}: {hoveredPoint.weight} kg
            </div>
          )}

          <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-44 overflow-visible">
            <defs>
              <linearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Target Weight Dashed Baseline */}
            <line
              x1="20"
              y1={targetY}
              x2={svgWidth - 20}
              y2={targetY}
              stroke="#10b981"
              strokeDasharray="4 4"
              strokeWidth="1.5"
            />
            <text x={svgWidth - 65} y={targetY - 5} fill="#10b981" fontSize="10" fontWeight="bold">
              Goal {targetW}kg
            </text>

            {/* Area Fill Under Curve */}
            <path d={areaD} fill="url(#weightGradient)" />

            {/* Line Curve */}
            <path d={pathD} fill="none" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round" />

            {/* Interactive Data Points */}
            {points.map((pt, idx) => (
              <g key={idx} className="cursor-pointer" onMouseEnter={() => setHoveredPoint(pt)} onMouseLeave={() => setHoveredPoint(null)}>
                <circle cx={pt.x} cy={pt.y} r="5" fill="#09090b" stroke="#3b82f6" strokeWidth="3" className="hover:r-7 transition-all" />
                <text x={pt.x} y={svgHeight - 5} fill="#71717a" fontSize="10" textAnchor="middle">
                  {pt.date.split(" ")[1]}
                </text>
              </g>
            ))}
          </svg>
        </div>
      </div>

      {/* 7-Day Active Minutes Bar Chart */}
      <div className="surface p-6 border border-zinc-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <BarChart2 size={18} className="text-emerald-400" /> Weekly Active Minutes Graph
          </h3>
          <span className="text-xs text-emerald-400 font-semibold bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
            Target 30m / day
          </span>
        </div>

        <div className="bg-zinc-950 p-5 rounded-2xl border border-zinc-800 space-y-3">
          <div className="grid grid-cols-7 gap-2 items-end h-36 pt-4 border-b border-zinc-800">
            {weeklyActivityData.map((d, i) => {
              const heightPct = Math.min(100, Math.round((d.minutes / 50) * 100));
              return (
                <div key={i} className="flex flex-col items-center gap-1.5 h-full justify-end group">
                  <span className="text-[10px] text-emerald-400 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                    {d.minutes}m
                  </span>
                  <div className="w-full bg-zinc-900 rounded-t-xl overflow-hidden h-full flex items-end">
                    <div
                      className="w-full bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t-xl transition-all duration-500 group-hover:from-emerald-500 group-hover:to-emerald-300"
                      style={{ height: `${heightPct}%` }}
                    ></div>
                  </div>
                  <span className="text-[11px] text-zinc-400 font-semibold">{d.day}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 7-Day Calorie Expenditure Bar Chart */}
      <div className="surface p-6 border border-zinc-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Zap size={18} className="text-amber-400" /> Daily Calorie Expenditure (kcal)
          </h3>
          <span className="text-xs text-amber-400 font-semibold bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full">
            Burn Trends
          </span>
        </div>

        <div className="bg-zinc-950 p-5 rounded-2xl border border-zinc-800 space-y-3">
          <div className="grid grid-cols-7 gap-2 items-end h-36 pt-4 border-b border-zinc-800">
            {weeklyActivityData.map((d, i) => {
              const heightPct = Math.min(100, Math.round((d.cals / 450) * 100));
              return (
                <div key={i} className="flex flex-col items-center gap-1.5 h-full justify-end group">
                  <span className="text-[10px] text-amber-400 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                    {d.cals}k
                  </span>
                  <div className="w-full bg-zinc-900 rounded-t-xl overflow-hidden h-full flex items-end">
                    <div
                      className="w-full bg-gradient-to-t from-amber-600 to-amber-400 rounded-t-xl transition-all duration-500 group-hover:from-amber-500 group-hover:to-amber-300"
                      style={{ height: `${heightPct}%` }}
                    ></div>
                  </div>
                  <span className="text-[11px] text-zinc-400 font-semibold">{d.day}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Body Measurements Log Card */}
      <div className="surface p-6 border border-zinc-800 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Activity size={18} className="text-emerald-400" /> Body Circumference Measurements
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800/80 text-center">
            <div className="text-xs text-zinc-500">Waist</div>
            <div className="text-xl font-extrabold text-white mt-1">
              {dailyLog?.waist_cm || "--"} <span className="text-xs text-zinc-500 font-normal">cm</span>
            </div>
          </div>

          <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800/80 text-center">
            <div className="text-xs text-zinc-500">Chest</div>
            <div className="text-xl font-extrabold text-white mt-1">
              {dailyLog?.chest_cm || "--"} <span className="text-xs text-zinc-500 font-normal">cm</span>
            </div>
          </div>

          <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800/80 text-center">
            <div className="text-xs text-zinc-500">Biceps</div>
            <div className="text-xl font-extrabold text-white mt-1">
              {dailyLog?.bicep_cm || "--"} <span className="text-xs text-zinc-500 font-normal">cm</span>
            </div>
          </div>

          <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800/80 text-center">
            <div className="text-xs text-zinc-500">Thighs</div>
            <div className="text-xl font-extrabold text-white mt-1">
              {dailyLog?.thigh_cm || "--"} <span className="text-xs text-zinc-500 font-normal">cm</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
