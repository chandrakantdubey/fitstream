import { useState } from "react";
import { X, Plus, Trash2, Dumbbell, Sparkles } from "lucide-react";

const API_BASE = "http://localhost:8000";

export default function CreateWorkoutModal({ isOpen, onClose, onWorkoutCreated }) {
  const [workoutName, setWorkoutName] = useState("");
  const [exercises, setExercises] = useState([
    { name: "Dumbbell Bench Press", target_sets: 3, target_reps: 10, rest_seconds: 60 }
  ]);
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleAddExercise = () => {
    setExercises(prev => [
      ...prev,
      { name: "Push-ups", target_sets: 3, target_reps: 12, rest_seconds: 60 }
    ]);
  };

  const handleRemoveExercise = (idx) => {
    setExercises(prev => prev.filter((_, i) => i !== idx));
  };

  const handleUpdateExercise = (idx, field, value) => {
    setExercises(prev => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], [field]: value };
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!workoutName.trim()) return;

    try {
      setSaving(true);
      const payload = {
        name: workoutName,
        exercises: exercises.map((ex, idx) => ({
          exercise_id: `ex-custom-${idx}`,
          order_index: idx,
          target_sets: parseInt(ex.target_sets) || 3,
          target_reps: parseInt(ex.target_reps) || 10,
          rest_seconds: parseInt(ex.rest_seconds) || 60,
          notes: ex.name
        }))
      };

      const res = await fetch(`${API_BASE}/workouts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      onWorkoutCreated(data);
      onClose();
      setWorkoutName("");
    } catch (err) {
      console.error("Error creating custom workout:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 max-w-lg w-full space-y-5 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1 rounded-full text-zinc-400 hover:text-white bg-zinc-800 hover:bg-zinc-700"
        >
          <X size={18} />
        </button>

        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/20">
            <Dumbbell size={13} /> Custom Routine Builder
          </div>
          <h2 className="text-xl font-extrabold text-white">Create New Workout Routine</h2>
          <p className="text-xs text-zinc-400">Add custom exercises, sets, reps & rest intervals.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-zinc-400 block mb-1">Routine Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Upper Body Chest & Arms Burn"
              value={workoutName}
              onChange={(e) => setWorkoutName(e.target.value)}
              className="input-modern w-full"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs text-zinc-300 font-bold uppercase tracking-wider">Exercises List</label>
              <button
                type="button"
                onClick={handleAddExercise}
                className="text-xs text-emerald-400 hover:underline flex items-center gap-1 font-semibold"
              >
                <Plus size={14} /> Add Exercise
              </button>
            </div>

            {exercises.map((ex, idx) => (
              <div key={idx} className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Exercise Name"
                    value={ex.name}
                    onChange={(e) => handleUpdateExercise(idx, "name", e.target.value)}
                    className="bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-1.5 text-xs text-white flex-1 focus:outline-none"
                  />
                  {exercises.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveExercise(idx)}
                      className="text-zinc-500 hover:text-red-400 p-1"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] text-zinc-400 block">Sets</label>
                    <input
                      type="number"
                      min="1"
                      value={ex.target_sets}
                      onChange={(e) => handleUpdateExercise(idx, "target_sets", e.target.value)}
                      className="bg-zinc-900 border border-zinc-700 rounded-xl px-2.5 py-1 text-xs text-white w-full text-center"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-zinc-400 block">Target Reps</label>
                    <input
                      type="number"
                      min="1"
                      value={ex.target_reps}
                      onChange={(e) => handleUpdateExercise(idx, "target_reps", e.target.value)}
                      className="bg-zinc-900 border border-zinc-700 rounded-xl px-2.5 py-1 text-xs text-white w-full text-center"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-zinc-400 block">Rest (sec)</label>
                    <input
                      type="number"
                      step="15"
                      value={ex.rest_seconds}
                      onChange={(e) => handleUpdateExercise(idx, "rest_seconds", e.target.value)}
                      className="bg-zinc-900 border border-zinc-700 rounded-xl px-2.5 py-1 text-xs text-white w-full text-center"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="btn-ghost flex-1 py-2.5"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="btn-brand flex-1 py-2.5 font-bold"
            >
              {saving ? "Creating..." : "Save Routine"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
