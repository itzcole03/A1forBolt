import * as Sentry from '@sentry/react';
import { Component, ErrorInfo, ReactNode } from 'react';


interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class GlobalErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ error, errorInfo });
    Sentry.captureException(error);
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-red-900/80 to-red-700/80 text-white p-6 animate-fade-in">
          <div className="glass modern-card rounded-3xl shadow-2xl p-8 max-w-xl w-full text-center">
            <h1 className="text-4xl font-extrabold text-red-200 mb-4 drop-shadow-lg">Oops! Something went wrong.</h1>
            <p className="text-lg mb-2 text-red-100">We've been notified of the issue and are working to fix it.</p>
            <p className="text-md mb-4 text-red-100">Please try refreshing the page or contact support if the problem persists.</p>
            {/* Optional: display error details in development */} 
            {import.meta.env.DEV && this.state.error && (
              <details className="mt-4 p-4 bg-red-900/60 rounded-xl shadow-inner w-full max-w-2xl text-left text-red-200">
                <summary className="font-semibold cursor-pointer">Error Details</summary>
                <pre className="mt-2 text-sm whitespace-pre-wrap break-all">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
            <button 
              onClick={() => window.location.reload()}
              className="mt-6 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-2xl font-bold text-lg shadow-lg transition-colors animate-bounce-subtle"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export { GlobalErrorBoundary }; 