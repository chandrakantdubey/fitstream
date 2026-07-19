import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useWorkoutStore } from "../stores/workoutStore";
import { useExerciseStore } from "../stores/exerciseStore";
import {
  Dumbbell,
  Play,
  Trash2,
  Plus,
  ChevronDown,
  ChevronUp,
  GripVertical,
} from "lucide-react";

export default function Workouts() {
  const {
    workouts,
    current,
    load,
    addExercise,
    removeExercise,
    updateParam,
    setName,
    save,
    deleteById,
    clearCurrent,
  } = useWorkoutStore();
  const { selected, clear } = useExerciseStore();
  const [expanded, setExpanded] = useState(null);
  const [showBuilder, setShowBuilder] = useState(false);
  const nav = useNavigate();

  useEffect(() => {
    load();
  }, []);
  useEffect(() => {
    if (selected) {
      addExercise(selected);
      clear();
    }
  }, [selected]);

  return (
    <div className="space-y-5 pb-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Workouts</h1>
          <p className="page-subtitle">{workouts.length} saved routines</p>
        </div>
        <button
          onClick={() => setShowBuilder(!showBuilder)}
          className="btn-brand p-2.5"
        >
          <Plus size={18} />
        </button>
      </div>

      {/* Builder */}
      {showBuilder && (
        <div className="surface p-4 space-y-4 animate-slide-up">
          <input
            type="text"
            placeholder="Workout name..."
            value={current.name}
            onChange={(e) => setName(e.target.value)}
            className="input-modern w-full text-sm"
          />

          {current.exercises.length === 0 && (
            <div className="text-center py-6 text-zinc-500">
              <Dumbbell size={28} className="mx-auto mb-2 opacity-40" />
              <p className="text-sm">
                Go to Library and tap + to add exercises
              </p>
            </div>
          )}

          <div className="space-y-2">
            {current.exercises.map((ex, i) => (
              <div
                key={ex.id}
                className="bg-zinc-800/60 rounded-xl p-3 flex items-center gap-3 border border-zinc-700/30"
              >
                <GripVertical size={14} className="text-zinc-600 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{ex.name}</p>
                  <p className="text-[11px] text-zinc-500 capitalize">
                    {ex.target}
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="flex items-center gap-1 bg-zinc-900 rounded-lg px-2 py-1">
                    <input
                      type="number"
                      value={ex.target_sets}
                      min="1"
                      max="10"
                      onChange={(e) =>
                        updateParam(
                          ex.id,
                          "target_sets",
                          parseInt(e.target.value) || 1,
                        )
                      }
                      className="w-8 bg-transparent text-center text-sm font-semibold outline-none"
                    />
                    <span className="text-[10px] text-zinc-500">sets</span>
                  </div>
                  <div className="flex items-center gap-1 bg-zinc-900 rounded-lg px-2 py-1">
                    <input
                      type="number"
                      value={ex.target_reps}
                      min="1"
                      max="100"
                      onChange={(e) =>
                        updateParam(
                          ex.id,
                          "target_reps",
                          parseInt(e.target.value) || 1,
                        )
                      }
                      className="w-8 bg-transparent text-center text-sm font-semibold outline-none"
                    />
                    <span className="text-[10px] text-zinc-500">reps</span>
                  </div>
                  <div className="flex items-center gap-1 bg-zinc-900 rounded-lg px-2 py-1">
                    <input
                      type="number"
                      value={ex.rest_seconds}
                      min="0"
                      max="600"
                      step="15"
                      onChange={(e) =>
                        updateParam(
                          ex.id,
                          "rest_seconds",
                          parseInt(e.target.value) || 0,
                        )
                      }
                      className="w-10 bg-transparent text-center text-sm font-semibold outline-none"
                    />
                    <span className="text-[10px] text-zinc-500">s rest</span>
                  </div>
                  <button
                    onClick={() => removeExercise(ex.id)}
                    className="p-1.5 text-red-400 hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {current.exercises.length > 0 && (
            <div className="flex gap-2">
              <button
                onClick={save}
                disabled={!current.name}
                className="btn-brand flex-1"
              >
                Save Workout
              </button>
              <button onClick={clearCurrent} className="btn-ghost">
                Clear
              </button>
            </div>
          )}
        </div>
      )}

      {/* Saved Workouts */}
      <div className="space-y-3">
        {workouts.map((w) => (
          <div key={w.id} className="surface surface-hover">
            <div
              className="p-4 flex items-center justify-between cursor-pointer"
              onClick={() => setExpanded(expanded === w.id ? null : w.id)}
            >
              <div>
                <h3 className="font-semibold text-zinc-200">{w.name}</h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  {w.exercises?.length || 0} exercises • {w.session_count || 0}{" "}
                  sessions
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    nav(`/play/${w.id}`);
                  }}
                  className="p-2 bg-brand-600 hover:bg-brand-500 rounded-xl text-white transition-colors"
                >
                  <Play size={14} fill="white" />
                </button>
                {expanded === w.id ? (
                  <ChevronUp size={16} className="text-zinc-500" />
                ) : (
                  <ChevronDown size={16} className="text-zinc-500" />
                )}
              </div>
            </div>
            {expanded === w.id && (
              <div className="px-4 pb-4 space-y-2 border-t border-zinc-800/60 pt-3">
                {w.exercises?.map((we, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-zinc-300">
                      {we.exercise?.name || we.name}
                    </span>
                    <span className="text-zinc-500 text-xs">
                      {we.target_sets}x{we.target_reps}
                    </span>
                  </div>
                ))}
                <button
                  onClick={() => deleteById(w.id)}
                  className="btn-danger w-full mt-2 text-xs py-2"
                >
                  <Trash2 size={12} className="inline mr-1" /> Delete Workout
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
