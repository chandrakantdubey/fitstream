import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Play, Clock, TrendingUp, BookOpen } from "lucide-react";

export default function Programs() {
  const [programs, setPrograms] = useState([]);
  const [activeProgram, setActiveProgram] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const nav = useNavigate();

  useEffect(() => {
    fetchPrograms();
    fetchActiveProgram();
  }, []);

  const fetchPrograms = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:8000/programs', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setPrograms(data);
    } catch (err) {
      console.error('Failed to fetch programs:', err);
    }
  };

  const fetchActiveProgram = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:8000/programs/enrolled/active', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setActiveProgram(data);
    } catch (err) {
      console.error('Failed to fetch active program:', err);
    }
  };

  const handleEnroll = async (programId) => {
    try {
      const token = localStorage.getItem('token');
      await fetch('http://localhost:8000/programs/enroll', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ program_id: programId })
      });
      fetchActiveProgram();
    } catch (err) {
      console.error('Failed to enroll:', err);
    }
  };

  const handleUpdateProgress = async (week, day) => {
    if (!activeProgram) return;
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:8000/programs/enrolled/${activeProgram.id}/progress?week=${week}&day=${day}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchActiveProgram();
    } catch (err) {
      console.error('Failed to update progress:', err);
    }
  };

  return (
    <div className="space-y-6 pb-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Programs</h1>
          <p className="page-subtitle">Structured workout plans</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-brand p-2 rounded-xl"
        >
          <Plus size={20} />
        </button>
      </div>

      {/* Active Program */}
      {activeProgram && (
        <div className="surface p-4 border-2 border-brand-500/30">
          <div className="flex items-center gap-2 mb-3">
            <Play size={16} className="text-brand-400" />
            <h3 className="font-semibold text-zinc-200">Active Program</h3>
          </div>
          <h2 className="text-xl font-bold mb-2">{activeProgram.program?.name}</h2>
          <p className="text-sm text-zinc-400 mb-4">{activeProgram.program?.description}</p>
          
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-2">
              <Clock size={14} className="text-zinc-500" />
              <span className="text-sm text-zinc-400">
                Week {activeProgram.current_week} / {activeProgram.program?.duration_weeks}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp size={14} className="text-zinc-500" />
              <span className="text-sm text-zinc-400">Day {activeProgram.current_day}</span>
            </div>
          </div>

          {/* Week Progress */}
          <div className="flex gap-1 mb-4">
            {Array.from({ length: activeProgram.program?.duration_weeks || 4 }).map((_, i) => (
              <div
                key={i}
                className={`flex-1 h-2 rounded-full ${
                  i < activeProgram.current_week - 1
                    ? 'bg-brand-500'
                    : i === activeProgram.current_week - 1
                    ? 'bg-brand-500/40'
                    : 'bg-zinc-800'
                }`}
              />
            ))}
          </div>

          <button
            onClick={() => handleUpdateProgress(activeProgram.current_week, activeProgram.current_day + 1)}
            className="btn-brand w-full py-2"
          >
            Mark Day Complete
          </button>
        </div>
      )}

      {/* Available Programs */}
      <div>
        <h3 className="text-sm font-semibold text-zinc-300 mb-3">Available Programs</h3>
        <div className="space-y-3">
          {programs.map((program) => (
            <div key={program.id} className="surface p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-semibold text-zinc-200">{program.name}</h4>
                  <p className="text-xs text-zinc-500 mt-1">
                    {program.duration_weeks} weeks • {program.difficulty}
                  </p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  program.category === 'strength' ? 'bg-brand-900/30 text-brand-400' :
                  program.category === 'hypertrophy' ? 'bg-purple-900/30 text-purple-400' :
                  'bg-blue-900/30 text-blue-400'
                }`}>
                  {program.category}
                </span>
              </div>
              
              <p className="text-sm text-zinc-400 mb-3 line-clamp-2">{program.description}</p>
              
              <div className="flex items-center gap-2">
                <BookOpen size={14} className="text-zinc-500" />
                <span className="text-xs text-zinc-500">{program.weeks?.length || 0} weeks</span>
              </div>

              {!activeProgram?.program_id === program.id && (
                <button
                  onClick={() => handleEnroll(program.id)}
                  className="btn-brand w-full mt-3 py-2"
                >
                  Start Program
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Create Program Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="surface p-6 w-full max-w-md">
            <h2 className="text-lg font-bold mb-4">Create Program</h2>
            <p className="text-sm text-zinc-400 mb-4">
              Program creation requires detailed workout planning. This is a simplified view.
            </p>
            <button
              onClick={() => setShowCreateModal(false)}
              className="btn-ghost w-full"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
