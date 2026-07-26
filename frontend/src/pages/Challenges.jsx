import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  CalendarCheck,
  Flame,
  CheckCircle2,
  Play,
  Sparkles,
  RotateCcw,
  Coffee,
  X,
  Dumbbell
} from "lucide-react";

const API_BASE = "http://localhost:8000";

export default function Challenges() {
  const [catalog, setCatalog] = useState([]);
  const [selectedChallengeId, setSelectedChallengeId] = useState("abs-30");
  const [challengeDetails, setChallengeDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeDayModal, setActiveDayModal] = useState(null);

  const fetchCatalog = async () => {
    try {
      const res = await fetch(`${API_BASE}/challenges/catalog`);
      const data = await res.json();
      setCatalog(data);
    } catch (err) {
      console.error("Error loading catalog:", err);
    }
  };

  const fetchDetails = async (id) => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/challenges/details/${id}?user_id=1`);
      const data = await res.json();
      setChallengeDetails(data);
    } catch (err) {
      console.error("Error loading challenge details:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalog();
  }, []);

  useEffect(() => {
    if (selectedChallengeId) {
      fetchDetails(selectedChallengeId);
    }
  }, [selectedChallengeId]);

  const handleStartChallenge = async (id) => {
    try {
      await fetch(`${API_BASE}/challenges/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: "1", challenge_id: id })
      });
      fetchDetails(id);
    } catch (err) {
      console.error("Error starting challenge:", err);
    }
  };

  const handleRestartChallenge = async (id) => {
    try {
      await fetch(`${API_BASE}/reset/challenge`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: "1", challenge_id: id })
      });
      fetchDetails(id);
    } catch (err) {
      console.error("Error resetting challenge:", err);
    }
  };

  const handleCompleteDay = async (dayNumber) => {
    try {
      await fetch(`${API_BASE}/challenges/complete-day`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: "1", challenge_id: selectedChallengeId, day_number: dayNumber })
      });
      fetchDetails(selectedChallengeId);
      setActiveDayModal(null);
    } catch (err) {
      console.error("Error completing day:", err);
    }
  };

  return (
    <div className="space-y-6 pb-20 max-w-2xl mx-auto px-1">
      {/* Header */}
      <div>
        <h1 className="page-title flex items-center gap-2">
          <CalendarCheck className="text-emerald-400" size={26} /> 30-Day Challenges
        </h1>
        <p className="page-subtitle">
          Specific progressive workout routines tailored for every single day.
        </p>
      </div>

      {/* Challenge Selector Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {catalog.map((ch) => {
          const isSelected = ch.id === selectedChallengeId;
          return (
            <button
              key={ch.id}
              onClick={() => setSelectedChallengeId(ch.id)}
              className={`px-4 py-3 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 border ${
                isSelected
                  ? "bg-emerald-600 text-white border-emerald-500 shadow-lg shadow-emerald-900/30"
                  : "bg-zinc-900 text-zinc-400 border-zinc-800/80 hover:border-zinc-700"
              }`}
            >
              <Flame size={15} className={isSelected ? "text-amber-300 fill-amber-300" : "text-zinc-500"} />
              {ch.title}
            </button>
          );
        })}
      </div>

      {/* Challenge Hero Card */}
      {challengeDetails && (
        <div className="surface p-6 relative overflow-hidden bg-gradient-to-r from-zinc-900 via-zinc-900 to-emerald-950/40 border border-zinc-800">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="badge border-emerald-500/30 text-emerald-400 bg-emerald-500/10 font-bold">
                  {challengeDetails.template.category}
                </span>
                <span className="badge font-bold">
                  {challengeDetails.template.difficulty}
                </span>
              </div>
              <h2 className="text-xl font-black text-white">{challengeDetails.template.title}</h2>
              <p className="text-xs text-zinc-400 max-w-md">{challengeDetails.template.description}</p>
            </div>

            {!challengeDetails.user_progress.started ? (
              <button
                onClick={() => handleStartChallenge(selectedChallengeId)}
                className="btn-brand px-6 py-3 text-xs font-extrabold flex items-center gap-2 shrink-0 shadow-lg shadow-emerald-900/30"
              >
                <Sparkles size={16} /> Start 30-Day Program
              </button>
            ) : (
              <div className="flex flex-col items-center gap-2 shrink-0">
                <div className="bg-zinc-950/90 border border-emerald-800/40 px-5 py-3 rounded-2xl text-center min-w-[140px]">
                  <div className="text-2xl font-black text-emerald-400">
                    {challengeDetails.user_progress.completed_days.length} <span className="text-xs text-zinc-500 font-medium">/ 30</span>
                  </div>
                  <div className="text-[10px] text-zinc-400 font-semibold uppercase mt-0.5">Days Completed</div>
                </div>

                <button
                  onClick={() => handleRestartChallenge(selectedChallengeId)}
                  className="text-[11px] text-zinc-500 hover:text-amber-400 flex items-center gap-1 font-medium"
                >
                  <RotateCcw size={12} /> Reset to Day 1
                </button>
              </div>
            )}
          </div>

          {/* Progress bar */}
          {challengeDetails.user_progress.started && (
            <div className="mt-5 space-y-1.5">
              <div className="flex justify-between text-xs text-zinc-400 font-medium">
                <span>Challenge Progress</span>
                <span className="text-emerald-400 font-bold">
                  {Math.round((challengeDetails.user_progress.completed_days.length / 30) * 100)}%
                </span>
              </div>
              <div className="w-full bg-zinc-800 h-2.5 rounded-full overflow-hidden border border-zinc-700/40">
                <div
                  className="bg-gradient-to-r from-emerald-600 to-emerald-400 h-full transition-all duration-300 rounded-full"
                  style={{ width: `${(challengeDetails.user_progress.completed_days.length / 30) * 100}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 30-Day Grid */}
      {challengeDetails && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white">30-Day Schedule</h3>
            <div className="flex items-center gap-3 text-[11px] text-zinc-400 font-medium">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400"></span> Done</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400"></span> Today</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-400"></span> Rest</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {challengeDetails.schedule.map((dayItem) => {
              return (
                <div
                  key={dayItem.day}
                  onClick={() => setActiveDayModal(dayItem)}
                  className={`surface p-4 rounded-2xl flex flex-col justify-between transition-all duration-200 border cursor-pointer ${
                    dayItem.is_completed
                      ? "border-emerald-500/40 bg-emerald-950/20 hover:border-emerald-500"
                      : dayItem.is_current
                      ? "border-amber-500/80 bg-zinc-900/90 shadow-lg shadow-amber-500/10 hover:border-amber-400"
                      : dayItem.is_rest
                      ? "border-blue-900/40 bg-blue-950/10 hover:border-blue-700"
                      : "border-zinc-800/60 bg-zinc-900/40 hover:border-zinc-700"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-black tracking-wide text-white">DAY {dayItem.day}</span>
                    {dayItem.is_completed ? (
                      <CheckCircle2 size={16} className="text-emerald-400 fill-emerald-400/20" />
                    ) : dayItem.is_rest ? (
                      <Coffee size={14} className="text-blue-400" />
                    ) : dayItem.is_current ? (
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
                    ) : null}
                  </div>

                  <div className="my-2 space-y-1">
                    <div className="text-xs font-bold text-white line-clamp-1">{dayItem.title}</div>
                    {dayItem.is_rest ? (
                      <div className="text-[10px] text-blue-300 font-semibold uppercase">Rest & Recovery</div>
                    ) : (
                      <div className="text-[11px] text-zinc-400 font-medium">
                        {dayItem.exercises.length} Exercises
                      </div>
                    )}
                  </div>

                  <div className="pt-2">
                    {dayItem.is_rest ? (
                      <div className="text-[10px] text-center text-blue-300 font-bold py-1 bg-blue-950/60 rounded-xl border border-blue-800/30">
                        {dayItem.is_completed ? "Rested" : "Rest Day"}
                      </div>
                    ) : (
                      <div className="text-[10px] text-center text-emerald-400 font-extrabold py-1 bg-emerald-950/60 rounded-xl border border-emerald-800/40 flex items-center justify-center gap-1">
                        <Play size={10} className="fill-current" /> Preview & Start
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Day Routine Preview Modal */}
      {activeDayModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 max-w-md w-full space-y-5 relative">
            <button
              onClick={() => setActiveDayModal(null)}
              className="absolute top-5 right-5 p-1.5 rounded-full text-zinc-400 hover:text-white bg-zinc-800 hover:bg-zinc-700"
            >
              <X size={18} />
            </button>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="badge text-[10px] text-emerald-400 border-emerald-500/30 bg-emerald-500/10 font-bold">
                  DAY {activeDayModal.day}
                </span>
                {activeDayModal.is_rest && (
                  <span className="badge text-[10px] text-blue-300 border-blue-500/30 bg-blue-500/10 font-bold">
                    REST DAY
                  </span>
                )}
              </div>
              <h2 className="text-xl font-extrabold text-white">{activeDayModal.title}</h2>
              <p className="text-xs text-zinc-400">
                {activeDayModal.is_rest
                  ? "Take time to hydrate, stretch, and allow muscle recovery."
                  : "Target exercises designed for today's progressive stimulus."}
              </p>
            </div>

            {/* Exercise List */}
            <div className="space-y-2">
              {activeDayModal.exercises.map((ex, idx) => (
                <div key={idx} className="bg-zinc-950 p-3.5 rounded-2xl border border-zinc-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                      <Dumbbell size={16} />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">{ex.name}</div>
                      <div className="text-[10px] text-zinc-400">{ex.sets} sets</div>
                    </div>
                  </div>
                  <span className="text-xs font-extrabold text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-xl border border-emerald-800/40">
                    {ex.reps}
                  </span>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-3 border-t border-zinc-800">
              {activeDayModal.is_rest ? (
                <button
                  disabled={activeDayModal.is_completed}
                  onClick={() => handleCompleteDay(activeDayModal.day)}
                  className="btn-brand flex-1 py-3 text-xs font-bold"
                >
                  {activeDayModal.is_completed ? "Already Rested" : "Mark Rest Completed"}
                </button>
              ) : (
                <>
                  <button
                    onClick={() => handleCompleteDay(activeDayModal.day)}
                    className="btn-ghost flex-1 py-3 text-xs font-bold"
                  >
                    {activeDayModal.is_completed ? "Completed" : "Mark Done"}
                  </button>
                  <Link
                    to={`/play/challenge-${selectedChallengeId}-day-${activeDayModal.day}`}
                    className="btn-brand flex-1 py-3 text-xs font-bold text-center flex items-center justify-center gap-1"
                  >
                    <Play size={14} className="fill-current" /> Start Live Workout
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
