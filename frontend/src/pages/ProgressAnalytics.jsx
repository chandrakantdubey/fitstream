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
  PieChart,
  AlertCircle,
  Plus,
  Play
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export default function ProgressAnalytics() {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [streakData, setStreakData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hoveredPoint, setHoveredPoint] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [anRes, streakRes] = await Promise.all([
          fetch(`${API_BASE}/daily/analytics-history?user_id=1`),
          fetch(`${API_BASE}/daily/streak?user_id=1`)
        ]);
        const aData = await anRes.json();
        const sData = await streakRes.json();
        setAnalyticsData(aData);
        setStreakData(sData);
      } catch (err) {
        console.error("Error loading analytics data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const dailyLog = analyticsData?.current_metrics;
  const currentW = dailyLog?.weight_kg;
  const targetW = dailyLog?.target_weight_kg;
  const diff = currentW && targetW ? parseFloat((currentW - targetW).toFixed(1)) : null;

  // Real Database Weight History
  const weightHistory = analyticsData?.weight_history || [];
  const hasWeightData = analyticsData?.has_weight_data && weightHistory.length > 1;

  // Real Database Weekly Activity
  const weeklyActivityData = analyticsData?.weekly_activity || [];
  const hasActivityData = analyticsData?.has_activity_data;

  // SVG Chart Dimensions
  const svgWidth = 500;
  const svgHeight = 160;

  let points = [];
  let pathD = "";
  let areaD = "";
  let targetY = 80;

  if (hasWeightData) {
    const weights = weightHistory.map(w => w.weight_kg);
    const minW = Math.min(...weights, targetW || 60) - 2;
    const maxW = Math.max(...weights, targetW || 80) + 2;

    points = weightHistory.map((d, index) => {
      const x = (index / (weightHistory.length - 1)) * (svgWidth - 40) + 20;
      const y = svgHeight - 30 - ((d.weight_kg - minW) / (maxW - minW)) * (svgHeight - 50);
      return { x, y, ...d };
    });

    pathD = points.reduce((acc, point, i) => {
      return i === 0 ? `M ${point.x} ${point.y}` : `${acc} L ${point.x} ${point.y}`;
    }, "");

    areaD = `${pathD} L ${points[points.length - 1].x} ${svgHeight - 20} L ${points[0].x} ${svgHeight - 20} Z`;
    if (targetW) {
      targetY = svgHeight - 30 - ((targetW - minW) / (maxW - minW)) * (svgHeight - 50);
    }
  }

  return (
    <div className="space-y-6 pb-24 max-w-2xl mx-auto px-1">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <TrendingUp className="text-blue-400" size={26} /> Progress Analytics & Charts
          </h1>
          <p className="page-subtitle">
            Database-driven weight progress trends, active minute bar graphs & body stats.
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
            {dailyLog?.bmi_category || "Not Logged"}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="bg-zinc-950/80 p-4 rounded-2xl border border-zinc-800">
            <div className="text-xs text-zinc-400 font-medium">Current Weight</div>
            <div className="text-2xl font-black text-white mt-1">
              {currentW ? currentW : "--"} <span className="text-xs text-zinc-500 font-normal">kg</span>
            </div>
          </div>

          <div className="bg-zinc-950/80 p-4 rounded-2xl border border-blue-500/40">
            <div className="text-xs text-blue-400 font-medium">Target Weight</div>
            <div className="text-2xl font-black text-blue-400 mt-1">
              {targetW ? targetW : "--"} <span className="text-xs text-zinc-500 font-normal">kg</span>
            </div>
          </div>

          <div className="bg-zinc-950/80 p-4 rounded-2xl border border-zinc-800">
            <div className="text-xs text-zinc-400 font-medium">Remaining</div>
            <div className="text-2xl font-black text-amber-400 mt-1">
              {diff !== null ? Math.abs(diff) : "--"} <span className="text-xs text-zinc-500 font-normal">kg</span>
            </div>
            <div className="text-[10px] text-zinc-500 mt-0.5">{diff !== null && diff > 0 ? "To Lose" : "To Gain"}</div>
          </div>
        </div>

        {/* Visual Progress Bar */}
        {currentW && targetW ? (
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
        ) : (
          <div className="pt-2 text-center text-xs text-zinc-400">
            Log your current and target weight in profile to calculate goal gap.
          </div>
        )}
      </div>

      {/* Real Weight Progress Area Line Chart */}
      <div className="surface p-6 border border-zinc-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <TrendingUp size={18} className="text-blue-400" /> Weight Progress Area Chart
          </h3>
          <span className="text-xs text-blue-400 font-semibold bg-blue-500/10 border border-blue-500/20 px-2.5 py-1 rounded-full">
            Real Database History
          </span>
        </div>

        {hasWeightData ? (
          <div className="relative bg-zinc-950 p-4 rounded-2xl border border-zinc-800 overflow-hidden">
            {hoveredPoint && (
              <div
                className="absolute bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded shadow-lg pointer-events-none transition-all z-20"
                style={{ left: `${(hoveredPoint.x / svgWidth) * 100}%`, top: "10px" }}
              >
                {hoveredPoint.date}: {hoveredPoint.weight_kg} kg
              </div>
            )}

            <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-44 overflow-visible">
              <defs>
                <linearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {targetW && (
                <>
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
                </>
              )}

              <path d={areaD} fill="url(#weightGradient)" />
              <path d={pathD} fill="none" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round" />

              {points.map((pt, idx) => (
                <g key={idx} className="cursor-pointer" onMouseEnter={() => setHoveredPoint(pt)} onMouseLeave={() => setHoveredPoint(null)}>
                  <circle cx={pt.x} cy={pt.y} r="5" fill="#09090b" stroke="#3b82f6" strokeWidth="3" className="hover:r-7 transition-all" />
                  <text x={pt.x} y={svgHeight - 5} fill="#71717a" fontSize="10" textAnchor="middle">
                    {pt.date}
                  </text>
                </g>
              ))}
            </svg>
          </div>
        ) : (
          <div className="bg-zinc-950 p-8 rounded-2xl border border-zinc-800 text-center space-y-3">
            <AlertCircle size={32} className="text-zinc-500 mx-auto" />
            <h4 className="text-sm font-bold text-white">No Weight Log History Yet</h4>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto">
              As you log your weight in Physical Profile or Daily Metrics over time, your real progress trend line will plot here automatically.
            </p>
            <Link to="/" className="btn-ghost inline-flex items-center gap-1.5 px-4 py-2 text-xs text-emerald-400 border-emerald-500/30">
              <Plus size={14} /> Update Weight Entry
            </Link>
          </div>
        )}
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

        {hasActivityData ? (
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
        ) : (
          <div className="bg-zinc-950 p-8 rounded-2xl border border-zinc-800 text-center space-y-3">
            <Clock size={32} className="text-zinc-500 mx-auto" />
            <h4 className="text-sm font-bold text-white">No Workout Activity Logged This Week</h4>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto">
              Complete a workout session or 30-day challenge day to log active minutes and calorie expenditure.
            </p>
            <Link to="/workouts" className="btn-brand inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold">
              <Play size={14} className="fill-current" /> Start a Routine
            </Link>
          </div>
        )}
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
              {dailyLog?.waist_cm ? dailyLog.waist_cm : "--"} <span className="text-xs text-zinc-500 font-normal">cm</span>
            </div>
          </div>

          <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800/80 text-center">
            <div className="text-xs text-zinc-500">Chest</div>
            <div className="text-xl font-extrabold text-white mt-1">
              {dailyLog?.chest_cm ? dailyLog.chest_cm : "--"} <span className="text-xs text-zinc-500 font-normal">cm</span>
            </div>
          </div>

          <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800/80 text-center">
            <div className="text-xs text-zinc-500">Biceps</div>
            <div className="text-xl font-extrabold text-white mt-1">
              {dailyLog?.bicep_cm ? dailyLog.bicep_cm : "--"} <span className="text-xs text-zinc-500 font-normal">cm</span>
            </div>
          </div>

          <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800/80 text-center">
            <div className="text-xs text-zinc-500">Thighs</div>
            <div className="text-xl font-extrabold text-white mt-1">
              {dailyLog?.thigh_cm ? dailyLog.thigh_cm : "--"} <span className="text-xs text-zinc-500 font-normal">cm</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
