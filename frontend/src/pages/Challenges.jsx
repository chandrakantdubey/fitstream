import { useState, useEffect } from "react";
import {
  CalendarCheck,
  Flame,
  CheckCircle2,
  Lock,
  Play,
  Award,
  ChevronRight,
  ShieldAlert,
  Sparkles
} from "lucide-react";

const API_BASE = "http://localhost:8000";

export default function Challenges() {
  const [catalog, setCatalog] = useState([]);
  const [selectedChallengeId, setSelectedChallengeId] = useState("abs-30");
  const [challengeDetails, setChallengeDetails] = useState(null);
  const [loading, setLoading] = useState(true);

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
        body: JSON.stringify({ user_id: 1, challenge_id: id })
      });
      fetchDetails(id);
    } catch (err) {
      console.error("Error starting challenge:", err);
    }
  };

  const handleCompleteDay = async (dayNumber) => {
    try {
      await fetch(`${API_BASE}/challenges/complete-day`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: 1, challenge_id: selectedChallengeId, day_number: dayNumber })
      });
      fetchDetails(selectedChallengeId);
    } catch (err) {
      console.error("Error completing day:", err);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div>
        <h1 className="page-title flex items-center gap-2">
          <CalendarCheck className="text-emerald-400" size={26} /> 30-Day Challenges
        </h1>
        <p className="page-subtitle">
          Leap-Fitness inspired progressive workout challenges with automated rest days.
        </p>
      </div>

      {/* Challenge Selector Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        {catalog.map((ch) => {
          const isSelected = ch.id === selectedChallengeId;
          return (
            <button
              key={ch.id}
              onClick={() => setSelectedChallengeId(ch.id)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 border ${
                isSelected
                  ? "bg-emerald-600 text-white border-emerald-500 shadow-lg shadow-emerald-900/30"
                  : "bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-700"
              }`}
            >
              <Flame size={15} className={isSelected ? "text-amber-300" : "text-zinc-500"} />
              {ch.title}
            </button>
          );
        })}
      </div>

      {/* Selected Challenge Details Header */}
      {challengeDetails && (
        <div className="surface p-6 relative overflow-hidden bg-gradient-to-r from-zinc-900 via-zinc-900 to-emerald-950/40">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="badge border-emerald-500/30 text-emerald-400 bg-emerald-500/10">
                  {challengeDetails.template.category}
                </span>
                <span className="badge">
                  {challengeDetails.template.difficulty}
                </span>
              </div>
              <h2 className="text-xl font-black text-white">{challengeDetails.template.title}</h2>
              <p className="text-xs text-zinc-400 max-w-md">{challengeDetails.template.description}</p>
            </div>

            {!challengeDetails.user_progress.started ? (
              <button
                onClick={() => handleStartChallenge(selectedChallengeId)}
                className="btn-brand px-6 py-3 text-sm font-bold flex items-center gap-2 shrink-0"
              >
                <Sparkles size={16} /> Start 30-Day Plan
              </button>
            ) : (
              <div className="bg-zinc-950/80 border border-emerald-800/40 p-4 rounded-2xl text-center shrink-0 min-w-[140px]">
                <div className="text-2xl font-black text-emerald-400">
                  {challengeDetails.user_progress.completed_days.length} / 30
                </div>
                <div className="text-[10px] text-zinc-400 font-semibold uppercase mt-0.5">Days Completed</div>
              </div>
            )}
          </div>

          {/* Progress bar */}
          {challengeDetails.user_progress.started && (
            <div className="mt-5 space-y-1.5">
              <div className="flex justify-between text-xs text-zinc-400 font-medium">
                <span>Total Challenge Progress</span>
                <span className="text-emerald-400 font-bold">
                  {Math.round((challengeDetails.user_progress.completed_days.length / 30) * 100)}%
                </span>
              </div>
              <div className="w-full bg-zinc-800 h-2.5 rounded-full overflow-hidden border border-zinc-700/40">
                <div
                  className="bg-emerald-500 h-full transition-all duration-300 rounded-full"
                  style={{ width: `${(challengeDetails.user_progress.completed_days.length / 30) * 100}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 30-Day Grid */}
      {challengeDetails && (
        <div className="space-y-3">
          <h3 className="text-base font-bold text-white flex items-center justify-between">
            <span>30-Day Workout Calendar</span>
            <span className="text-xs text-zinc-500 font-normal">Rest every 4th day</span>
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {challengeDetails.schedule.map((dayItem) => {
              return (
                <div
                  key={dayItem.day}
                  className={`surface p-4 flex flex-col justify-between relative transition-all ${
                    dayItem.is_completed
                      ? "border-emerald-500/50 bg-emerald-950/20"
                      : dayItem.is_current
                      ? "border-amber-500/80 bg-zinc-900 shadow-md shadow-amber-500/10"
                      : dayItem.is_rest
                      ? "border-blue-900/40 bg-zinc-900/40 opacity-80"
                      : ""
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-white">DAY {dayItem.day}</span>
                    {dayItem.is_completed ? (
                      <CheckCircle2 size={16} className="text-emerald-400 fill-emerald-400/20" />
                    ) : dayItem.is_rest ? (
                      <span className="text-[10px] bg-blue-500/20 text-blue-300 font-bold px-2 py-0.5 rounded-full border border-blue-500/30">
                        REST
                      </span>
                    ) : dayItem.is_current ? (
                      <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded-full border border-amber-500/30">
                        TODAY
                      </span>
                    ) : null}
                  </div>

                  <div className="my-3 space-y-1">
                    {dayItem.is_rest ? (
                      <p className="text-xs text-blue-300 font-medium">Recovery & Stretch</p>
                    ) : (
                      <p className="text-xs text-zinc-300 font-medium">
                        {dayItem.exercises.length} Exercises Routine
                      </p>
                    )}
                  </div>

                  {dayItem.is_rest ? (
                    <button
                      disabled={dayItem.is_completed}
                      onClick={() => handleCompleteDay(dayItem.day)}
                      className={`w-full py-1.5 rounded-xl text-xs font-semibold transition-all ${
                        dayItem.is_completed
                          ? "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                          : "bg-blue-950/60 hover:bg-blue-900 text-blue-300 border border-blue-800/40"
                      }`}
                    >
                      {dayItem.is_completed ? "Rested" : "Mark Rest Done"}
                    </button>
                  ) : (
                    <button
                      onClick={() => handleCompleteDay(dayItem.day)}
                      className={`w-full py-1.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition-all ${
                        dayItem.is_completed
                          ? "bg-emerald-950/80 text-emerald-300 border border-emerald-800/40"
                          : dayItem.is_current
                          ? "bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                          : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                      }`}
                    >
                      {dayItem.is_completed ? (
                        <>
                          <CheckCircle2 size={13} /> Completed
                        </>
                      ) : (
                        <>
                          <Play size={13} className="fill-current" /> Complete Day
                        </>
                      )}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
