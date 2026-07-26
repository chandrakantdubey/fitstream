import React from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught frontend error caught by ErrorBoundary:", error, errorInfo);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[70vh] flex items-center justify-center p-4">
          <div className="surface p-8 max-w-md w-full border border-red-500/50 text-center space-y-4 bg-gradient-to-b from-zinc-900 via-zinc-900 to-red-950/20">
            <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 mx-auto">
              <AlertTriangle size={32} />
            </div>

            <div className="space-y-1">
              <h2 className="text-xl font-extrabold text-white">Something Went Wrong</h2>
              <p className="text-xs text-zinc-400 leading-relaxed">
                An unexpected frontend application error occurred. You can safely reload the application to continue.
              </p>
            </div>

            {this.state.error && (
              <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl text-[11px] text-red-300 font-mono text-left max-h-24 overflow-y-auto">
                {this.state.error.toString()}
              </div>
            )}

            <button
              onClick={this.handleReload}
              className="btn-brand w-full py-3 text-xs font-bold flex items-center justify-center gap-2"
            >
              <RotateCcw size={16} /> Reload FitStream Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
