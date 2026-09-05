import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("FleetManager UI Error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#050B14] flex items-center justify-center p-6">
          <div className="glass-panel p-8 max-w-md w-full text-center space-y-4 border border-rose-500/30 shadow-2xl">
            <div className="w-12 h-12 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/30">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-extrabold text-white">Something went wrong</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              An unexpected display issue occurred in the interface. Your fleet data remains safe and saved.
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="btn-primary text-xs py-2 px-4 inline-flex items-center gap-2 mx-auto"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
