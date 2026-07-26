import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Dumbbell,
  Play,
  Sparkles,
  Layers,
  Trash2
} from "lucide-react";
import PlanGeneratorModal from "../components/PlanGeneratorModal";

const API_BASE = "http://localhost:8000";

export default function Workouts() {
  const [customWorkouts, setCustomWorkouts] = useState([]);
  const [presets, setPresets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showGenerator, setShowGenerator] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState(null);

  const fetchWorkouts = async () => {
    try {
      setLoading(true);
      const [customRes, presetsRes] = await Promise.all([
        fetch(`${API_BASE}/workouts?user_id=1`),
        fetch(`${API_BASE}/workouts/presets`)
      ]);
      const customData = await customRes.json();
      const presetsData = await presetsRes.json();

      setCustomWorkouts(Array.isArray(customData) ? customData : []);
      setPresets(Array.isArray(presetsData) ? presetsData : []);
    } catch (err) {
      console.error("Error fetching workouts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkouts();
  }, []);

  const handleDeleteWorkout = async (id) => {
    try {
      await fetch(`${API_BASE}/workouts/${id}`, { method: "DELETE" });
      fetchWorkouts();
    } catch (err) {
      console.error("Error deleting workout:", err);
    }
  };

  const handlePlanGenerated = (planData) => {
    setGeneratedPlan(planData);
    fetchWorkouts();
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <Dumbbell className="text-emerald-400" size={26} /> Workouts & Plans
          </h1>
          <p className="page-subtitle">
            Manage custom workout routines or generate personalized splits.
          </p>
        </div>

        <button
          onClick={() => setShowGenerator(true)}
          className="btn-brand text-xs px-4 py-2.5 flex items-center gap-1.5 shrink-0"
        >
          <Sparkles size={15} /> AI Plan Wizard
        </button>
      </div>

      {/* Active Generated Plan Banner */}
      {generatedPlan && (
        <div className="surface p-5 border border-emerald-500/50 bg-gradient-to-r from-zinc-900 via-zinc-900 to-emerald-950/40">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="badge bg-emerald-500/10 text-emerald-400 border-emerald-500/30 font-bold">
                GENERATED PLAN SAVED
              </span>
              <span className="badge">{generatedPlan.preferences.level}</span>
            </div>
            <button
              onClick={() => setGeneratedPlan(null)}
              className="text-xs text-zinc-500 hover:text-zinc-300"
            >
              Clear
            </button>
          </div>
          <h3 className="text-lg font-black text-white">{generatedPlan.title}</h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Routines saved directly to your custom workouts below.
          </p>
        </div>
      )}

      {/* Custom Workouts Section */}
      {customWorkouts.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Layers size={18} className="text-emerald-400" /> Your Saved Routines
            </h2>
            <span className="text-xs text-zinc-500">{customWorkouts.length} Routines</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {customWorkouts.map((w) => (
              <div key={w.id} className="surface p-5 flex flex-col justify-between surface-hover space-y-3">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="badge text-[10px] text-emerald-400 border-emerald-500/20 bg-emerald-500/10">
                      CUSTOM PLAN
                    </span>
                    <button
                      onClick={() => handleDeleteWorkout(w.id)}
                      className="text-zinc-500 hover:text-red-400 p-1"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                  <h3 className="text-base font-bold text-white">{w.name}</h3>
                  <p className="text-xs text-zinc-400">{w.exercises ? w.exercises.length : 0} Exercises included</p>
                </div>

                <Link
                  to={`/play/${w.id}`}
                  className="btn-brand text-xs py-2.5 px-4 flex items-center justify-center gap-1 font-bold"
                >
                  <Play size={13} className="fill-current" /> Start Routine
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Routine Presets */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white">Preset Workout Routines</h2>
          <span className="text-xs text-zinc-500">{presets.length} Routines</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {presets.map((tpl) => (
            <div key={tpl.id} className="surface p-5 flex flex-col justify-between surface-hover space-y-4">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="badge text-[10px] text-emerald-400 border-emerald-500/20 bg-emerald-500/10">
                    {tpl.category}
                  </span>
                  <span className="text-xs text-zinc-400 font-medium">{tpl.duration}</span>
                </div>
                <h3 className="text-base font-bold text-white">{tpl.name}</h3>
                <p className="text-xs text-zinc-400">
                  {tpl.exercises ? `${tpl.exercises.length} Target Exercises` : "Full Body Routine"}
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-zinc-800/80">
                <span className="text-xs text-zinc-500">
                  {tpl.exercises ? tpl.exercises.length : 5} Exercises
                </span>
                <Link
                  to={`/play/${tpl.id}`}
                  className="btn-brand text-xs py-2 px-4 flex items-center gap-1 font-bold"
                >
                  <Play size={13} className="fill-current" /> Start Routine
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      <PlanGeneratorModal
        isOpen={showGenerator}
        onClose={() => setShowGenerator(false)}
        onGenerate={handlePlanGenerated}
      />
    </div>
  );
}
