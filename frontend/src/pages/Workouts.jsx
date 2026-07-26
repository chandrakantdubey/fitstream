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
  Search,
  Check,
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
  const { exercises, selected, clear, load: loadExercises } = useExerciseStore();
  const [expanded, setExpanded] = useState(null);
  const [showBuilder, setShowBuilder] = useState(false);
  const [exerciseQuery, setExerciseQuery] = useState("");
  const [saving, setSaving] = useState(false);
  const nav = useNavigate();

  useEffect(() => {
    load();
    loadExercises();
  }, []);

  useEffect(() => {
    if (selected) {
      addExercise(selected);
      setShowBuilder(true);
      clear();
    }
  }, [selected]);

  const selectedIds = new Set(current.exercises.map((e) => e.id));
  const exerciseMatches = exercises
    .filter((ex) => {
      if (selectedIds.has(ex.id)) return false;
      const q = exerciseQuery.trim().toLowerCase();
      if (!q) return true;
      return [ex.name, ex.target, ex.category, ex.equipment]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(q));
    })
    .slice(0, 8);

  const handleSave = async () => {
    setSaving(true);
    const saved = await save();
    setSaving(false);
    if (saved) {
      setShowBuilder(false);
      setExerciseQuery("");
    }
  };

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
          aria-label="Create workout"
        >
          <Plus size={18} />
        </button>
      </div>

      {showBuilder && (
        <div className="surface p-4 space-y-5 animate-slide-up">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-white">Create Workout</h2>
              <p className="text-xs text-zinc-500">
                {current.exercises.length} exercises selected
              </p>
            </div>
            <button
              onClick={() => setShowBuilder(false)}
              className="btn-ghost px-3 py-2 text-xs"
            >
              Done
            </button>
          </div>

          <section className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-zinc-400">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-600 text-[11px] text-white">
                1
              </span>
              Name
            </div>
            <input
              type="text"
              placeholder="Workout name"
              value={current.name}
              onChange={(e) => setName(e.target.value)}
              className="input-modern w-full text-sm"
            />
          </section>

          <section className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-zinc-400">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-600 text-[11px] text-white">
                2
              </span>
              Add Exercises
            </div>
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
              />
              <input
                type="text"
                placeholder="Search exercises, muscle, or equipment"
                value={exerciseQuery}
                onChange={(e) => setExerciseQuery(e.target.value)}
                className="input-modern w-full pl-10 text-sm"
              />
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {exerciseMatches.map((ex) => (
                <button
                  key={ex.id}
                  onClick={() => addExercise(ex)}
                  className="bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700/40 rounded-xl p-3 text-left transition-colors"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-zinc-200 truncate">
                      {ex.name}
                    </p>
                    <Plus size={14} className="text-brand-400 shrink-0" />
                  </div>
                  <p className="text-[11px] text-zinc-500 capitalize truncate mt-1">
                    {ex.target} • {ex.equipment}
                  </p>
                </button>
              ))}
            </div>
            {!exerciseMatches.length && (
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 px-4 py-5 text-center">
                <Dumbbell size={22} className="mx-auto mb-2 text-zinc-600" />
                <p className="text-sm text-zinc-500">No matching exercises</p>
              </div>
            )}
          </section>

          <section className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-zinc-400">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-600 text-[11px] text-white">
                3
              </span>
              Review Plan
            </div>

            {current.exercises.length === 0 ? (
              <div className="rounded-xl border border-dashed border-zinc-700 bg-zinc-900/50 px-4 py-6 text-center">
                <Dumbbell size={26} className="mx-auto mb-2 text-zinc-600" />
                <p className="text-sm text-zinc-500">No exercises selected</p>
              </div>
            ) : (
              <div className="space-y-2">
                {current.exercises.map((ex, i) => (
                  <div
                    key={ex.id}
                    className="bg-zinc-800/60 rounded-xl p-3 border border-zinc-700/30"
                  >
                    <div className="flex items-center gap-3">
                      <GripVertical size={14} className="text-zinc-600 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{ex.name}</p>
                        <p className="text-[11px] text-zinc-500 capitalize">
                          {i + 1}. {ex.target}
                        </p>
                      </div>
                      <button
                        onClick={() => removeExercise(ex.id)}
                        className="p-2 text-red-400 hover:bg-red-900/20 rounded-lg transition-colors"
                        aria-label={`Remove ${ex.name}`}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <div className="mt-3 grid grid-cols-3 gap-2">
                      <label className="bg-zinc-900 rounded-lg px-2 py-1.5">
                        <span className="block text-[10px] text-zinc-500">
                          Sets
                        </span>
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
                          className="w-full bg-transparent text-sm font-semibold outline-none"
                        />
                      </label>
                      <label className="bg-zinc-900 rounded-lg px-2 py-1.5">
                        <span className="block text-[10px] text-zinc-500">
                          Reps
                        </span>
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
                          className="w-full bg-transparent text-sm font-semibold outline-none"
                        />
                      </label>
                      <label className="bg-zinc-900 rounded-lg px-2 py-1.5">
                        <span className="block text-[10px] text-zinc-500">
                          Rest
                        </span>
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
                          className="w-full bg-transparent text-sm font-semibold outline-none"
                        />
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              onClick={handleSave}
              disabled={saving || !current.name.trim() || !current.exercises.length}
              className="btn-brand flex-1 flex items-center justify-center gap-2 disabled:opacity-50 disabled:active:scale-100"
            >
              <Check size={16} />
              {saving ? "Saving..." : "Save Workout"}
            </button>
            {(current.name || current.exercises.length > 0) && (
              <button onClick={clearCurrent} className="btn-ghost">
                Clear
              </button>
            )}
          </div>
        </div>
      )}

      {!showBuilder && workouts.length === 0 && (
        <button
          onClick={() => setShowBuilder(true)}
          className="w-full rounded-2xl border border-dashed border-zinc-700 bg-zinc-900/40 p-8 text-center hover:border-brand-700/70 hover:bg-zinc-900/70 transition-colors"
        >
          <Dumbbell size={28} className="mx-auto mb-3 text-zinc-600" />
          <p className="font-semibold text-zinc-300">Create your first workout</p>
          <p className="mt-1 text-sm text-zinc-500">
            Pick exercises and set targets in one place.
          </p>
        </button>
      )}

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
