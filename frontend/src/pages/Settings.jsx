import { useState, useEffect } from "react";
import { checkHealth, exportData } from "../utils/api";
import useAuthStore from "../stores/authStore";
import {
  Activity,
  Trash2,
  Download,
  Wifi,
  CheckCircle,
  XCircle,
  AlertCircle,
  LogOut,
  User,
} from "lucide-react";

export default function Settings() {
  const [cacheSize, setCacheSize] = useState("0 MB");
  const [installPrompt, setInstallPrompt] = useState(null);
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    if ("storage" in navigator && "estimate" in navigator.storage) {
      navigator.storage
        .estimate()
        .then((est) =>
          setCacheSize(`${(est.usage / 1024 / 1024).toFixed(1)} MB`),
        );
    }
    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault();
      setInstallPrompt(e);
    });
  }, []);

  const clearCache = async () => {
    if ("caches" in window) {
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => caches.delete(k)));
      setCacheSize("0 MB");
    }
  };

  const installPWA = () => installPrompt && installPrompt.prompt();

  const runDoctor = async () => {
    setLoading(true);
    try {
      setDoctor(await checkHealth());
    } catch {
      setDoctor({ error: "Backend unreachable" });
    }
    setLoading(false);
  };

  const handleExport = async () => {
    setExportLoading(true);
    try {
      const data = await exportData();
      
      // Create and download the file
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `fitstream-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed:', err);
    }
    setExportLoading(false);
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  const statusIcon = (s) => {
    if (s === "healthy")
      return <CheckCircle size={12} className="text-emerald-400" />;
    if (s === "not_installed")
      return <XCircle size={12} className="text-zinc-600" />;
    return <AlertCircle size={12} className="text-amber-400" />;
  };

  return (
    <div className="space-y-5 pb-4 animate-fade-in">
      <h1 className="page-title">Settings</h1>

      {/* User Profile */}
      <div className="surface p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 bg-gradient-to-br from-brand-500 to-brand-700 rounded-xl flex items-center justify-center">
            <User size={20} className="text-white" />
          </div>
          <div>
            <p className="font-semibold text-zinc-200">{user?.full_name || user?.username}</p>
            <p className="text-xs text-zinc-500">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="btn-ghost w-full flex items-center justify-center gap-2 text-sm py-2.5"
        >
          <LogOut size={14} /> Sign Out
        </button>
      </div>

      {/* Data Export */}
      <div className="surface p-4 space-y-4">
        <div className="flex items-center gap-2">
          <Download size={16} className="text-brand-400" />
          <span className="text-sm font-medium">Export Data</span>
        </div>
        <p className="text-xs text-zinc-500">
          Download all your fitness data including workouts, progress, and settings
        </p>
        <button
          onClick={handleExport}
          disabled={exportLoading}
          className="btn-brand w-full flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {exportLoading ? "Exporting..." : "Export All Data"}
        </button>
      </div>

      <div className="surface p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wifi size={16} className="text-brand-400" />
            <span className="text-sm font-medium">Offline Cache</span>
          </div>
          <span className="text-sm text-zinc-500 font-mono">{cacheSize}</span>
        </div>
        <button
          onClick={clearCache}
          className="btn-ghost w-full flex items-center justify-center gap-2 text-sm py-2.5"
        >
          <Trash2 size={14} /> Clear Cache
        </button>
      </div>

      {installPrompt && (
        <div className="surface p-4 space-y-3">
          <p className="text-sm text-zinc-300">
            Install FitStream as a standalone app
          </p>
          <button
            onClick={installPWA}
            className="btn-brand w-full flex items-center justify-center gap-2"
          >
            <Download size={16} /> Install App
          </button>
        </div>
      )}

      <div className="surface p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity size={16} className="text-brand-400" />
            <span className="text-sm font-medium">Agent-Reach Doctor</span>
          </div>
          <button
            onClick={runDoctor}
            disabled={loading}
            className="text-xs bg-zinc-800 hover:bg-zinc-700 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? "Checking..." : "Run Check"}
          </button>
        </div>

        {doctor &&
          !doctor.error &&
          Object.entries(doctor).map(([ch, backends]) => (
            <div key={ch}>
              <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">
                {ch}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {backends.map((b) => (
                  <span
                    key={b.backend}
                    className={`text-[10px] px-2 py-1 rounded-lg flex items-center gap-1 border ${
                      b.status === "healthy"
                        ? "bg-emerald-950/30 text-emerald-400 border-emerald-900/30"
                        : b.status === "not_installed"
                          ? "bg-zinc-900 text-zinc-600 border-zinc-800"
                          : "bg-amber-950/30 text-amber-400 border-amber-900/30"
                    }`}
                  >
                    {statusIcon(b.status)} {b.backend}
                  </span>
                ))}
              </div>
            </div>
          ))}
        {doctor?.error && (
          <p className="text-sm text-red-400">{doctor.error}</p>
        )}
      </div>

      <div className="surface p-4">
        <h3 className="font-semibold text-sm mb-2 text-zinc-300">About</h3>
        <p className="text-xs text-zinc-500 leading-relaxed">
          FitStream v2.0 — React + FastAPI + SQLite. Exercise data from
          exercises-dataset. Multi-backend scraping via Agent-Reach pattern
          (yt-dlp, twitter-cli, opencli, bili-cli, jina-reader, exa).
        </p>
      </div>
    </div>
  );
}
