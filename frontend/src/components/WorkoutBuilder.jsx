import { useWorkoutStore } from '../stores/workoutStore'
import { useState } from 'react'
import { Minus, Save, Trash2, Dumbbell } from 'lucide-react'

export default function WorkoutBuilder() {
  const { currentWorkout, removeFromWorkout, updateExerciseParams, setWorkoutName, saveCurrentWorkout, clearCurrentWorkout } = useWorkoutStore()
  const [saving, setSaving] = useState(false)

  if (!currentWorkout.exercises.length && !currentWorkout.name) {
    return (
      <div className="card text-center py-8 text-slate-500">
        <Dumbbell size={32} className="mx-auto mb-2 opacity-50" />
        <p className="text-sm">Tap + on exercises to build a workout</p>
      </div>
    )
  }

  return (
    <div className="card space-y-3">
      <div className="flex items-center gap-2">
        <input type="text" placeholder="Workout name..." value={currentWorkout.name}
          onChange={(e) => setWorkoutName(e.target.value)} className="input flex-1 text-sm" />
        {currentWorkout.exercises.length > 0 && (
          <button onClick={clearCurrentWorkout} className="p-2 text-red-400 hover:bg-red-900/30 rounded-lg">
            <Trash2 size={16} />
          </button>
        )}
      </div>
      <div className="space-y-2">
        {currentWorkout.exercises.map((ex) => (
          <div key={ex.id} className="bg-slate-700/50 rounded-lg p-3 flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{ex.name}</p>
              <p className="text-xs text-slate-400 capitalize">{ex.target}</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <input type="number" value={ex.sets} min="1"
                  onChange={(e) => updateExerciseParams(ex.id, 'sets', parseInt(e.target.value) || 1)}
                  className="w-12 input text-center text-sm py-1" />
                <span className="text-xs text-slate-400">sets</span>
              </div>
              <div className="flex items-center gap-1">
                <input type="number" value={ex.reps} min="1"
                  onChange={(e) => updateExerciseParams(ex.id, 'reps', parseInt(e.target.value) || 1)}
                  className="w-12 input text-center text-sm py-1" />
                <span className="text-xs text-slate-400">reps</span>
              </div>
              <button onClick={() => removeFromWorkout(ex.id)} className="p-1 text-red-400 hover:bg-red-900/30 rounded">
                <Minus size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
      {currentWorkout.exercises.length > 0 && currentWorkout.name && (
        <button onClick={() => { setSaving(true); saveCurrentWorkout().then(() => setSaving(false)) }}
          disabled={saving} className="btn-accent w-full flex items-center justify-center gap-2">
          <Save size={16} /> {saving ? 'Saving...' : 'Save Workout'}
        </button>
      )}
    </div>
  )
}