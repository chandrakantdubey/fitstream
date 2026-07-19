import { useExerciseStore } from "../stores/exerciseStore";
import { SlidersHorizontal, X } from "lucide-react";

export default function FilterBar() {
  const { filters, activeFilters, setFilter, clearFilters } =
    useExerciseStore();
  const hasActive =
    activeFilters.category || activeFilters.equipment || activeFilters.target;
  return (
    <div className="flex flex-wrap gap-2 mb-4 items-center">
      <SlidersHorizontal size={14} className="text-zinc-500 mr-1" />
      {["category", "equipment", "target"].map((type) => (
        <select
          key={type}
          className="input-modern text-xs py-2 pr-8"
          value={activeFilters[type]}
          onChange={(e) => setFilter(type, e.target.value)}
        >
          <option value="">
            {type === "category"
              ? "Body Part"
              : type === "equipment"
                ? "Equipment"
                : "Target"}
          </option>
          {(filters[type + "s"] || []).map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </select>
      ))}
      {hasActive && (
        <button
          onClick={clearFilters}
          className="p-2 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 rounded-xl transition-colors"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
