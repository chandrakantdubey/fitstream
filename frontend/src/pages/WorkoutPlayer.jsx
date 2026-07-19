import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useWorkoutStore } from "../stores/workoutStore";
import {
  fetchWorkouts,
  startSession,
  completeSession,
  logSet,
} from "../utils/api";
import {
  Play,
  Pause,
  RotateCcw,
  CheckCircle,
  SkipForward,
  ChevronLeft,
  Timer,
  Weight,
} from "lucide-react";

export default function WorkoutPlayer() {
  const { workoutId } = useParams();
  const nav = useNavigate();
  const {
    activeSession,
    startSession: startStoreSession,
    completeSession: completeStoreSession,
    logSet: storeLogSet,
    timer,
    timerRunning,
    startTimer,
    stopTimer,
    tickTimer,
  } = useWorkoutStore();

  const [workout, setWorkout] = useState(null);
  const [currentExIndex, setCurrentExIndex] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [reps, setReps] = useState("");
  const [weight, setWeight] = useState("");
  const [setsLogged, setSetsLogged] = useState([]);
  const [finished, setFinished] = useState(false);

  const timerRef = useRef(null);

  useEffect(() => {
    fetchWorkout(workoutId).then(setWorkout);
    startStoreSession(workoutId);
    return () => stopTimer();
  }, [workoutId]);

  useEffect(() => {
    if (timerRunning) {
      timerRef.current = setInterval(() => tickTimer(), 1000);
      return () => clearInterval(timerRef.current);
    }
  }, [timerRunning]);

  if (!workout)
    return <div className="p-8 text-center text-zinc-500">Loading...</div>;

  const exercises = workout.exercises || [];
  const currentEx = exercises[currentExIndex];
  if (!currentEx) return null;

  const handleLogSet = async () => {
    if (!reps) return;
    await storeLogSet(
      currentEx.id,
      currentSet,
      parseInt(reps),
      parseFloat(weight) || 0,
    );
    setSetsLogged([
      ...setsLogged,
      { exId: currentEx.id, set: currentSet, reps, weight },
    ]);
    setReps("");
    setWeight("");

    if (currentSet >= (currentEx.target_sets || 3)) {
      if (currentExIndex >= exercises.length - 1) {
        setFinished(true);
        await completeStoreSession();
      } else {
        setCurrentExIndex(currentExIndex + 1);
        setCurrentSet(1);
        startTimer(currentEx.rest_seconds || 60);
      }
    } else {
      setCurrentSet(currentSet + 1);
      startTimer(currentEx.rest_seconds || 60);
    }
  };

  const skipRest = () => {
    stopTimer();
    startTimer(0);
  };

  if (finished) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center animate-fade-in">
        <div className="w-20 h-20 bg-brand-900/30 rounded-full flex items-center justify-center mb-6">
          <CheckCircle size={40} className="text-brand-400" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Workout Complete!</h2>
        <p className="text-zinc-400 mb-8">Great job finishing {workout.name}</p>
        <button onClick={() => nav("/workouts")} className="btn-brand px-8">
          Back to Workouts
        </button>
      </div>
    );
  }

  // Rest timer overlay
  if (timerRunning || timer > 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 animate-fade-in bg-zinc-950">
        <div className="text-center space-y-8">
          <div className="w-48 h-48 rounded-full border-4 border-zinc-800 flex items-center justify-center relative">
            <div
              className="absolute inset-0 rounded-full border-4 border-brand-500/20"
              style={{
                background: `conic-gradient(rgb(16 185 129) ${(timer / (currentEx.rest_seconds || 60)) * 360}deg, transparent 0deg)`,
              }}
            />
            <div className="text-5xl font-bold tabular-nums">
              {Math.floor(timer / 60)}:{String(timer % 60).padStart(2, "0")}
            </div>
          </div>
          <div>
            <p className="text-zinc-400 text-sm mb-1">Rest before</p>
            <p className="text-xl font-semibold">{currentEx.exercise?.name}</p>
            <p className="text-zinc-500 text-sm">
              Set {currentSet} of {currentEx.target_sets}
            </p>
          </div>
          <button
            onClick={skipRest}
            className="btn-ghost px-8 flex items-center gap-2 mx-auto"
          >
            <SkipForward size={16} /> Skip Rest
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => nav("/workouts")}
          className="p-2 bg-zinc-800 rounded-xl hover:bg-zinc-700 transition-colors"
        >
          <ChevronLeft size={18} />
        </button>
        <div className="flex-1">
          <p className="text-xs text-zinc-500 font-medium">{workout.name}</p>
          <h1 className="text-lg font-bold truncate">
            {currentEx.exercise?.name}
          </h1>
        </div>
        <div className="text-right">
          <p className="text-xs text-zinc-500">Exercise</p>
          <p className="text-sm font-bold text-brand-400">
            {currentExIndex + 1}/{exercises.length}
          </p>
        </div>
      </div>

      {/* GIF */}
      {currentEx.exercise?.media_id && (
        <div className="w-full aspect-video bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800">
          <img
            src={`https://static.exercisedb.dev/media/${currentEx.exercise.media_id}.gif`}
            alt={currentEx.exercise.name}
            className="w-full h-full object-contain"
          />
        </div>
      )}

      {/* Set Progress */}
      <div className="flex gap-2">
        {Array.from({ length: currentEx.target_sets || 3 }).map((_, i) => (
          <div
            key={i}
            className={`flex-1 h-2 rounded-full transition-colors ${
              i < currentSet - 1
                ? "bg-brand-500"
                : i === currentSet - 1
                  ? "bg-brand-500/40"
                  : "bg-zinc-800"
            }`}
          />
        ))}
      </div>

      {/* Log Form */}
      <div className="surface p-5 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Timer size={16} className="text-brand-400" />
          <span className="text-sm font-semibold">
            Set {currentSet} of {currentEx.target_sets}
          </span>
          <span className="text-xs text-zinc-500 ml-auto">
            Target: {currentEx.target_reps} reps
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="relative">
            <input
              type="number"
              placeholder="Reps"
              value={reps}
              onChange={(e) => setReps(e.target.value)}
              className="input-modern w-full text-center text-lg font-bold"
              min="1"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-500">
              reps
            </span>
          </div>
          <div className="relative">
            <input
              type="number"
              placeholder="Weight"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="input-modern w-full text-center text-lg font-bold"
              min="0"
              step="0.5"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-500">
              kg
            </span>
          </div>
        </div>

        <button
          onClick={handleLogSet}
          disabled={!reps}
          className="btn-brand w-full py-4 text-lg flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <CheckCircle size={20} /> Log Set
        </button>
      </div>

      {/* Exercise List Mini */}
      <div className="surface p-4">
        <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">
          Up Next
        </p>
        <div className="space-y-2">
          {exercises
            .slice(currentExIndex + 1, currentExIndex + 4)
            .map((ex, i) => (
              <div
                key={i}
                className="flex items-center gap-3 text-sm text-zinc-400"
              >
                <span className="w-5 h-5 rounded-full bg-zinc-800 flex items-center justify-center text-[10px] font-bold">
                  {currentExIndex + i + 2}
                </span>
                <span className="truncate">{ex.exercise?.name}</span>
                <span className="text-zinc-600 text-xs ml-auto">
                  {ex.target_sets}x{ex.target_reps}
                </span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
