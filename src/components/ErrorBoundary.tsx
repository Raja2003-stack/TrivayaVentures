import { Component, ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string | null;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  public state: ErrorBoundaryState = {
    hasError: false,
    errorMessage: null,
  };

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      errorMessage: error.message || 'An unexpected error occurred.',
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Application error caught by ErrorBoundary:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#F5F7FA] px-5">
          <div className="max-w-md w-full rounded-xl border border-[#0B2545]/15 bg-white p-8 text-center shadow-sm">
            <h1 className="font-serif text-2xl font-semibold text-[#0B2545]">
              Something went wrong
            </h1>
            <p className="mt-3 text-sm text-[#1F2937]/80">
              Please reload the page to try again.
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-6 inline-flex min-h-[42px] items-center justify-center rounded-md bg-[#0B2545] px-6 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#C9A227] hover:text-[#0B2545] cursor-pointer"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
