import { useEffect } from "react";
import { useExerciseStore } from "../stores/exerciseStore";
import ExerciseSearch from "../components/ExerciseSearch";
import FilterBar from "../components/FilterBar";
import ExerciseCard from "../components/ExerciseCard";
import ExerciseDetail from "../components/ExerciseDetail";
import { BookOpen } from "lucide-react";

export default function Library() {
  const { filtered, load, loadFilters, loading } = useExerciseStore();
  useEffect(() => {
    load();
    loadFilters();
  }, []);

  return (
    <div className="space-y-4 pb-4 animate-fade-in">
      <div className="flex items-center gap-3">
        <BookOpen size={22} className="text-brand-400" />
        <div>
          <h1 className="page-title">Exercise Library</h1>
          <p className="page-subtitle">
            {filtered.length.toLocaleString()} exercises found
          </p>
        </div>
      </div>
      <ExerciseSearch />
      <FilterBar />
      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-20 skeleton" />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((ex) => (
            <ExerciseCard key={ex.id} exercise={ex} />
          ))}
        </div>
      )}
      <ExerciseDetail />
    </div>
  );
}
