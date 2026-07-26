import { useState, useEffect } from "react";
import {
  Sparkles,
  Calculator,
  Flame,
  Scale,
  Award,
  BookOpen,
  ChevronRight,
  TrendingUp,
  Dumbbell,
  PieChart
} from "lucide-react";

const API_BASE = "http://localhost:8000";

export default function KnowledgeBase() {
  const [activeTab, setActiveTab] = useState("wiki"); // 'wiki' | '1rm' | 'tdee'
  const [wikiData, setWikiData] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1RM Calculator State
  const [weightLifted, setWeightLifted] = useState(80);
  const [repsPerformed, setRepsPerformed] = useState(5);

  // TDEE Calculator State
  const [tdeeWeight, setTdeeWeight] = useState(70);
  const [tdeeHeight, setTdeeHeight] = useState(175);
  const [tdeeAge, setTdeeAge] = useState(25);
  const [tdeeGender, setTdeeGender] = useState("Male");
  const [activityLevel, setActivityLevel] = useState(1.375); // Light to Moderate
  const [fitnessGoal, setFitnessGoal] = useState("Recomp"); // 'Bulking' | 'Cutting' | 'Recomp'

  useEffect(() => {
    const fetchWiki = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE}/knowledge/wiki`);
        const data = await res.json();
        setWikiData(data);
      } catch (err) {
        console.error("Error loading wiki:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchWiki();
  }, []);

  // Calculate 1RM Formulas
  const w = parseFloat(weightLifted) || 0;
  const r = parseInt(repsPerformed) || 1;
  const epley1RM = r === 1 ? w : Math.round(w * (1 + r / 30.0));
  const brzycki1RM = r === 1 ? w : Math.round(w * (36.0 / (37.0 - r)));
  const avg1RM = Math.round((epley1RM + brzycki1RM) / 2);

  const percentageTable = [
    { pct: 95, reps: "2 reps", weight: Math.round(avg1RM * 0.95) },
    { pct: 90, reps: "3-4 reps", weight: Math.round(avg1RM * 0.90) },
    { pct: 85, reps: "5-6 reps", weight: Math.round(avg1RM * 0.85) },
    { pct: 80, reps: "7-8 reps", weight: Math.round(avg1RM * 0.80) },
    { pct: 75, reps: "9-10 reps", weight: Math.round(avg1RM * 0.75) },
    { pct: 70, reps: "11-12 reps", weight: Math.round(avg1RM * 0.70) }
  ];

  // Calculate TDEE & Macros
  const tw = parseFloat(tdeeWeight) || 70;
  const th = parseFloat(tdeeHeight) || 175;
  const ta = parseInt(tdeeAge) || 25;
  const bmr = tdeeGender === "Female"
    ? Math.round(10 * tw + 6.25 * th - 5 * ta - 161)
    : Math.round(10 * tw + 6.25 * th - 5 * ta + 5);

  const tdee = Math.round(bmr * parseFloat(activityLevel));
  let targetCalories = tdee;
  if (fitnessGoal === "Bulking") targetCalories += 350;
  if (fitnessGoal === "Cutting") targetCalories -= 450;

  const proteinGrams = Math.round(tw * 2.0); // 2g per kg
  const fatGrams = Math.round((targetCalories * 0.25) / 9);
  const carbGrams = Math.max(0, Math.round((targetCalories - (proteinGrams * 4 + fatGrams * 9)) / 4));

  return (
    <div className="space-y-6 pb-24 max-w-2xl mx-auto px-1">
      {/* Header */}
      <div>
        <h1 className="page-title flex items-center gap-2">
          <Sparkles className="text-emerald-400" size={26} /> Knowledge Base & Calculators
        </h1>
        <p className="page-subtitle">
          Hypertrophy science, progressive overload guidelines, and interactive calculators.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-zinc-800 space-x-4">
        <button
          onClick={() => setActiveTab("wiki")}
          className={`pb-3 text-xs font-bold transition-all flex items-center gap-1.5 border-b-2 ${
            activeTab === "wiki"
              ? "border-emerald-400 text-emerald-400"
              : "border-transparent text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <BookOpen size={16} /> Training Wiki
        </button>
        <button
          onClick={() => setActiveTab("1rm")}
          className={`pb-3 text-xs font-bold transition-all flex items-center gap-1.5 border-b-2 ${
            activeTab === "1rm"
              ? "border-emerald-400 text-emerald-400"
              : "border-transparent text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <Dumbbell size={16} /> 1RM Calculator
        </button>
        <button
          onClick={() => setActiveTab("tdee")}
          className={`pb-3 text-xs font-bold transition-all flex items-center gap-1.5 border-b-2 ${
            activeTab === "tdee"
              ? "border-emerald-400 text-emerald-400"
              : "border-transparent text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <PieChart size={16} /> TDEE & Macros
        </button>
      </div>

      {/* Tab 1: Training Wiki */}
      {activeTab === "wiki" && (
        <div className="space-y-4">
          {wikiData ? (
            wikiData.articles.map((art) => (
              <div key={art.id} className="surface p-6 space-y-3 border border-zinc-800">
                <div className="flex items-center gap-2">
                  <span className="badge text-[10px] text-emerald-400 border-emerald-500/30 bg-emerald-500/10 font-bold">
                    {art.category}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white">{art.title}</h3>
                <p className="text-xs text-zinc-300 leading-relaxed">{art.content}</p>

                {art.key_takeaways && (
                  <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800 space-y-1.5 mt-2">
                    <div className="text-xs font-bold text-emerald-400">Key Takeaways:</div>
                    <ul className="list-disc list-inside text-xs text-zinc-400 space-y-1">
                      {art.key_takeaways.map((point, idx) => (
                        <li key={idx}>{point}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="surface p-8 text-center text-xs text-zinc-400 font-bold">Loading training science...</div>
          )}
        </div>
      )}

      {/* Tab 2: 1RM Calculator */}
      {activeTab === "1rm" && (
        <div className="space-y-6">
          <div className="surface p-6 space-y-4 border border-zinc-800">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Calculator size={18} className="text-emerald-400" /> One Rep Max (1RM) Estimator
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-zinc-400 block mb-1">Weight Lifted (kg)</label>
                <input
                  type="number"
                  value={weightLifted}
                  onChange={(e) => setWeightLifted(e.target.value)}
                  className="input-modern w-full text-base font-bold"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-400 block mb-1">Reps Performed</label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={repsPerformed}
                  onChange={(e) => setRepsPerformed(e.target.value)}
                  className="input-modern w-full text-base font-bold"
                />
              </div>
            </div>

            {/* Estimated 1RM Results */}
            <div className="bg-gradient-to-r from-zinc-950 via-zinc-900 to-emerald-950/40 p-5 rounded-2xl border border-emerald-500/40 text-center space-y-1">
              <div className="text-xs text-zinc-400 font-semibold uppercase">Estimated 1RM</div>
              <div className="text-4xl font-black text-emerald-400">{avg1RM} kg</div>
              <div className="text-[11px] text-zinc-400 mt-1">
                Epley: {epley1RM} kg • Brzycki: {brzycki1RM} kg
              </div>
            </div>
          </div>

          {/* Training Load Table */}
          <div className="surface p-6 space-y-4 border border-zinc-800">
            <h4 className="text-sm font-bold text-white">Target Load Percentage Chart</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {percentageTable.map((row) => (
                <div key={row.pct} className="bg-zinc-950 p-3.5 rounded-2xl border border-zinc-800 text-center">
                  <div className="text-xs text-emerald-400 font-bold">{row.pct}% 1RM</div>
                  <div className="text-lg font-black text-white my-0.5">{row.weight} kg</div>
                  <div className="text-[10px] text-zinc-400">{row.reps}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: TDEE & Macro Calculator */}
      {activeTab === "tdee" && (
        <div className="space-y-6">
          <div className="surface p-6 space-y-4 border border-zinc-800">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <PieChart size={18} className="text-emerald-400" /> TDEE & Macro Nutrition Calculator
            </h3>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-zinc-400 block mb-1">Weight (kg)</label>
                <input
                  type="number"
                  value={tdeeWeight}
                  onChange={(e) => setTdeeWeight(e.target.value)}
                  className="input-modern w-full text-sm font-bold"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-400 block mb-1">Height (cm)</label>
                <input
                  type="number"
                  value={tdeeHeight}
                  onChange={(e) => setTdeeHeight(e.target.value)}
                  className="input-modern w-full text-sm font-bold"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-400 block mb-1">Age</label>
                <input
                  type="number"
                  value={tdeeAge}
                  onChange={(e) => setTdeeAge(e.target.value)}
                  className="input-modern w-full text-sm font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-zinc-400 block mb-1">Activity Multiplier</label>
                <select
                  value={activityLevel}
                  onChange={(e) => setActivityLevel(e.target.value)}
                  className="bg-zinc-900 border border-zinc-700 text-xs text-white rounded-xl p-2.5 w-full"
                >
                  <option value="1.2">Sedentary (Desk Job)</option>
                  <option value="1.375">Light (1-3 days/wk)</option>
                  <option value="1.55">Moderate (3-5 days/wk)</option>
                  <option value="1.725">Heavy (6-7 days/wk)</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-zinc-400 block mb-1">Fitness Goal</label>
                <select
                  value={fitnessGoal}
                  onChange={(e) => setFitnessGoal(e.target.value)}
                  className="bg-zinc-900 border border-zinc-700 text-xs text-white rounded-xl p-2.5 w-full"
                >
                  <option value="Recomp">Recomposition (Maintain)</option>
                  <option value="Bulking">Lean Bulk (+350 kcal)</option>
                  <option value="Cutting">Fat Loss (-450 kcal)</option>
                </select>
              </div>
            </div>

            {/* Results Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800 text-center">
                <div className="text-[10px] text-zinc-400 uppercase">Maintenance</div>
                <div className="text-xl font-black text-white mt-1">{tdee}</div>
                <div className="text-[10px] text-zinc-500">kcal/day</div>
              </div>

              <div className="bg-zinc-950 p-4 rounded-2xl border border-emerald-500/40 text-center">
                <div className="text-[10px] text-emerald-400 uppercase">Target Intake</div>
                <div className="text-xl font-black text-emerald-400 mt-1">{targetCalories}</div>
                <div className="text-[10px] text-zinc-500">kcal/day</div>
              </div>

              <div className="bg-zinc-950 p-4 rounded-2xl border border-blue-500/30 text-center">
                <div className="text-[10px] text-blue-300 uppercase">Protein</div>
                <div className="text-xl font-black text-blue-300 mt-1">{proteinGrams}g</div>
                <div className="text-[10px] text-zinc-500">{proteinGrams * 4} kcal</div>
              </div>

              <div className="bg-zinc-950 p-4 rounded-2xl border border-amber-500/30 text-center">
                <div className="text-[10px] text-amber-400 uppercase">Carbs / Fats</div>
                <div className="text-sm font-bold text-amber-300 mt-1.5">{carbGrams}g / {fatGrams}g</div>
                <div className="text-[10px] text-zinc-500">Daily target</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
