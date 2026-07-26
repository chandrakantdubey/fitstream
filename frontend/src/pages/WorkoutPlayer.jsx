import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Play,
  Pause,
  SkipForward,
  CheckCircle2,
  Volume2,
  VolumeX,
  RotateCcw,
  Plus,
  Minus,
  ArrowLeft,
  RefreshCw,
  Sparkles,
  Flame
} from "lucide-react";

export default function WorkoutPlayer() {
  const { workoutId } = useParams();
  const navigate = useNavigate();

  const [soundEnabled, setSoundEnabled] = useState(true);
  const [exerciseIndex, setExerciseIndex] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [completedSets, setCompletedSets] = useState([]);
  const [isResting, setIsResting] = useState(false);
  const [restTimer, setRestTimer] = useState(45);
  const [activeWeight, setActiveWeight] = useState(20);
  const [activeReps, setActiveReps] = useState(10);
  const [workoutDuration, setWorkoutDuration] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [workoutFinished, setWorkoutFinished] = useState(false);

  // Sample routine exercises
  const [routineExercises, setRoutineExercises] = useState([
    { id: "ex-1", name: "Dumbbell Bench Press", target: "Chest", sets: 3, reps: 10, defaultWeight: 24 },
    { id: "ex-2", name: "Incline Dumbbell Flyes", target: "Upper Chest", sets: 3, reps: 12, defaultWeight: 16 },
    { id: "ex-3", name: "Overhead Dumbbell Press", target: "Shoulders", sets: 3, reps: 10, defaultWeight: 18 },
    { id: "ex-4", name: "Tricep Rope Pushdowns", target: "Triceps", sets: 3, reps: 12, defaultWeight: 22 },
    { id: "ex-5", name: "Push-ups to Failure", target: "Chest & Triceps", sets: 2, reps: 15, defaultWeight: 0 }
  ]);

  const currentExercise = routineExercises[exerciseIndex] || routineExercises[0];

  // Speech synthesizer voice cue
  const speakCue = (text) => {
    if (!soundEnabled || !("speechSynthesis" in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.log("Speech synthesis error", e);
    }
  };

  // Announce initial exercise on index change
  useEffect(() => {
    if (currentExercise) {
      setActiveWeight(currentExercise.defaultWeight);
      setActiveReps(currentExercise.reps);
      speakCue(`Next exercise: ${currentExercise.name}`);
    }
  }, [exerciseIndex]);

  // Workout duration stopwatch
  useEffect(() => {
    if (workoutFinished || isPaused) return;
    const interval = setInterval(() => {
      setWorkoutDuration(d => d + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [workoutFinished, isPaused]);

  // Rest timer countdown
  useEffect(() => {
    let timerInt;
    if (isResting && restTimer > 0) {
      timerInt = setInterval(() => {
        setRestTimer(t => {
          if (t <= 4 && t > 1 && soundEnabled) {
            // Count down audio beep cue
            speakCue(`${t - 1}`);
          }
          if (t <= 1) {
            setIsResting(false);
            speakCue("Rest finished! Next set.");
            return 45;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerInt);
  }, [isResting, restTimer, soundEnabled]);

  const handleCompleteSet = () => {
    const newRecord = {
      exerciseId: currentExercise.id,
      setNumber: currentSet,
      weight: activeWeight,
      reps: activeReps
    };

    setCompletedSets(prev => [...prev, newRecord]);

    if (currentSet < currentExercise.sets) {
      setCurrentSet(s => s + 1);
      setIsResting(true);
      setRestTimer(45);
      speakCue(`Set completed. Rest for 45 seconds.`);
    } else {
      // Last set of exercise
      if (exerciseIndex < routineExercises.length - 1) {
        setExerciseIndex(idx => idx + 1);
        setCurrentSet(1);
        setIsResting(true);
        setRestTimer(60);
        speakCue(`Exercise finished. Rest for 60 seconds.`);
      } else {
        // Workout complete!
        setWorkoutFinished(true);
        speakCue("Congratulations! Workout complete!");
      }
    }
  };

  const formatDuration = (totalSec) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  if (workoutFinished) {
    return (
      <div className="surface p-8 text-center space-y-6 my-10 max-w-lg mx-auto border border-emerald-500/50 bg-gradient-to-b from-zinc-900 via-zinc-900 to-emerald-950/40">
        <div className="w-20 h-20 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/40 animate-bounce">
          <Sparkles size={38} />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-black text-white">Workout Completed!</h2>
          <p className="text-sm text-zinc-400">Great effort today. Muscle stimulus logged successfully.</p>
        </div>

        <div className="grid grid-cols-3 gap-3 bg-zinc-950 p-4 rounded-2xl border border-zinc-800">
          <div>
            <div className="text-lg font-black text-white">{formatDuration(workoutDuration)}</div>
            <div className="text-[10px] text-zinc-500 uppercase">Duration</div>
          </div>
          <div>
            <div className="text-lg font-black text-emerald-400">{completedSets.length}</div>
            <div className="text-[10px] text-zinc-500 uppercase">Sets Done</div>
          </div>
          <div>
            <div className="text-lg font-black text-amber-400">
              {completedSets.reduce((sum, s) => sum + (s.weight * s.reps), 0)} kg
            </div>
            <div className="text-[10px] text-zinc-500 uppercase">Total Vol</div>
          </div>
        </div>

        <button
          onClick={() => navigate("/")}
          className="btn-brand w-full py-3 font-bold"
        >
          Return to Daily Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-24">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white"
        >
          <ArrowLeft size={18} />
        </button>

        <div className="text-center">
          <div className="text-xs text-zinc-500 font-medium">LIVE WORKOUT PLAYER</div>
          <div className="text-sm font-bold text-white">{formatDuration(workoutDuration)}</div>
        </div>

        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className={`p-2 rounded-xl border transition-all ${
            soundEnabled
              ? "bg-emerald-950/60 border-emerald-500/50 text-emerald-400"
              : "bg-zinc-900 border-zinc-800 text-zinc-500"
          }`}
          title="Toggle Voice Cues"
        >
          {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
        </button>
      </div>

      {/* Rest Overlay Card */}
      {isResting ? (
        <div className="surface p-8 text-center space-y-5 border border-amber-500/50 bg-amber-950/20">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-bold border border-amber-500/30">
            <Flame size={14} /> REST TIMER
          </div>

          <div className="text-6xl font-black text-white tracking-tight animate-pulse">
            {restTimer} <span className="text-2xl text-zinc-400">sec</span>
          </div>

          <p className="text-xs text-zinc-400">
            Up Next: Set {currentSet} of {currentExercise.name}
          </p>

          <button
            onClick={() => setIsResting(false)}
            className="btn-ghost px-6 py-2 text-xs font-bold border-amber-500/30 text-amber-300"
          >
            Skip Rest Timer
          </button>
        </div>
      ) : (
        /* Active Exercise Card */
        <div className="surface p-6 space-y-6 border border-zinc-800">
          <div className="flex items-center justify-between">
            <span className="badge bg-emerald-500/10 text-emerald-400 border-emerald-500/30 font-bold">
              EXERCISE {exerciseIndex + 1} OF {routineExercises.length}
            </span>
            <span className="text-xs text-zinc-400 font-semibold">
              SET {currentSet} OF {currentExercise.sets}
            </span>
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl font-black text-white">{currentExercise.name}</h2>
            <p className="text-xs text-emerald-400 font-medium">Target Muscle: {currentExercise.target}</p>
          </div>

          {/* Set Tracker Weight & Rep Adjuster */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800/80 text-center space-y-2">
              <span className="text-xs text-zinc-400 font-medium">Weight (kg)</span>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => setActiveWeight(w => Math.max(0, w - 2.5))}
                  className="p-2 rounded-xl bg-zinc-800 text-white hover:bg-zinc-700 active:scale-95"
                >
                  <Minus size={16} />
                </button>
                <span className="text-2xl font-extrabold text-white">{activeWeight}</span>
                <button
                  onClick={() => setActiveWeight(w => w + 2.5)}
                  className="p-2 rounded-xl bg-zinc-800 text-white hover:bg-zinc-700 active:scale-95"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800/80 text-center space-y-2">
              <span className="text-xs text-zinc-400 font-medium">Target Reps</span>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => setActiveReps(r => Math.max(1, r - 1))}
                  className="p-2 rounded-xl bg-zinc-800 text-white hover:bg-zinc-700 active:scale-95"
                >
                  <Minus size={16} />
                </button>
                <span className="text-2xl font-extrabold text-white">{activeReps}</span>
                <button
                  onClick={() => setActiveReps(r => r + 1)}
                  className="p-2 rounded-xl bg-zinc-800 text-white hover:bg-zinc-700 active:scale-95"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>
          </div>

          <button
            onClick={handleCompleteSet}
            className="btn-brand w-full py-4 text-base font-extrabold flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/30"
          >
            <CheckCircle2 size={20} /> Complete Set {currentSet}
          </button>
        </div>
      )}

      {/* Routine Progress Overview */}
      <div className="surface p-5 space-y-3">
        <h3 className="text-xs text-zinc-400 font-bold uppercase tracking-wider">Routine Progress</h3>
        <div className="space-y-2">
          {routineExercises.map((ex, idx) => (
            <div
              key={ex.id}
              className={`p-3 rounded-xl flex items-center justify-between text-xs transition-all ${
                idx === exerciseIndex
                  ? "bg-emerald-950/60 border border-emerald-500/50 text-white font-bold"
                  : idx < exerciseIndex
                  ? "bg-zinc-900 text-zinc-500 line-through opacity-70"
                  : "bg-zinc-900/50 text-zinc-400"
              }`}
            >
              <span>{idx + 1}. {ex.name}</span>
              <span>{ex.sets} sets x {ex.reps}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
