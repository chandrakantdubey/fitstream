import { useEffect, useState } from "react";
import { Plus, Calendar as CalendarIcon, Clock, Check, X, Dumbbell } from "lucide-react";
import {
  completeScheduledWorkout,
  fetchCalendar as loadCalendar,
  fetchUpcomingWorkouts,
  skipScheduledWorkout,
  scheduleWorkout,
  fetchWorkouts,
} from "../utils/api";

export default function Schedule() {
  const [calendar, setCalendar] = useState({});
  const [upcoming, setUpcoming] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [workouts, setWorkouts] = useState([]);
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCalendar();
    fetchUpcoming();
    fetchWorkoutsList();
  }, [currentMonth]);

  const fetchWorkoutsList = async () => {
    try {
      const data = await fetchWorkouts();
      setWorkouts(data);
    } catch (err) {
      console.error('Failed to fetch workouts:', err);
    }
  };

  const fetchCalendar = async () => {
    try {
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth() + 1;
      const data = await loadCalendar(year, month);
      setCalendar(data);
    } catch (err) {
      console.error('Failed to fetch calendar:', err);
    }
  };

  const fetchUpcoming = async () => {
    try {
      const data = await fetchUpcomingWorkouts();
      setUpcoming(data);
    } catch (err) {
      console.error('Failed to fetch upcoming:', err);
    }
  };

  const handleComplete = async (scheduledId) => {
    try {
      await completeScheduledWorkout(scheduledId);
      fetchCalendar();
      fetchUpcoming();
    } catch (err) {
      console.error('Failed to complete workout:', err);
    }
  };

  const handleSkip = async (scheduledId) => {
    try {
      await skipScheduledWorkout(scheduledId);
      fetchCalendar();
      fetchUpcoming();
    } catch (err) {
      console.error('Failed to skip workout:', err);
    }
  };

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedWorkout || !scheduleDate) return;
    
    setLoading(true);
    try {
      await scheduleWorkout({
        workout_id: selectedWorkout,
        scheduled_date: new Date(scheduleDate).toISOString(),
        scheduled_time: scheduleTime || null,
        reminder_minutes_before: 30,
      });
      setShowAddModal(false);
      setSelectedWorkout(null);
      setScheduleDate('');
      setScheduleTime('');
      fetchCalendar();
      fetchUpcoming();
    } catch (err) {
      console.error('Failed to schedule workout:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDateClick = (dateKey) => {
    setSelectedDate(dateKey);
    setScheduleDate(dateKey);
    setShowAddModal(true);
  };

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const daysInMonth = getDaysInMonth(currentMonth);
  const firstDay = getFirstDayOfMonth(currentMonth);
  const monthName = currentMonth.toLocaleDateString('en', { month: 'long', year: 'numeric' });

  return (
    <div className="space-y-6 pb-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Schedule</h1>
          <p className="page-subtitle">Plan your workouts</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-brand p-2 rounded-xl"
        >
          <Plus size={20} />
        </button>
      </div>

      {/* Month Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
          className="btn-ghost px-3"
        >
          Previous
        </button>
        <h2 className="text-lg font-semibold">{monthName}</h2>
        <button
          onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
          className="btn-ghost px-3"
        >
          Next
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="surface p-4">
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="text-center text-xs font-medium text-zinc-500 py-2">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square" />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dateKey = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayWorkouts = calendar[dateKey] || [];
            const hasWorkout = dayWorkouts.length > 0;
            const isCompleted = dayWorkouts.every(w => w.is_completed);
            
            return (
              <div
                key={day}
                onClick={() => handleDateClick(dateKey)}
                className={`aspect-square rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors ${
                  hasWorkout
                    ? isCompleted
                      ? 'bg-brand-900/30 border border-brand-500/30'
                      : 'bg-zinc-800 border border-zinc-700'
                    : 'bg-zinc-900/50 hover:bg-zinc-800/50'
                }`}
              >
                <span className={`text-sm ${hasWorkout ? 'text-zinc-200' : 'text-zinc-600'}`}>
                  {day}
                </span>
                {hasWorkout && (
                  <div className="flex gap-0.5 mt-1">
                    {dayWorkouts.slice(0, 3).map((_, j) => (
                      <div
                        key={j}
                        className={`w-1 h-1 rounded-full ${
                          isCompleted ? 'bg-brand-500' : 'bg-zinc-500'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Date Details */}
      {selectedDate && calendar[selectedDate] && (
        <div className="surface p-4">
          <h3 className="text-sm font-semibold text-zinc-300 mb-3">
            {new Date(selectedDate).toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric' })}
          </h3>
          <div className="space-y-2">
            {calendar[selectedDate].map((scheduled) => (
              <div key={scheduled.id} className="p-3 bg-zinc-800/50 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <CalendarIcon size={14} className="text-zinc-500" />
                    <span className="text-sm font-medium text-zinc-200">
                      {scheduled.workout?.name || 'Workout'}
                    </span>
                  </div>
                  {scheduled.scheduled_time && (
                    <div className="flex items-center gap-1 text-xs text-zinc-500">
                      <Clock size={12} />
                      {scheduled.scheduled_time}
                    </div>
                  )}
                </div>
                {!scheduled.is_completed && !scheduled.is_skipped && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleComplete(scheduled.id)}
                      className="btn-brand flex-1 py-1 text-xs flex items-center justify-center gap-1"
                    >
                      <Check size={12} /> Complete
                    </button>
                    <button
                      onClick={() => handleSkip(scheduled.id)}
                      className="btn-ghost flex-1 py-1 text-xs flex items-center justify-center gap-1"
                    >
                      <X size={12} /> Skip
                    </button>
                  </div>
                )}
                {scheduled.is_completed && (
                  <span className="text-xs text-brand-400">Completed</span>
                )}
                {scheduled.is_skipped && (
                  <span className="text-xs text-zinc-500">Skipped</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Workouts */}
      <div>
        <h3 className="text-sm font-semibold text-zinc-300 mb-3">Upcoming Workouts</h3>
        <div className="space-y-2">
          {upcoming.slice(0, 5).map((scheduled) => (
            <div key={scheduled.id} className="surface p-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-200">
                  {scheduled.workout?.name || 'Workout'}
                </p>
                <p className="text-xs text-zinc-500">
                  {new Date(scheduled.scheduled_date).toLocaleDateString()}
                  {scheduled.scheduled_time && ` at ${scheduled.scheduled_time}`}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleComplete(scheduled.id)}
                  className="p-2 bg-brand-900/30 rounded-lg hover:bg-brand-900/50 transition-colors"
                >
                  <Check size={14} className="text-brand-400" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Schedule Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[80]">
          <div className="surface p-6 w-full max-w-md max-h-[calc(100dvh-2rem)] overflow-y-auto">
            <h2 className="text-lg font-bold mb-4">Schedule Workout</h2>
            <form onSubmit={handleScheduleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Select Workout</label>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {workouts.map((workout) => (
                    <button
                      key={workout.id}
                      type="button"
                      onClick={() => setSelectedWorkout(workout.id)}
                      className={`w-full p-3 rounded-xl text-left transition-colors ${
                        selectedWorkout === workout.id
                          ? 'bg-brand-900/30 border border-brand-500/30'
                          : 'bg-zinc-800/50 border border-zinc-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Dumbbell size={14} className="text-zinc-500" />
                        <span className="text-sm font-medium text-zinc-200">{workout.name}</span>
                      </div>
                      <p className="text-xs text-zinc-500 mt-1">{workout.exercises?.length || 0} exercises</p>
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Date</label>
                <input
                  type="date"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  className="input-modern w-full"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Time (optional)</label>
                <input
                  type="time"
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                  className="input-modern w-full"
                />
              </div>
              
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setSelectedWorkout(null);
                    setScheduleDate('');
                    setScheduleTime('');
                  }}
                  className="btn-ghost flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !selectedWorkout || !scheduleDate}
                  className="btn-brand flex-1 disabled:opacity-50"
                >
                  {loading ? 'Scheduling...' : 'Schedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
