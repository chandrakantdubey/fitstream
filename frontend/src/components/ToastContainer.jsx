import { useToastStore } from "../stores/toastStore";
import { CheckCircle, AlertCircle, Info, X } from "lucide-react";

const icons = { success: CheckCircle, error: AlertCircle, info: Info };
const colors = {
  success: "text-brand-400 border-brand-800/40 bg-brand-950/80",
  error: "text-red-400 border-red-800/40 bg-red-950/80",
  info: "text-blue-400 border-blue-800/40 bg-blue-950/80",
};

export default function ToastContainer() {
  const { toasts } = useToastStore();
  if (!toasts.length) return null;
  return (
    <div className="fixed top-4 left-4 right-4 z-[60] flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => {
        const Icon = icons[t.type] || Info;
        return (
          <div
            key={t.id}
            className={`pointer-events-auto mx-auto max-w-sm w-full px-4 py-3 rounded-xl border backdrop-blur-sm shadow-xl flex items-center gap-3 animate-slide-up ${colors[t.type] || colors.info}`}
          >
            <Icon size={18} />
            <span className="text-sm font-medium flex-1">{t.msg}</span>
          </div>
        );
      })}
    </div>
  );
}
