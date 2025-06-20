import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
          <div className="modern-card max-w-lg w-full p-6 text-center">
            <div className="text-6xl mb-4">😢</div>
            <h1 className="text-2xl font-bold mb-4">Oops! Something went wrong</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              We're sorry for the inconvenience. Please try refreshing the page or contact support
              if the problem persists.
            </p>
            <div className="space-x-4">
              <button className="modern-button" onClick={() => window.location.reload()}>
                Refresh Page
              </button>
              <button
                className="modern-button bg-gray-500 hover:bg-gray-600"
                onClick={() => this.setState({ hasError: false })}
              >
                Try Again
              </button>
            </div>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mt-8 text-left">
                <details className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                  <summary className="text-red-600 dark:text-red-400 font-medium cursor-pointer">
                    Error Details
                  </summary>
                  <pre className="mt-4 text-sm text-red-800 dark:text-red-200 overflow-auto">
                    {this.state.error.toString()}
                    {this.state.errorInfo?.componentStack}
                  </pre>
                </details>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
