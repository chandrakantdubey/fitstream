import { useState, useEffect } from "react";
import {
  Sparkles,
  BookOpen,
  Calculator,
  Flame,
  ChevronRight,
  TrendingUp,
  Layers,
  Search,
  CheckCircle2
} from "lucide-react";

const API_BASE = "http://localhost:8000";

export default function KnowledgeBase() {
  const [articles, setArticles] = useState([]);
  const [activeArticle, setActiveArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [weightInput, setWeightInput] = useState(80);
  const [repsInput, setRepsInput] = useState(8);
  const [calcResult, setCalcResult] = useState(null);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/knowledge/articles`);
      const data = await res.json();
      setArticles(data);
      if (data.length > 0) setActiveArticle(data[0]);
    } catch (err) {
      console.error("Error loading knowledge articles:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCalculate1RM = async () => {
    try {
      const res = await fetch(`${API_BASE}/knowledge/calculator/1rm?weight=${weightInput}&reps=${repsInput}`);
      const data = await res.json();
      setCalcResult(data);
    } catch (err) {
      console.error("Error calculating 1RM:", err);
    }
  };

  useEffect(() => {
    fetchArticles();
    handleCalculate1RM();
  }, []);

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div>
        <h1 className="page-title flex items-center gap-2">
          <Sparkles className="text-emerald-400" size={26} /> Fitness Knowledge Base
        </h1>
        <p className="page-subtitle">
          Evidence-based guides on exercise volume ("how much & what type"), training intensity & science.
        </p>
      </div>

      {/* Interactive 1RM Calculator Widget */}
      <div className="surface p-6 border border-emerald-500/40 bg-gradient-to-r from-zinc-900 via-zinc-900 to-emerald-950/30">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Calculator size={20} />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-white">1RM (One Rep Max) & Load Calculator</h3>
            <p className="text-xs text-zinc-400">Estimate your max strength and target working loads</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div>
              <label className="text-xs text-zinc-400 block mb-1">Weight Lifted (kg)</label>
              <input
                type="number"
                value={weightInput}
                onChange={(e) => setWeightInput(parseFloat(e.target.value) || 0)}
                className="input-modern w-full"
              />
            </div>
            <div>
              <label className="text-xs text-zinc-400 block mb-1">Reps Completed</label>
              <input
                type="number"
                value={repsInput}
                onChange={(e) => setRepsInput(parseInt(e.target.value) || 1)}
                className="input-modern w-full"
              />
            </div>
            <button
              onClick={handleCalculate1RM}
              className="btn-brand w-full py-2.5 text-xs font-bold"
            >
              Calculate Max & Rep Targets
            </button>
          </div>

          {calcResult && (
            <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800 flex flex-col justify-between">
              <div>
                <div className="text-xs text-zinc-500 font-semibold uppercase">Estimated 1RM</div>
                <div className="text-3xl font-black text-emerald-400 my-1">
                  {calcResult.estimated_1rm} <span className="text-sm font-normal text-white">kg</span>
                </div>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-zinc-800">
                <div className="text-[11px] font-bold text-zinc-400">Recommended Working Loads:</div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-zinc-900 p-2 rounded-xl border border-zinc-800">
                    <span className="text-zinc-400 block">85% (5-6 reps)</span>
                    <span className="font-bold text-white">{calcResult.percentages["85% (5-6 reps)"]} kg</span>
                  </div>
                  <div className="bg-zinc-900 p-2 rounded-xl border border-zinc-800">
                    <span className="text-zinc-400 block">75% (9-10 reps)</span>
                    <span className="font-bold text-white">{calcResult.percentages["75% (9-10 reps)"]} kg</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Article Categories & Articles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Article Selector List */}
        <div className="space-y-2">
          <h3 className="text-xs text-zinc-500 font-bold uppercase tracking-wider mb-2">Training Wiki Articles</h3>
          {articles.map((art) => (
            <button
              key={art.slug}
              onClick={() => setActiveArticle(art)}
              className={`w-full p-4 rounded-2xl text-left border transition-all flex flex-col justify-between gap-2 ${
                activeArticle?.slug === art.slug
                  ? "bg-emerald-950/60 border-emerald-500/60 text-white shadow-lg shadow-emerald-900/20"
                  : "bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-zinc-700"
              }`}
            >
              <span className="badge text-[10px] border-emerald-500/30 text-emerald-400 bg-emerald-500/10 w-fit">
                {art.category}
              </span>
              <span className="text-sm font-bold">{art.title}</span>
              <span className="text-[11px] text-zinc-500">{art.read_time}</span>
            </button>
          ))}
        </div>

        {/* Active Article Viewer */}
        {activeArticle && (
          <div className="md:col-span-2 surface p-6 space-y-4 border border-zinc-800">
            <div className="space-y-1.5 pb-4 border-b border-zinc-800">
              <span className="badge border-emerald-500/30 text-emerald-400 bg-emerald-500/10">
                {activeArticle.category}
              </span>
              <h2 className="text-xl font-extrabold text-white">{activeArticle.title}</h2>
              <p className="text-xs text-zinc-400">{activeArticle.summary}</p>
            </div>

            <div className="prose prose-invert max-w-none text-xs text-zinc-300 leading-relaxed whitespace-pre-line">
              {activeArticle.content}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
