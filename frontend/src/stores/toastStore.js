import { create } from "zustand";
export const useToastStore = create((set) => ({
  toasts: [],
  add: (msg, type = "info") => {
    const id = Date.now();
    set((s) => ({ toasts: [...s.toasts, { id, msg, type }] }));
    setTimeout(
      () => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
      3000,
    );
  },
}));
