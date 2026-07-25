import { useEffect, useState } from "react";
import { Plus, Calendar as CalendarIcon, Clock, Check, X } from "lucide-react";

export default function Schedule() {
  const [calendar, setCalendar] = useState({});
  const [upcoming, setUpcoming] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    fetchCalendar();
    fetchUpcoming();
  }, [currentMonth]);

  const fetchCalendar = async () => {
    try {
      const token = localStorage.getItem('token');
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth() + 1;
      const res = await fetch(`http://localhost:8000/schedule/calendar?year=${year}&month=${month}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setCalendar(data);
    } catch (err) {
      console.error('Failed to fetch calendar:', err);
    }
  };

  const fetchUpcoming = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:8000/schedule/workouts/upcoming', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setUpcoming(data);
    } catch (err) {
      console.error('Failed to fetch upcoming:', err);
    }
  };

  const handleComplete = async (scheduledId) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:8000/schedule/workouts/${scheduledId}/complete`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchCalendar();
      fetchUpcoming();
    } catch (err) {
      console.error('Failed to complete workout:', err);
    }
  };

  const handleSkip = async (scheduledId) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:8000/schedule/workouts/${scheduledId}/skip`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ reason: 'Skipped' })
      });
      fetchCalendar();
      fetchUpcoming();
    } catch (err) {
      console.error('Failed to skip workout:', err);
    }
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
                onClick={() => setSelectedDate(dateKey)}
                className={`aspect-square rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors ${
                  hasWorkout
                    ? isCompleted
                      ? 'bg-brand-900/30 border border-brand-500/30'
                      : 'bg-zinc-800 border border-zinc-700'
                    : 'bg-zinc-900/50'
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="surface p-6 w-full max-w-md">
            <h2 className="text-lg font-bold mb-4">Schedule Workout</h2>
            <p className="text-sm text-zinc-400 mb-4">
              Select a workout and date to schedule it.
            </p>
            <button
              onClick={() => setShowAddModal(false)}
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
