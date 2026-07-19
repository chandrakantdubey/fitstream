import { useWorkoutStore } from '../stores/workoutStore'
import { Trash2, Dumbbell, Calendar } from 'lucide-react'

export default function WorkoutCard({ workout }) {
  const { deleteWorkoutById } = useWorkoutStore()
  return (
    <div className="card space-y-3">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold">{workout.name}</h3>
          <div className="flex items-center gap-1 text-xs text-slate-400 mt-1">
            <Calendar size={12} />
            {new Date(workout.created_at).toLocaleDateString()}
          </div>
        </div>
        <button onClick={() => deleteWorkoutById(workout.id)} className="p-1.5 text-red-400 hover:bg-red-900/30 rounded-lg">
          <Trash2 size={14} />
        </button>
      </div>
      <div className="space-y-1.5">
        {workout.exercises.map((ex, i) => (
          <div key={i} className="flex items-center gap-2 text-sm">
            <Dumbbell size={14} className="text-blue-400 shrink-0" />
            <span className="truncate flex-1">{ex.name}</span>
            <span className="text-slate-400 text-xs shrink-0">{ex.sets}x{ex.reps}</span>
          </div>
        ))}
      </div>
    </div>
  )
}