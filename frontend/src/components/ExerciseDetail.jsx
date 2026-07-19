import { useExerciseStore } from "../stores/exerciseStore";
import { useWorkoutStore } from "../stores/workoutStore";
import { X, Plus, Target, Layers, Clock } from "lucide-react";

export default function ExerciseDetail() {
  const { selected, clear } = useExerciseStore();
  const { addExercise, current } = useWorkoutStore();
  if (!selected) return null;
  const added = current.exercises.find((e) => e.id === selected.id);

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in"
      onClick={clear}
    >
      <div
        className="bg-zinc-900 rounded-t-3xl sm:rounded-3xl w-full max-w-lg max-h-[92vh] overflow-y-auto border border-zinc-800"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-zinc-900/95 backdrop-blur-sm p-5 border-b border-zinc-800 flex items-center justify-between z-10">
          <h2 className="text-lg font-bold pr-4 truncate">{selected.name}</h2>
          <button
            onClick={clear}
            className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-xl transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {selected.media_id && (
            <div className="w-full aspect-video bg-zinc-950 rounded-2xl overflow-hidden border border-zinc-800">
              <img
                src={`https://static.exercisedb.dev/media/${selected.media_id}.gif`}
                alt={selected.name}
                className="w-full h-full object-contain"
              />
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <span className="badge bg-brand-900/40 text-brand-300 border-brand-800/40 capitalize">
              {selected.category}
            </span>
            <span className="badge bg-purple-900/40 text-purple-300 border-purple-800/40 capitalize">
              {selected.equipment}
            </span>
            <span className="badge bg-amber-900/40 text-amber-300 border-amber-800/40">
              {selected.target}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="surface p-3 flex items-center gap-3">
              <Target size={18} className="text-brand-400" />
              <div>
                <p className="text-xs text-zinc-500">Target</p>
                <p className="text-sm font-medium capitalize">
                  {selected.target}
                </p>
              </div>
            </div>
            {selected.secondary_muscles?.length > 0 && (
              <div className="surface p-3 flex items-center gap-3">
                <Layers size={18} className="text-purple-400" />
                <div>
                  <p className="text-xs text-zinc-500">Secondary</p>
                  <p className="text-sm font-medium capitalize truncate">
                    {selected.secondary_muscles.join(", ")}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div>
            <h3 className="font-semibold text-zinc-300 mb-3 flex items-center gap-2">
              <Clock size={16} className="text-brand-400" /> Instructions
            </h3>
            <p className="text-sm text-zinc-400 leading-relaxed whitespace-pre-line">
              {selected.instructions}
            </p>
          </div>

          <button
            onClick={() => {
              if (!added) addExercise(selected);
            }}
            disabled={added}
            className={`w-full py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${
              added
                ? "bg-brand-900/30 text-brand-400 cursor-default"
                : "btn-brand"
            }`}
          >
            <Plus size={18} /> {added ? "Added to Workout" : "Add to Workout"}
          </button>
        </div>
      </div>
    </div>
  );
}
