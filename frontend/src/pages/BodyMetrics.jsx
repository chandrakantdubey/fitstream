import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Plus, TrendingUp, Calendar, Scale } from "lucide-react";
import {
  createBodyMetric,
  fetchBodyMetrics,
  fetchWeightSummary as loadWeightSummary,
} from "../utils/api";

export default function BodyMetrics() {
  const [metrics, setMetrics] = useState([]);
  const [weightSummary, setWeightSummary] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    weight_kg: '',
    chest_cm: '',
    waist_cm: '',
    hips_cm: '',
    notes: ''
  });

  useEffect(() => {
    fetchMetrics();
    fetchWeightSummary();
  }, []);

  const fetchMetrics = async () => {
    try {
      const data = await fetchBodyMetrics();
      setMetrics(data);
    } catch (err) {
      console.error('Failed to fetch metrics:', err);
    }
  };

  const fetchWeightSummary = async () => {
    try {
      const data = await loadWeightSummary();
      setWeightSummary(data);
    } catch (err) {
      console.error('Failed to fetch weight summary:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createBodyMetric({
        ...formData,
        weight_kg: formData.weight_kg ? parseFloat(formData.weight_kg) : null,
        chest_cm: formData.chest_cm ? parseFloat(formData.chest_cm) : null,
        waist_cm: formData.waist_cm ? parseFloat(formData.waist_cm) : null,
        hips_cm: formData.hips_cm ? parseFloat(formData.hips_cm) : null,
        date: new Date(formData.date).toISOString(),
      });
      setShowAddModal(false);
      setFormData({
        date: new Date().toISOString().split('T')[0],
        weight_kg: '',
        chest_cm: '',
        waist_cm: '',
        hips_cm: '',
        notes: ''
      });
      fetchMetrics();
      fetchWeightSummary();
    } catch (err) {
      console.error('Failed to add metric:', err);
    }
  };

  const weightData = weightSummary?.trend?.map(t => ({
    date: new Date(t.date).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
    weight: t.weight
  })) || [];

  return (
    <div className="space-y-6 pb-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Body Metrics</h1>
          <p className="page-subtitle">Track your physical progress</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-brand p-2 rounded-xl"
        >
          <Plus size={20} />
        </button>
      </div>

      {/* Weight Summary */}
      {weightSummary && weightSummary.current && (
        <div className="grid grid-cols-2 gap-3">
          <div className="stat-card">
            <div className="flex items-center gap-2 mb-2">
              <Scale size={14} className="text-brand-400" />
              <span className="text-xs text-zinc-500 font-medium">Current</span>
            </div>
            <p className="text-2xl font-bold text-white">
              {weightSummary.current} kg
            </p>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={14} className="text-purple-400" />
              <span className="text-xs text-zinc-500 font-medium">Change</span>
            </div>
            <p className="text-2xl font-bold text-white">
              {weightSummary.change > 0 ? '+' : ''}{weightSummary.change} kg
            </p>
          </div>
        </div>
      )}

      {/* Weight Chart */}
      {weightData.length > 0 && (
        <div className="surface p-4">
          <h3 className="text-sm font-semibold text-zinc-300 mb-4">Weight Trend</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={weightData}>
              <XAxis
                dataKey="date"
                tick={{ fill: "#71717a", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "#71717a", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#18181b",
                  border: "1px solid #27272a",
                  borderRadius: "12px",
                  color: "#fff",
                }}
              />
              <Line
                type="monotone"
                dataKey="weight"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ fill: "#10b981" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Recent Metrics */}
      <div>
        <h3 className="text-sm font-semibold text-zinc-300 mb-3">Recent Entries</h3>
        <div className="space-y-2">
          {metrics.slice(0, 5).map((metric) => (
            <div key={metric.id} className="surface p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="text-zinc-500" />
                  <span className="text-sm text-zinc-300">
                    {new Date(metric.date).toLocaleDateString()}
                  </span>
                </div>
                {metric.weight_kg && (
                  <span className="text-sm font-semibold text-brand-400">
                    {metric.weight_kg} kg
                  </span>
                )}
              </div>
              {(metric.chest_cm || metric.waist_cm || metric.hips_cm) && (
                <div className="flex gap-3 text-xs text-zinc- mt-1">
                  {metric.chest_cm && <span>Chest: {metric.chest_cm}cm</span>}
                  {metric.waist_cm && <span>Waist: {metric.waist_cm}cm</span>}
                  {metric.hips_cm && <span>Hips: {metric.hips_cm}cm</span>}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[80]">
          <div className="surface p-6 w-full max-w-md max-h-[calc(100dvh-2rem)] overflow-y-auto">
            <h2 className="text-lg font-bold mb-4">Add Body Metric</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="input-modern w-full"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Weight (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.weight_kg}
                  onChange={(e) => setFormData({ ...formData, weight_kg: e.target.value })}
                  className="input-modern w-full"
                  placeholder="70.5"
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Chest (cm)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.chest_cm}
                    onChange={(e) => setFormData({ ...formData, chest_cm: e.target.value })}
                    className="input-modern w-full"
                    placeholder="100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Waist (cm)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.waist_cm}
                    onChange={(e) => setFormData({ ...formData, waist_cm: e.target.value })}
                    className="input-modern w-full"
                    placeholder="80"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Hips (cm)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.hips_cm}
                    onChange={(e) => setFormData({ ...formData, hips_cm: e.target.value })}
                    className="input-modern w-full"
                    placeholder="95"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="input-modern w-full"
                  rows={2}
                  placeholder="Any notes..."
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
