import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an uncaught error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    } else {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      return this.props.fallback ? (
        this.props.fallback
      ) : (
        <div className="bg-white rounded-card shadow-subtle border border-red-100 p-8 text-center max-w-md mx-auto my-8 space-y-4">
          <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto text-red-500">
            <AlertTriangle size={24} />
          </div>
          <h3 className="font-heading font-extrabold text-lg text-dark">
            Something went wrong
          </h3>
          <p className="text-xs text-mid leading-relaxed">
            {this.state.error?.message || 'An unexpected runtime error occurred.'}
          </p>
          <div className="pt-2">
            <button
              onClick={this.handleReset}
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-bold px-4 py-2 rounded-btn text-xs shadow-sm transition-all"
            >
              <RotateCcw size={14} />
              <span>Retry / Reload Page</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
