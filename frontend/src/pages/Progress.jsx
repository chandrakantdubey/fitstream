import { useEffect, useState } from "react";
import { fetchStats, fetchHistory } from "../utils/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { TrendingUp, Calendar, Clock, Dumbbell, Award } from "lucide-react";

export default function Progress() {
  const [stats, setStats] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    fetchStats().then(setStats);
    fetchHistory(30).then(setHistory);
  }, []);

  const weeklyData = stats?.weekly_activity
    ? Object.entries(stats.weekly_activity).map(([date, count]) => ({
        date: new Date(date).toLocaleDateString("en", { weekday: "short" }),
        count,
      }))
    : [];

  return (
    <div className="space-y-6 pb-4 animate-fade-in">
      <div>
        <h1 className="page-title">Progress</h1>
        <p className="page-subtitle">Your fitness journey over time</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="stat-card">
          <Dumbbell size={18} className="text-brand-400 mb-2" />
          <p className="text-2xl font-bold">{stats?.total_sets || 0}</p>
          <p className="text-xs text-zinc-500">Total Sets</p>
        </div>
        <div className="stat-card">
          <Award size={18} className="text-amber-400 mb-2" />
          <p className="text-2xl font-bold">{stats?.completed_sessions || 0}</p>
          <p className="text-xs text-zinc-500">Workouts Done</p>
        </div>
        <div className="stat-card">
          <TrendingUp size={18} className="text-purple-400 mb-2" />
          <p className="text-2xl font-bold">
            {(stats?.total_volume || 0).toLocaleString()}
          </p>
          <p className="text-xs text-zinc-500">kg Volume</p>
        </div>
        <div className="stat-card">
          <Clock size={18} className="text-blue-400 mb-2" />
          <p className="text-2xl font-bold">{history.length}</p>
          <p className="text-xs text-zinc-500">This Month</p>
        </div>
      </div>

      {/* Chart */}
      {weeklyData.length > 0 && (
        <div className="surface p-4">
          <h3 className="text-sm font-semibold text-zinc-300 mb-4">
            Weekly Activity
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weeklyData}>
              <XAxis
                dataKey="date"
                tick={{ fill: "#71717a", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "#71717a", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#18181b",
                  border: "1px solid #27272a",
                  borderRadius: "12px",
                  color: "#fff",
                }}
                cursor={{ fill: "rgba(255,255,255,0.03)" }}
              />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {weeklyData.map((_, i) => (
                  <Cell
                    key={i}
                    fill={i === weeklyData.length - 1 ? "#10b981" : "#3f3f46"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* History */}
      <div>
        <h3 className="text-sm font-semibold text-zinc-300 mb-3 flex items-center gap-2">
          <Calendar size={14} className="text-brand-400" /> Recent Sessions
        </h3>
        <div className="space-y-2">
          {history.map((h) => (
            <div
              key={h.id}
              className="surface p-3 flex items-center justify-between"
            >
              <div>
                <p className="text-sm font-medium text-zinc-200">
                  {h.workout_name}
                </p>
                <p className="text-xs text-zinc-500">
                  {new Date(h.started_at).toLocaleDateString()} • {h.sets_count}{" "}
                  sets
                </p>
              </div>
              {h.duration_seconds > 0 && (
                <span className="text-xs text-zinc-500 bg-zinc-800 px-2 py-1 rounded-lg">
                  {Math.floor(h.duration_seconds / 60)}m
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
