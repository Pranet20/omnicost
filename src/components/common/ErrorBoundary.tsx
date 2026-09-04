/**
 * OmniCost: Enterprise AI & Cloud FinOps Command Center
 * React Error Boundary Component (Phase 3)
 * 
 * ============================================================================
 * LEARNING RESOURCES & REACT ERROR BOUNDARIES:
 * ============================================================================
 * 1. React Error Boundaries:
 *    https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary
 *    Class components that catch JavaScript errors anywhere in their child component tree,
 *    log those errors, and display a fallback UI instead of crashing the whole app.
 * ============================================================================
 */

import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertOctagon, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render shows the fallback UI
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[OmniCost ErrorBoundary] Caught UI error:', error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 m-4 bg-red-950/30 border border-red-800/50 rounded-xl flex flex-col items-center text-center space-y-4">
          <div className="p-3 bg-red-900/50 rounded-full text-red-400">
            <AlertOctagon className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">
              {this.props.fallbackTitle || 'Widget Rendering Error'}
            </h3>
            <p className="text-sm text-red-300 mt-1 max-w-md">
              {this.state.error?.message || 'An unexpected rendering error occurred in this dashboard module.'}
            </p>
          </div>
          <button
            onClick={this.handleRetry}
            className="flex items-center gap-2 px-4 py-2 bg-red-900/80 hover:bg-red-800 text-white rounded-lg text-xs font-semibold transition-all shadow-md"
          >
            <RefreshCw className="w-4 h-4" />
            Reload Module
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
