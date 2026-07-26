import { useEffect } from "react";
import { useExerciseStore } from "../stores/exerciseStore";
import ExerciseSearch from "../components/ExerciseSearch";
import FilterBar from "../components/FilterBar";
import ExerciseCard from "../components/ExerciseCard";
import ExerciseDetail from "../components/ExerciseDetail";
import { BookOpen, ChevronLeft, ChevronRight } from "lucide-react";

export default function Library() {
  const { filtered, load, loadFilters, loading, page, pageSize, setPage } =
    useExerciseStore();
  useEffect(() => {
    load();
    loadFilters();
  }, []);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * pageSize;
  const pageItems = filtered.slice(start, start + pageSize);
  const firstItem = filtered.length ? start + 1 : 0;
  const lastItem = Math.min(start + pageSize, filtered.length);

  useEffect(() => {
    if (page !== safePage) setPage(safePage);
  }, [page, safePage, setPage]);

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
        <>
          <div className="flex items-center justify-between gap-3 text-xs text-zinc-500">
            <span>
              Showing {firstItem.toLocaleString()}-{lastItem.toLocaleString()} of{" "}
              {filtered.length.toLocaleString()}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(safePage - 1)}
                disabled={safePage === 1}
                className="btn-ghost p-2 disabled:opacity-40 disabled:active:scale-100"
                aria-label="Previous page"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="min-w-16 text-center font-medium text-zinc-300">
                {safePage} / {totalPages}
              </span>
              <button
                onClick={() => setPage(safePage + 1)}
                disabled={safePage === totalPages}
                className="btn-ghost p-2 disabled:opacity-40 disabled:active:scale-100"
                aria-label="Next page"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          <div className="space-y-2">
            {pageItems.map((ex) => (
              <ExerciseCard key={ex.id} exercise={ex} />
            ))}
          </div>
        </>
      )}
      <ExerciseDetail />
    </div>
  );
}
