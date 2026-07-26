import { useState } from "react";
import { Sparkles, X, Target, Dumbbell, Calendar, Check, ChevronRight } from "lucide-react";

export default function PlanGeneratorModal({ isOpen, onClose, onGenerate }) {
  const [step, setStep] = useState(1);
  const [goal, setGoal] = useState("Muscle Growth");
  const [level, setLevel] = useState("Intermediate");
  const [equipment, setEquipment] = useState("Full Gym");
  const [days, setDays] = useState("4 Days");

  if (!isOpen) return null;

  const handleFinish = () => {
    onGenerate({ goal, level, equipment, days });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 max-w-md w-full space-y-5 relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1 rounded-full text-zinc-400 hover:text-white bg-zinc-800 hover:bg-zinc-700"
        >
          <X size={18} />
        </button>

        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/20">
            <Sparkles size={13} /> AI Workout Plan Generator
          </div>
          <h2 className="text-xl font-extrabold text-white">Create Your Custom Training Plan</h2>
          <p className="text-xs text-zinc-400">Step {step} of 4</p>
        </div>

        {/* Step 1: Goal */}
        {step === 1 && (
          <div className="space-y-3">
            <label className="text-sm font-bold text-white block">What is your primary fitness goal?</label>
            {[
              { id: "Muscle Growth", label: "Build Muscle & Hypertrophy", desc: "Focus on hypertrophy rep ranges (8-12 reps)" },
              { id: "Weight Loss", label: "Lose Weight & Burn Fat", desc: "High density circuits & cardio integration" },
              { id: "Strength", label: "Maximum Strength & Power", desc: "Heavy compound lifts (3-6 reps)" },
              { id: "General Fitness", label: "Stay Fit & Healthy", desc: "Balanced full-body routines" }
            ].map(g => (
              <button
                key={g.id}
                onClick={() => setGoal(g.id)}
                className={`w-full p-3.5 rounded-2xl text-left border transition-all ${
                  goal === g.id
                    ? "bg-emerald-950/60 border-emerald-500 text-white"
                    : "bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-zinc-700"
                }`}
              >
                <div className="font-semibold text-sm">{g.label}</div>
                <div className="text-xs text-zinc-400">{g.desc}</div>
              </button>
            ))}
          </div>
        )}

        {/* Step 2: Level */}
        {step === 2 && (
          <div className="space-y-3">
            <label className="text-sm font-bold text-white block">What is your fitness experience level?</label>
            {[
              { id: "Beginner", label: "Beginner", desc: "< 6 months lifting experience" },
              { id: "Intermediate", label: "Intermediate", desc: "6 months to 2 years consistent lifting" },
              { id: "Advanced", label: "Advanced", desc: "2+ years of structured strength training" }
            ].map(l => (
              <button
                key={l.id}
                onClick={() => setLevel(l.id)}
                className={`w-full p-3.5 rounded-2xl text-left border transition-all ${
                  level === l.id
                    ? "bg-emerald-950/60 border-emerald-500 text-white"
                    : "bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-zinc-700"
                }`}
              >
                <div className="font-semibold text-sm">{l.label}</div>
                <div className="text-xs text-zinc-400">{l.desc}</div>
              </button>
            ))}
          </div>
        )}

        {/* Step 3: Equipment */}
        {step === 3 && (
          <div className="space-y-3">
            <label className="text-sm font-bold text-white block">What equipment do you have access to?</label>
            {[
              { id: "Bodyweight", label: "Home / Bodyweight Only", desc: "No equipment required (Push-ups, Squats, Planks)" },
              { id: "Dumbbells", label: "Dumbbells Only", desc: "Home gym with adjustable dumbbells" },
              { id: "Full Gym", label: "Full Commercial Gym", desc: "Barbells, cables, machines & dumbbells" }
            ].map(eq => (
              <button
                key={eq.id}
                onClick={() => setEquipment(eq.id)}
                className={`w-full p-3.5 rounded-2xl text-left border transition-all ${
                  equipment === eq.id
                    ? "bg-emerald-950/60 border-emerald-500 text-white"
                    : "bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-zinc-700"
                }`}
              >
                <div className="font-semibold text-sm">{eq.label}</div>
                <div className="text-xs text-zinc-400">{eq.desc}</div>
              </button>
            ))}
          </div>
        )}

        {/* Step 4: Days */}
        {step === 4 && (
          <div className="space-y-3">
            <label className="text-sm font-bold text-white block">How many days per week can you train?</label>
            {[
              { id: "3 Days", label: "3 Days / Week", desc: "Full Body split (Mon / Wed / Fri)" },
              { id: "4 Days", label: "4 Days / Week", desc: "Upper / Lower split (Mon / Tue / Thu / Fri)" },
              { id: "5 Days", label: "5 Days / Week", desc: "Push / Pull / Legs split" }
            ].map(d => (
              <button
                key={d.id}
                onClick={() => setDays(d.id)}
                className={`w-full p-3.5 rounded-2xl text-left border transition-all ${
                  days === d.id
                    ? "bg-emerald-950/60 border-emerald-500 text-white"
                    : "bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-zinc-700"
                }`}
              >
                <div className="font-semibold text-sm">{d.label}</div>
                <div className="text-xs text-zinc-400">{d.desc}</div>
              </button>
            ))}
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex gap-2 pt-3 border-t border-zinc-800">
          {step > 1 && (
            <button
              onClick={() => setStep(s => s - 1)}
              className="btn-ghost flex-1 py-2.5"
            >
              Back
            </button>
          )}
          {step < 4 ? (
            <button
              onClick={() => setStep(s => s + 1)}
              className="btn-brand flex-1 py-2.5 flex items-center justify-center gap-1"
            >
              Next <ChevronRight size={16} />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              className="btn-brand flex-1 py-2.5 font-bold flex items-center justify-center gap-1"
            >
              Generate Plan <Sparkles size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
