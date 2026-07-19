import { useExerciseStore } from "../stores/exerciseStore";
import { Search, X } from "lucide-react";

export default function ExerciseSearch() {
  const { searchQuery, setSearch } = useExerciseStore();
  return (
    <div className="relative mb-4">
      <Search
        className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
        size={18}
      />
      <input
        type="text"
        placeholder="Search 1,324 exercises..."
        value={searchQuery}
        onChange={(e) => setSearch(e.target.value)}
        className="input-modern w-full pl-11 pr-10 text-sm"
      />
      {searchQuery && (
        <button
          onClick={() => setSearch("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-zinc-500 hover:text-zinc-300 rounded-lg hover:bg-zinc-800 transition-colors"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
