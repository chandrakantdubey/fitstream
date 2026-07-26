import { useState, useEffect, useMemo } from "react";
import {
  BookOpen,
  Search,
  Filter,
  Star,
  Info,
  X,
  Dumbbell,
  CheckCircle2,
  Sparkles,
  ChevronRight
} from "lucide-react";

const API_BASE = "http://localhost:8000";

const MUSCLE_GROUPS = ["All", "Chest", "Back", "Legs", "Shoulders", "Biceps", "Triceps", "Abs", "Cardio"];
const EQUIPMENT_LIST = ["All", "Barbell", "Dumbbell", "Bodyweight", "Cable", "Machine"];

export default function Library() {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMuscle, setSelectedMuscle] = useState("All");
  const [selectedEquipment, setSelectedEquipment] = useState("All");
  const [showStarredOnly, setShowStarredOnly] = useState(false);

  // Favorites stored in localStorage
  const [starredIds, setStarredIds] = useState(() => {
    try {
      const saved = localStorage.getItem("fitstream_starred_exercises");
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [activeModalExercise, setActiveModalExercise] = useState(null);

  useEffect(() => {
    const fetchExercises = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE}/exercises`);
        const data = await res.json();
        setExercises(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error loading exercises:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchExercises();
  }, []);

  const toggleStar = (id, e) => {
    if (e) e.stopPropagation();
    setStarredIds((prev) => {
      const updated = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
      localStorage.setItem("fitstream_starred_exercises", JSON.stringify(updated));
      return updated;
    });
  };

  const filteredExercises = useMemo(() => {
    return exercises.filter((ex) => {
      const matchesSearch =
        ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (ex.target && ex.target.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesMuscle =
        selectedMuscle === "All" ||
        (ex.target && ex.target.toLowerCase().includes(selectedMuscle.toLowerCase())) ||
        (ex.bodyPart && ex.bodyPart.toLowerCase().includes(selectedMuscle.toLowerCase()));

      const matchesEquipment =
        selectedEquipment === "All" ||
        (ex.equipment && ex.equipment.toLowerCase().includes(selectedEquipment.toLowerCase()));

      const matchesStarred = !showStarredOnly || starredIds.includes(ex.id);

      return matchesSearch && matchesMuscle && matchesEquipment && matchesStarred;
    });
  }, [exercises, searchQuery, selectedMuscle, selectedEquipment, showStarredOnly, starredIds]);

  return (
    <div className="space-y-6 pb-24 max-w-2xl mx-auto px-1">
      {/* Header */}
      <div>
        <h1 className="page-title flex items-center gap-2">
          <BookOpen className="text-emerald-400" size={26} /> Exercise Library
        </h1>
        <p className="page-subtitle">
          Browse 1,300+ exercises with equipment, targeted muscle filters, and form guides.
        </p>
      </div>

      {/* Search & Favorites Toggle */}
      <div className="space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3.5 top-3.5 text-zinc-400" />
            <input
              type="text"
              placeholder="Search exercise by name or muscle (e.g. Bench Press)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-modern pl-10 w-full"
            />
          </div>

          <button
            onClick={() => setShowStarredOnly(!showStarredOnly)}
            className={`px-4 py-2.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all ${
              showStarredOnly
                ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                : "bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-700"
            }`}
          >
            <Star size={16} className={showStarredOnly ? "fill-amber-300" : ""} />
            Favorites ({starredIds.length})
          </button>
        </div>

        {/* Filter Pills */}
        <div className="space-y-2">
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-xs text-zinc-500 font-semibold py-1 pr-1">Muscle:</span>
            {MUSCLE_GROUPS.map((m) => (
              <button
                key={m}
                onClick={() => setSelectedMuscle(m)}
                className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all border ${
                  selectedMuscle === m
                    ? "bg-emerald-600 text-white border-emerald-500"
                    : "bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-700"
                }`}
              >
                {m}
              </button>
            ))}
          </div>

          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-xs text-zinc-500 font-semibold py-1 pr-1">Equipment:</span>
            {EQUIPMENT_LIST.map((eq) => (
              <button
                key={eq}
                onClick={() => setSelectedEquipment(eq)}
                className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all border ${
                  selectedEquipment === eq
                    ? "bg-blue-600 text-white border-blue-500"
                    : "bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-700"
                }`}
              >
                {eq}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Exercise Grid */}
      {loading ? (
        <div className="surface p-8 text-center space-y-3">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-zinc-400 font-bold">Loading exercise database...</p>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs text-zinc-400 font-medium px-1">
            <span>Showing {filteredExercises.length} Exercises</span>
            {showStarredOnly && <span className="text-amber-400">Filtering Favorites Only</span>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filteredExercises.slice(0, 40).map((ex) => {
              const isStarred = starredIds.includes(ex.id);
              return (
                <div
                  key={ex.id}
                  onClick={() => setActiveModalExercise(ex)}
                  className="surface p-4 flex items-center justify-between surface-hover border border-zinc-800 cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-emerald-400">
                      <Dumbbell size={18} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white line-clamp-1">{ex.name}</h4>
                      <div className="flex items-center gap-2 text-[11px] text-zinc-400 mt-0.5">
                        <span className="text-emerald-400 font-medium">{ex.target || "Full Body"}</span>
                        <span>•</span>
                        <span className="capitalize">{ex.equipment || "Bodyweight"}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={(e) => toggleStar(ex.id, e)}
                    className={`p-2 rounded-xl border transition-all ${
                      isStarred
                        ? "bg-amber-500/10 border-amber-500/40 text-amber-400"
                        : "bg-zinc-900 border-zinc-800 text-zinc-600 hover:text-zinc-400"
                    }`}
                  >
                    <Star size={16} className={isStarred ? "fill-amber-400" : ""} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Exercise Detail Modal */}
      {activeModalExercise && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 max-w-md w-full space-y-5 relative max-h-[85vh] overflow-y-auto">
            <button
              onClick={() => setActiveModalExercise(null)}
              className="absolute top-5 right-5 p-1.5 rounded-full text-zinc-400 hover:text-white bg-zinc-800 hover:bg-zinc-700"
            >
              <X size={18} />
            </button>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="badge text-[10px] text-emerald-400 border-emerald-500/30 bg-emerald-500/10 font-bold">
                  {activeModalExercise.target || "Primary Muscle"}
                </span>
                <span className="badge text-[10px] capitalize font-bold">
                  {activeModalExercise.equipment || "Equipment Required"}
                </span>
              </div>
              <h2 className="text-xl font-extrabold text-white">{activeModalExercise.name}</h2>
            </div>

            {/* Execution Form Pointers */}
            <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800/80 space-y-2">
              <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <Sparkles size={14} /> Execution Form & Execution Guide
              </div>
              <ul className="space-y-1.5 text-xs text-zinc-300">
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                  <span>Maintain a steady, controlled tempo throughout concentric and eccentric phases.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                  <span>Brace core stability and keep spine neutral without arching.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                  <span>Exhale on exertion and inhale during movement reset.</span>
                </li>
              </ul>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={(e) => toggleStar(activeModalExercise.id, e)}
                className={`btn-ghost flex-1 py-3 text-xs font-bold flex items-center justify-center gap-1.5 ${
                  starredIds.includes(activeModalExercise.id) ? "text-amber-400 border-amber-500/30" : ""
                }`}
              >
                <Star size={15} className={starredIds.includes(activeModalExercise.id) ? "fill-amber-400" : ""} />
                {starredIds.includes(activeModalExercise.id) ? "Starred Favorite" : "Bookmark Exercise"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
