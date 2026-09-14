import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in Mjolnir app:', error, errorInfo);
  }

  private handleReset = () => {
    try {
      localStorage.removeItem('mjolnir_active_workout');
      localStorage.removeItem('mjolnir_active_tab');
    } catch (e) {}
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center p-6 text-center space-y-4">
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-full text-red-400">
            <AlertTriangle className="w-10 h-10" />
          </div>
          <h1 className="text-xl font-black text-white">Something Went Wrong</h1>
          <p className="text-xs text-zinc-400 max-w-xs leading-relaxed">
            {this.state.error?.message || 'An unexpected rendering error occurred on your device.'}
          </p>
          <button
            onClick={this.handleReset}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-lg transition"
          >
            <RotateCcw className="w-4 h-4" />
            Reset App Data & Reload
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
