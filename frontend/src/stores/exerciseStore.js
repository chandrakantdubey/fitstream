import { create } from "zustand";
import { fetchExercises, fetchFilters } from "../utils/api";
import { buildIndex, search } from "../utils/search";

const applyQueryAndFilters = (exercises, searchQuery, activeFilters) => {
  let items = searchQuery.trim() ? search(searchQuery) : exercises;

  if (activeFilters.category) {
    items = items.filter((e) => e.category === activeFilters.category);
  }
  if (activeFilters.equipment) {
    items = items.filter((e) => e.equipment === activeFilters.equipment);
  }
  if (activeFilters.target) {
    items = items.filter((e) => e.target === activeFilters.target);
  }

  return items;
};

export const useExerciseStore = create((set, get) => ({
  exercises: [],
  filtered: [],
  filters: { categories: [], equipment: [], targets: [] },
  activeFilters: { category: "", equipment: "", target: "" },
  searchQuery: "",
  page: 1,
  pageSize: 24,
  loading: false,
  selected: null,

  load: async () => {
    set({ loading: true });
    try {
      const data = await fetchExercises({ limit: 2000 });
      const items = data.items || data;
      buildIndex(items);
      const { searchQuery, activeFilters } = get();
      set({
        exercises: items,
        filtered: applyQueryAndFilters(items, searchQuery, activeFilters),
        page: 1,
        loading: false,
      });
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
    const { exercises, activeFilters } = get();
    set({
      searchQuery: q,
      filtered: applyQueryAndFilters(exercises, q, activeFilters),
      page: 1,
    });
  },

  setFilter: (type, val) => {
    const active = { ...get().activeFilters, [type]: val };
    const { exercises, searchQuery } = get();
    set({
      activeFilters: active,
      filtered: applyQueryAndFilters(exercises, searchQuery, active),
      page: 1,
    });
  },

  clearFilters: () =>
    set({
      activeFilters: { category: "", equipment: "", target: "" },
      filtered: get().exercises,
      searchQuery: "",
      page: 1,
    }),
  setPage: (page) => set({ page }),
  select: (ex) => set({ selected: ex }),
  clear: () => set({ selected: null }),
}));
