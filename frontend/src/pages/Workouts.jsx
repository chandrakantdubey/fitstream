import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Dumbbell,
  Plus,
  Play,
  Sparkles,
  Calendar,
  Layers,
  ChevronRight,
  Zap,
  Trash2
} from "lucide-react";
import PlanGeneratorModal from "../components/PlanGeneratorModal";

const API_BASE = "http://localhost:8000";

export default function Workouts() {
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showGenerator, setShowGenerator] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState(null);

  const fetchWorkouts = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/workouts?user_id=1`);
      const data = await res.json();
      setWorkouts(data);
    } catch (err) {
      console.error("Error fetching workouts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkouts();
  }, []);

  const handlePlanGenerated = (preferences) => {
    // Generate split plan based on preferences
    let planTitle = `${preferences.days} ${preferences.goal} Split`;
    let routines = [];

    if (preferences.days === "3 Days") {
      routines = [
        { name: "Full Body A (Squat & Press)", duration: "45 min", exercises: 5 },
        { name: "Full Body B (Hinge & Pull)", duration: "45 min", exercises: 5 },
        { name: "Full Body C (Core & HIIT)", duration: "40 min", exercises: 6 }
      ];
    } else if (preferences.days === "4 Days") {
      routines = [
        { name: "Upper Body Hypertrophy", duration: "50 min", exercises: 6 },
        { name: "Lower Body Strength", duration: "50 min", exercises: 5 },
        { name: "Upper Body Power", duration: "45 min", exercises: 6 },
        { name: "Lower Body & Abs", duration: "45 min", exercises: 5 }
      ];
    } else {
      routines = [
        { name: "Push Day (Chest, Shoulders, Triceps)", duration: "50 min", exercises: 6 },
        { name: "Pull Day (Back & Biceps)", duration: "50 min", exercises: 6 },
        { name: "Legs & Abs Day", duration: "55 min", exercises: 6 },
        { name: "Upper Body Pump", duration: "45 min", exercises: 5 }
      ];
    }

    setGeneratedPlan({
      title: planTitle,
      preferences,
      routines
    });
  };

  const defaultTemplates = [
    {
      id: "ppl-push",
      name: "Push Day (Chest, Shoulders & Triceps)",
      category: "Push/Pull/Legs",
      duration: "45 min",
      exercisesCount: 6,
      target: "Chest, Shoulders, Triceps"
    },
    {
      id: "ppl-pull",
      name: "Pull Day (Back, Lat & Biceps)",
      category: "Push/Pull/Legs",
      duration: "50 min",
      exercisesCount: 6,
      target: "Back, Biceps, Rear Delt"
    },
    {
      id: "ppl-legs",
      name: "Legs & Abs Hypertrophy",
      category: "Push/Pull/Legs",
      duration: "55 min",
      exercisesCount: 6,
      target: "Quads, Hamstrings, Glutes, Abs"
    },
    {
      id: "home-bodyweight",
      name: "Home Calisthenics Burn",
      category: "No Equipment",
      duration: "30 min",
      exercisesCount: 5,
      target: "Full Body"
    }
  ];

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <Dumbbell className="text-emerald-400" size={26} /> Workouts & Plans
          </h1>
          <p className="page-subtitle">
            Manage your custom workout routines or generate personalized splits.
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
                GENERATED PLAN
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
            Tailored for {generatedPlan.preferences.equipment} access.
          </p>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {generatedPlan.routines.map((r, idx) => (
              <div key={idx} className="bg-zinc-950/80 p-3.5 rounded-2xl border border-zinc-800 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white">{r.name}</div>
                  <div className="text-[11px] text-zinc-400">{r.duration} • {r.exercises} exercises</div>
                </div>
                <Link
                  to={`/play/generated-${idx}`}
                  className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all"
                >
                  Start
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Routine Templates */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white">Preset Workout Routines</h2>
          <span className="text-xs text-zinc-500">4 Routines</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {defaultTemplates.map((tpl) => (
            <div key={tpl.id} className="surface p-5 flex flex-col justify-between surface-hover space-y-4">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="badge text-[10px] text-emerald-400 border-emerald-500/20 bg-emerald-500/10">
                    {tpl.category}
                  </span>
                  <span className="text-xs text-zinc-400 font-medium">{tpl.duration}</span>
                </div>
                <h3 className="text-base font-bold text-white">{tpl.name}</h3>
                <p className="text-xs text-zinc-400">Targets: {tpl.target}</p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-zinc-800/80">
                <span className="text-xs text-zinc-500">{tpl.exercisesCount} Exercises</span>
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

      {/* Plan Generator Modal */}
      <PlanGeneratorModal
        isOpen={showGenerator}
        onClose={() => setShowGenerator(false)}
        onGenerate={handlePlanGenerated}
      />
    </div>
  );
}
