import { useEffect, useState } from "react";
import { Plus, Target, Trophy, TrendingUp, Calendar } from "lucide-react";

export default function Goals() {
  const [goals, setGoals] = useState([]);
  const [records, setRecords] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    goal_type: 'strength',
    target_value: '',
    current_value: '',
    unit: 'kg',
    description: ''
  });

  useEffect(() => {
    fetchGoals();
    fetchRecords();
  }, []);

  const fetchGoals = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:8000/goals/active', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setGoals(data);
    } catch (err) {
      console.error('Failed to fetch goals:', err);
    }
  };

  const fetchRecords = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:8000/goals/records', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setRecords(data);
    } catch (err) {
      console.error('Failed to fetch records:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await fetch('http://localhost:8000/goals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          target_value: formData.target_value ? parseFloat(formData.target_value) : null,
          current_value: formData.current_value ? parseFloat(formData.current_value) : null
        })
      });
      setShowAddModal(false);
      setFormData({
        title: '',
        goal_type: 'strength',
        target_value: '',
        current_value: '',
        unit: 'kg',
        description: ''
      });
      fetchGoals();
    } catch (err) {
      console.error('Failed to add goal:', err);
    }
  };

  const updateProgress = async (goalId, newValue) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:8000/goals/${goalId}/progress?current_value=${newValue}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchGoals();
    } catch (err) {
      console.error('Failed to update progress:', err);
    }
  };

  return (
    <div className="space-y-6 pb-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Goals</h1>
          <p className="page-subtitle">Track your fitness targets</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-brand p-2 rounded-xl"
        >
          <Plus size={20} />
        </button>
      </div>

      {/* Active Goals */}
      <div>
        <h3 className="text-sm font-semibold text-zinc-300 mb-3">Active Goals</h3>
        <div className="space-y-3">
          {goals.map((goal) => (
            <div key={goal.id} className="surface p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-brand-900/30 rounded-lg">
                    <Target size={16} className="text-brand-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-zinc-200">{goal.title}</h4>
                    <p className="text-xs text-zinc-500">{goal.goal_type}</p>
                  </div>
                </div>
                <span className="text-sm font-bold text-brand-400">
                  {goal.progress_percentage}%
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2 bg-zinc-800 rounded-full mb-3">
                <div
                  className="h-full bg-gradient-to-r from-brand-500 to-brand-400 rounded-full transition-all"
                  style={{ width: `${goal.progress_percentage}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-sm">
                <div>
                  <span className="text-zinc-400">Current: </span>
                  <span className="text-zinc-200 font-medium">{goal.current_value} {goal.unit}</span>
                </div>
                <div>
                  <span className="text-zinc-400">Target: </span>
                  <span className="text-zinc-200 font-medium">{goal.target_value} {goal.unit}</span>
                </div>
              </div>

              {goal.target_date && (
                <div className="flex items-center gap-2 mt-3 text-xs text-zinc-500">
                  <Calendar size={12} />
                  <span>Target: {new Date(goal.target_date).toLocaleDateString()}</span>
                </div>
              )}

              {/* Quick Update */}
              <div className="flex gap-2 mt-3">
                <input
                  type="number"
                  placeholder="New value"
                  className="input-modern flex-1 text-sm"
                  onBlur={(e) => e.target.value && updateProgress(goal.id, parseFloat(e.target.value))}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Personal Records */}
      <div>
        <h3 className="text-sm font-semibold text-zinc-300 mb-3">Personal Records</h3>
        <div className="space-y-2">
          {records.slice(0, 5).map((record) => (
            <div key={record.id} className="surface p-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-900/30 rounded-lg">
                  <Trophy size={16} className="text-amber-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-zinc-200">{record.exercise?.name}</p>
                  <p className="text-xs text-zinc-500">{record.record_type}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-amber-400">
                  {record.value} {record.unit}
                </p>
                {record.reps && (
                  <p className="text-xs text-zinc-500">{record.reps} reps</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Goal Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="surface p-6 w-full max-w-md">
            <h2 className="text-lg font-bold mb-4">Add Goal</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="input-modern w-full"
                  placeholder="Bench Press 100kg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Goal Type</label>
                <select
                  value={formData.goal_type}
                  onChange={(e) => setFormData({ ...formData, goal_type: e.target.value })}
                  className="input-modern w-full"
                >
                  <option value="strength">Strength</option>
                  <option value="weight_loss">Weight Loss</option>
                  <option value="weight_gain">Weight Gain</option>
                  <option value="endurance">Endurance</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Target</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.target_value}
                    onChange={(e) => setFormData({ ...formData, target_value: e.target.value })}
                    className="input-modern w-full"
                    placeholder="100"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Current</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.current_value}
                    onChange={(e) => setFormData({ ...formData, current_value: e.target.value })}
                    className="input-modern w-full"
                    placeholder="80"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Unit</label>
                <select
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  className="input-modern w-full"
                >
                  <option value="kg">kg</option>
                  <option value="lbs">lbs</option>
                  <option value="reps">reps</option>
                  <option value="minutes">minutes</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input-modern w-full"
                  rows={2}
                  placeholder="Describe your goal..."
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn-ghost flex-1"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-brand flex-1">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
