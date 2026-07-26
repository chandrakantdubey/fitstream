import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Play, Clock, TrendingUp, BookOpen, Dumbbell, X, ChevronDown, ChevronUp, User, Zap } from "lucide-react";
import {
  enrollProgram,
  fetchActiveProgram as loadActiveProgram,
  fetchPrograms as loadPrograms,
  updateProgramProgress,
  createProgram,
  fetchExercises,
} from "../utils/api";
import useAuthStore from "../stores/authStore";

export default function Programs() {
  const [programs, setPrograms] = useState([]);
  const [activeProgram, setActiveProgram] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [exercises, setExercises] = useState([]);
  const nav = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const [programForm, setProgramForm] = useState({
    name: '',
    description: '',
    difficulty: 'intermediate',
    duration_weeks: 4,
    category: 'strength',
    split_type: 'full_body',
  });
  const [selectedSplit, setSelectedSplit] = useState(null);
  const [loading, setLoading] = useState(false);

  const splitTypes = [
    {
      id: 'full_body',
      name: 'Full Body',
      description: 'Train all muscle groups 3x per week',
      icon: User,
      frequency: 3,
      days: ['Full Body A', 'Full Body B', 'Full Body C']
    },
    {
      id: 'upper_lower',
      name: 'Upper/Lower Split',
      description: 'Alternate upper and lower body 4x per week',
      icon: Zap,
      frequency: 4,
      days: ['Upper Body A', 'Lower Body A', 'Upper Body B', 'Lower Body B']
    },
    {
      id: 'push_pull_legs',
      name: 'Push/Pull/Legs',
      description: 'Classic 3-day split for balanced development',
      icon: Dumbbell,
      frequency: 3,
      days: ['Push', 'Pull', 'Legs']
    },
    {
      id: 'bro_split',
      name: 'Bro Split',
      description: 'One muscle group per day, 5x per week',
      icon: TrendingUp,
      frequency: 5,
      days: ['Chest', 'Back', 'Legs', 'Shoulders', 'Arms']
    },
    {
      id: 'ab_legs',
      name: 'Abs & Legs Focus',
      description: 'Core and leg emphasis 4x per week',
      icon: BookOpen,
      frequency: 4,
      days: ['Legs A', 'Abs/Core', 'Legs B', 'Full Body']
    }
  ];

  useEffect(() => {
    fetchPrograms();
    fetchActiveProgram();
  }, []);

  useEffect(() => {
    if (showCreateModal) {
      fetchExercisesList();
    }
  }, [showCreateModal]);

  const fetchExercisesList = async () => {
    try {
      const data = await fetchExercises();
      setExercises(data);
    } catch (err) {
      console.error('Failed to fetch exercises:', err);
    }
  };

  const fetchPrograms = async () => {
    try {
      const data = await loadPrograms();
      setPrograms(data);
    } catch (err) {
      console.error('Failed to fetch programs:', err);
    }
  };

  const fetchActiveProgram = async () => {
    try {
      const data = await loadActiveProgram();
      setActiveProgram(data);
    } catch (err) {
      console.error('Failed to fetch active program:', err);
    }
  };

  const handleEnroll = async (programId) => {
    try {
      await enrollProgram(programId);
      fetchActiveProgram();
    } catch (err) {
      console.error('Failed to enroll:', err);
    }
  };

  const handleUpdateProgress = async (week, day) => {
    if (!activeProgram) return;
    try {
      await updateProgramProgress(activeProgram.id, week, day);
      fetchActiveProgram();
    } catch (err) {
      console.error('Failed to update progress:', err);
    }
  };

  const handleCreateProgram = async (e) => {
    e.preventDefault();
    if (!selectedSplit) return;
    
    if (!isAuthenticated) {
      alert('Please log in to create programs');
      nav('/login');
      return;
    }
    
    setLoading(true);
    try {
      const split = splitTypes.find(s => s.id === selectedSplit);
      const weeks = [];
      
      for (let week = 1; week <= programForm.duration_weeks; week++) {
        const days = split.days.map((dayName, dayIndex) => ({
          day_number: dayIndex + 1,
          name: dayName,
          workout_type: 'workout',
          exercises: getDefaultExercisesForDay(selectedSplit, dayIndex)
        }));
        
        weeks.push({
          week_number: week,
          name: `Week ${week}`,
          days
        });
      }
      
      const programData = {
        ...programForm,
        weeks
      };
      
      await createProgram(programData);
      setShowCreateModal(false);
      setProgramForm({
        name: '',
        description: '',
        difficulty: 'intermediate',
        duration_weeks: 4,
        category: 'strength',
        split_type: 'full_body',
      });
      setSelectedSplit(null);
      fetchPrograms();
    } catch (err) {
      console.error('Failed to create program:', err);
      if (err.message.includes('401') || err.message.includes('Unauthorized')) {
        alert('Authentication failed. Please log in again.');
        nav('/login');
      } else {
        alert('Failed to create program: ' + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const getDefaultExercisesForDay = (splitType, dayIndex) => {
    const defaultExercises = {
      'full_body': [
        { exercise_id: 'bench_press', target_sets: 3, target_reps: '10', rest_seconds: 90 },
        { exercise_id: 'squat', target_sets: 3, target_reps: '10', rest_seconds: 90 },
        { exercise_id: 'deadlift', target_sets: 3, target_reps: '8', rest_seconds: 120 },
        { exercise_id: 'pull_up', target_sets: 3, target_reps: '8', rest_seconds: 60 },
        { exercise_id: 'overhead_press', target_sets: 3, target_reps: '10', rest_seconds: 60 }
      ],
      'upper_lower': dayIndex % 2 === 0 ? [
        { exercise_id: 'bench_press', target_sets: 4, target_reps: '8', rest_seconds: 90 },
        { exercise_id: 'pull_up', target_sets: 4, target_reps: '8', rest_seconds: 90 },
        { exercise_id: 'overhead_press', target_sets: 3, target_reps: '10', rest_seconds: 60 },
        { exercise_id: 'barbell_row', target_sets: 4, target_reps: '10', rest_seconds: 60 }
      ] : [
        { exercise_id: 'squat', target_sets: 4, target_reps: '8', rest_seconds: 120 },
        { exercise_id: 'romanian_deadlift', target_sets: 3, target_reps: '10', rest_seconds: 90 },
        { exercise_id: 'leg_press', target_sets: 3, target_reps: '12', rest_seconds: 60 },
        { exercise_id: 'calf_raise', target_sets: 4, target_reps: '15', rest_seconds: 45 }
      ],
      'push_pull_legs': dayIndex === 0 ? [
        { exercise_id: 'bench_press', target_sets: 4, target_reps: '8', rest_seconds: 90 },
        { exercise_id: 'overhead_press', target_sets: 3, target_reps: '10', rest_seconds: 60 },
        { exercise_id: 'dip', target_sets: 3, target_reps: '10', rest_seconds: 60 },
        { exercise_id: 'lateral_raise', target_sets: 3, target_reps: '12', rest_seconds: 45 }
      ] : dayIndex === 1 ? [
        { exercise_id: 'pull_up', target_sets: 4, target_reps: '8', rest_seconds: 90 },
        { exercise_id: 'barbell_row', target_sets: 4, target_reps: '10', rest_seconds: 60 },
        { exercise_id: 'face_pull', target_sets: 3, target_reps: '15', rest_seconds: 45 },
        { exercise_id: 'bicep_curl', target_sets: 3, target_reps: '12', rest_seconds: 45 }
      ] : [
        { exercise_id: 'squat', target_sets: 4, target_reps: '8', rest_seconds: 120 },
        { exercise_id: 'leg_press', target_sets: 3, target_reps: '12', rest_seconds: 60 },
        { exercise_id: 'romanian_deadlift', target_sets: 3, target_reps: '10', rest_seconds: 90 },
        { exercise_id: 'calf_raise', target_sets: 4, target_reps: '15', rest_seconds: 45 }
      ],
      'bro_split': [
        { exercise_id: 'bench_press', target_sets: 4, target_reps: '8', rest_seconds: 90 },
        { exercise_id: 'incline_press', target_sets: 3, target_reps: '10', rest_seconds: 60 },
        { exercise_id: 'cable_fly', target_sets: 3, target_reps: '12', rest_seconds: 45 }
      ],
      'ab_legs': dayIndex % 2 === 0 ? [
        { exercise_id: 'squat', target_sets: 4, target_reps: '8', rest_seconds: 120 },
        { exercise_id: 'leg_press', target_sets: 3, target_reps: '12', rest_seconds: 60 },
        { exercise_id: 'romanian_deadlift', target_sets: 3, target_reps: '10', rest_seconds: 90 }
      ] : [
        { exercise_id: 'plank', target_sets: 3, target_reps: '60', rest_seconds: 60 },
        { exercise_id: 'crunch', target_sets: 3, target_reps: '15', rest_seconds: 45 },
        { exercise_id: 'leg_raise', target_sets: 3, target_reps: '12', rest_seconds: 45 }
      ]
    };
    
    return (defaultExercises[splitType] || []).map((ex, i) => ({
      ...ex,
      order_index: i,
      notes: ''
    }));
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

              {activeProgram?.program_id !== program.id && (
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[80]">
          <div className="surface p-6 w-full max-w-2xl max-h-[calc(100dvh-2rem)] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Create Program</h2>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setProgramForm({
                    name: '',
                    description: '',
                    difficulty: 'intermediate',
                    duration_weeks: 4,
                    category: 'strength',
                    split_type: 'full_body',
                  });
                  setSelectedSplit(null);
                }}
                className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
              >
                <X size={18} className="text-zinc-400" />
              </button>
            </div>

            <form onSubmit={handleCreateProgram} className="space-y-4">
              {/* Program Details */}
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Program Name</label>
                  <input
                    type="text"
                    value={programForm.name}
                    onChange={(e) => setProgramForm({ ...programForm, name: e.target.value })}
                    className="input-modern w-full"
                    placeholder="e.g., 12-Week Strength Program"
                    required
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Description</label>
                  <textarea
                    value={programForm.description}
                    onChange={(e) => setProgramForm({ ...programForm, description: e.target.value })}
                    className="input-modern w-full"
                    rows={2}
                    placeholder="Describe your program..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Difficulty</label>
                  <select
                    value={programForm.difficulty}
                    onChange={(e) => setProgramForm({ ...programForm, difficulty: e.target.value })}
                    className="input-modern w-full"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Duration (weeks)</label>
                  <select
                    value={programForm.duration_weeks}
                    onChange={(e) => setProgramForm({ ...programForm, duration_weeks: parseInt(e.target.value) })}
                    className="input-modern w-full"
                  >
                    <option value={4}>4 weeks</option>
                    <option value={6}>6 weeks</option>
                    <option value={8}>8 weeks</option>
                    <option value={12}>12 weeks</option>
                  </select>
                </div>
              </div>

              {/* Split Type Selection */}
              <div className="border-t border-zinc-800 pt-4">
                <h3 className="text-sm font-semibold text-zinc-300 mb-3">Choose Your Split Type</h3>
                <div className="grid grid-cols-1 gap-3">
                  {splitTypes.map((split) => {
                    const Icon = split.icon;
                    return (
                      <button
                        key={split.id}
                        type="button"
                        onClick={() => setSelectedSplit(split.id)}
                        className={`p-4 rounded-xl text-left transition-all ${
                          selectedSplit === split.id
                            ? 'bg-brand-900/30 border-2 border-brand-500/50'
                            : 'bg-zinc-800/50 border-2 border-zinc-700 hover:border-zinc-600'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg ${
                            selectedSplit === split.id ? 'bg-brand-500/20' : 'bg-zinc-700'
                          }`}>
                            <Icon size={20} className={selectedSplit === split.id ? 'text-brand-400' : 'text-zinc-400'} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h4 className="font-semibold text-zinc-200">{split.name}</h4>
                              <span className="text-xs text-zinc-500">{split.frequency}x/week</span>
                            </div>
                            <p className="text-sm text-zinc-400 mt-1">{split.description}</p>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {split.days.map((day, i) => (
                                <span key={i} className="text-xs px-2 py-0.5 bg-zinc-700 rounded-full text-zinc-300">
                                  {day}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setProgramForm({
                      name: '',
                      description: '',
                      difficulty: 'intermediate',
                      duration_weeks: 4,
                      category: 'strength',
                      split_type: 'full_body',
                    });
                    setSelectedSplit(null);
                  }}
                  className="btn-ghost flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !selectedSplit}
                  className="btn-brand flex-1 disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create Program'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
