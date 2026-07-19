import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useExerciseStore } from "../stores/exerciseStore";
import { useWorkoutStore } from "../stores/workoutStore";
import { fetchStats } from "../utils/api";
import ExerciseCard from "../components/ExerciseCard";
import {
  Flame,
  Dumbbell,
  TrendingUp,
  Calendar,
  Clock,
  Zap,
  ArrowRight,
} from "lucide-react";

export default function Home() {
  const { exercises, filtered, load } = useExerciseStore();
  const { workouts, load: loadWorkouts } = useWorkoutStore();
  const [stats, setStats] = useState(null);
  const nav = useNavigate();

  useEffect(() => {
    load();
    loadWorkouts();
    fetchStats().then(setStats);
  }, []);

  const recent = filtered.slice(0, 4);
  const bodyweight = exercises.filter(
    (e) => e.equipment === "body weight",
  ).length;
  const cats = new Set(exercises.map((e) => e.category)).size;
  const lastWorkout = workouts[0];

  return (
    <div className="space-y-6 pb-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">FitStream</h1>
          <p className="page-subtitle">
            {exercises.length.toLocaleString()} exercises • {workouts.length}{" "}
            workouts
          </p>
        </div>
        <div className="w-10 h-10 bg-gradient-to-br from-brand-500 to-brand-700 rounded-xl flex items-center justify-center shadow-lg shadow-brand-900/30">
          <Dumbbell size={20} className="text-white" />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="stat-card">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-brand-900/40 rounded-lg">
              <Zap size={14} className="text-brand-400" />
            </div>
            <span className="text-xs text-zinc-500 font-medium">Sessions</span>
          </div>
          <p className="text-2xl font-bold text-white">
            {stats?.completed_sessions || 0}
          </p>
          <p className="text-[11px] text-zinc-500 mt-1">completed</p>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-purple-900/40 rounded-lg">
              <TrendingUp size={14} className="text-purple-400" />
            </div>
            <span className="text-xs text-zinc-500 font-medium">Volume</span>
          </div>
          <p className="text-2xl font-bold text-white">
            {(stats?.total_volume || 0).toLocaleString()}
          </p>
          <p className="text-[11px] text-zinc-500 mt-1">kg total</p>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-amber-900/40 rounded-lg">
              <Flame size={14} className="text-amber-400" />
            </div>
            <span className="text-xs text-zinc-500 font-medium">
              Bodyweight
            </span>
          </div>
          <p className="text-2xl font-bold text-white">{bodyweight}</p>
          <p className="text-[11px] text-zinc-500 mt-1">exercises</p>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-blue-900/40 rounded-lg">
              <Calendar size={14} className="text-blue-400" />
            </div>
            <span className="text-xs text-zinc-500 font-medium">
              Categories
            </span>
          </div>
          <p className="text-2xl font-bold text-white">{cats}</p>
          <p className="text-[11px] text-zinc-500 mt-1">muscle groups</p>
        </div>
      </div>

      {/* Last Workout */}
      {lastWorkout && (
        <div
          className="surface p-4 surface-hover cursor-pointer"
          onClick={() => nav("/workouts")}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-brand-900/30 rounded-xl flex items-center justify-center">
                <Clock size={18} className="text-brand-400" />
              </div>
              <div>
                <p className="text-sm font-semibold">{lastWorkout.name}</p>
                <p className="text-xs text-zinc-500">
                  {lastWorkout.exercises?.length || 0} exercises • Last workout
                </p>
              </div>
            </div>
            <ArrowRight size={16} className="text-zinc-600" />
          </div>
        </div>
      )}

      {/* Quick Picks */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-zinc-200">Quick Picks</h2>
          <button
            onClick={() => nav("/library")}
            className="text-xs text-brand-400 hover:text-brand-300 font-medium"
          >
            View all
          </button>
        </div>
        <div className="space-y-2">
          {recent.map((ex) => (
            <ExerciseCard key={ex.id} exercise={ex} compact />
          ))}
        </div>
      </div>
    </div>
  );
}
