import { create } from "zustand";
import { fetchExercises, fetchFilters } from "../utils/api";
import { buildIndex, search } from "../utils/search";

export const useExerciseStore = create((set, get) => ({
  exercises: [],
  filtered: [],
  filters: { categories: [], equipment: [], targets: [] },
  activeFilters: { category: "", equipment: "", target: "" },
  searchQuery: "",
  loading: false,
  selected: null,

  load: async () => {
    set({ loading: true });
    try {
      const data = await fetchExercises({ limit: 2000 });
      const items = data.items || data;
      buildIndex(items);
      set({ exercises: items, filtered: items, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  loadFilters: async () => {
    try {
      const f = await fetchFilters();
      set({ filters: f });
    } catch {}
  },

  setSearch: (q) => {
    set({ searchQuery: q });
    const { exercises } = get();
    set({ filtered: !q.trim() ? exercises : search(q) });
  },

  setFilter: (type, val) => {
    const active = { ...get().activeFilters, [type]: val };
    set({ activeFilters: active });
    let f = get().exercises;
    if (active.category) f = f.filter((e) => e.category === active.category);
    if (active.equipment) f = f.filter((e) => e.equipment === active.equipment);
    if (active.target) f = f.filter((e) => e.target === active.target);
    set({ filtered: f });
  },

  clearFilters: () =>
    set({
      activeFilters: { category: "", equipment: "", target: "" },
      filtered: get().exercises,
      searchQuery: "",
    }),
  select: (ex) => set({ selected: ex }),
  clear: () => set({ selected: null }),
}));
