import { Dumbbell, Plus, ChevronRight, Check } from "lucide-react";
import { useExerciseStore } from "../stores/exerciseStore";
import { useWorkoutStore } from "../stores/workoutStore";

export default function ExerciseCard({ exercise, compact }) {
  const { select } = useExerciseStore();
  const { addExercise, current } = useWorkoutStore();
  const added = current.exercises.find((e) => e.id === exercise.id);

  return (
    <div
      className={`surface surface-hover flex items-center gap-3 cursor-pointer group ${compact ? "p-3" : "p-4"}`}
      onClick={() => select(exercise)}
    >
      <div className="w-14 h-14 bg-zinc-800 rounded-xl flex items-center justify-center shrink-0 overflow-hidden border border-zinc-700/40">
        {exercise.media_id ? (
          <img
            src={`https://static.exercisedb.dev/media/${exercise.media_id}.gif`}
            alt={exercise.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            loading="lazy"
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
        ) : (
          <Dumbbell size={20} className="text-zinc-600" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-sm text-zinc-200 truncate group-hover:text-white transition-colors">
          {exercise.name}
        </h3>
        <div className="flex flex-wrap gap-1.5 mt-1.5">
          <span className="badge capitalize">{exercise.category}</span>
          <span className="badge capitalize">{exercise.equipment}</span>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (!added) addExercise(exercise);
          }}
          className={`p-2 rounded-xl transition-all ${added ? "bg-brand-600/20 text-brand-400" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white"}`}
        >
          {added ? <Check size={14} /> : <Plus size={14} />}
        </button>
        <ChevronRight
          size={16}
          className="text-zinc-600 group-hover:text-zinc-400 transition-colors"
        />
      </div>
    </div>
  );
}
