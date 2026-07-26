import { create } from "zustand";
import {
  createWorkout,
  fetchWorkouts,
  deleteWorkout,
  startSession,
  completeSession,
  logSet,
} from "../utils/api";
import { useToastStore } from "./toastStore";

export const useWorkoutStore = create((set, get) => ({
  workouts: [],
  current: { name: "", exercises: [] },
  activeSession: null,
  timer: 0,
  timerRunning: false,

  load: async () => {
    try {
      const data = await fetchWorkouts();
      set({ workouts: data });
    } catch {}
  },

  addExercise: (ex) => {
    const { current } = get();
    if (current.exercises.find((e) => e.id === ex.id)) return;
    set({
      current: {
        ...current,
        exercises: [
          ...current.exercises,
          {
            ...ex,
            target_sets: 3,
            target_reps: 10,
            rest_seconds: 60,
            order_index: current.exercises.length,
          },
        ],
      },
    });
  },

  removeExercise: (id) => {
    const { current } = get();
    set({
      current: {
        ...current,
        exercises: current.exercises.filter((e) => e.id !== id),
      },
    });
  },

  updateParam: (id, field, val) => {
    const { current } = get();
    set({
      current: {
        ...current,
        exercises: current.exercises.map((e) =>
          e.id === id ? { ...e, [field]: val } : e,
        ),
      },
    });
  },

  setName: (name) => set({ current: { ...get().current, name } }),

  save: async () => {
    const { current } = get();
    if (!current.name.trim()) {
      useToastStore.getState().add("Name your workout first", "error");
      return false;
    }
    if (!current.exercises.length) {
      useToastStore.getState().add("Add at least one exercise", "error");
      return false;
    }
    const payload = {
      name: current.name.trim(),
      exercises: current.exercises.map((e, i) => ({
        exercise_id: e.id,
        order_index: i,
        target_sets: e.target_sets || 3,
        target_reps: e.target_reps || 10,
        rest_seconds: e.rest_seconds || 60,
        notes: "",
      })),
    };
    try {
      await createWorkout(payload);
      set({ current: { name: "", exercises: [] } });
      get().load();
      useToastStore.getState().add("Workout saved", "success");
      return true;
    } catch (err) {
      useToastStore.getState().add(err.message || "Failed to save", "error");
      return false;
    }
  },

  deleteById: async (id) => {
    try {
      await deleteWorkout(id);
      get().load();
      useToastStore.getState().add("Deleted", "success");
    } catch {}
  },

  // Session / Player
  startSession: async (workoutId) => {
    try {
      const s = await startSession(workoutId);
      set({ activeSession: s, timer: 0, timerRunning: false });
      return s;
    } catch {
      useToastStore.getState().add("Failed to start session", "error");
    }
  },

  completeSession: async () => {
    const { activeSession } = get();
    if (!activeSession) return;
    try {
      await completeSession(activeSession.id);
      set({ activeSession: null, timer: 0, timerRunning: false });
      useToastStore.getState().add("Workout complete!", "success");
    } catch {}
  },

  logSet: async (workoutExerciseId, setNumber, reps, weight) => {
    const { activeSession } = get();
    if (!activeSession) return;
    try {
      await logSet(activeSession.id, {
        workout_exercise_id: workoutExerciseId,
        set_number: setNumber,
        reps_completed: reps,
        weight_kg: weight,
      });
    } catch {}
  },

  startTimer: (seconds) => set({ timer: seconds, timerRunning: true }),
  stopTimer: () => set({ timerRunning: false }),
  tickTimer: () => {
    const { timer, timerRunning } = get();
    if (timerRunning && timer > 0) set({ timer: timer - 1 });
    else if (timerRunning && timer <= 0) set({ timerRunning: false, timer: 0 });
  },

  clearCurrent: () => set({ current: { name: "", exercises: [] } }),
}));
