import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallbackMessage?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[LiteNote] React Error Boundary caught:", error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center text-white/80">
          <p className="text-sm">
            {this.props.fallbackMessage ?? "Something went wrong."}
          </p>
          <button
            type="button"
            className="rounded-lg bg-white/20 px-3 py-1.5 text-sm text-white transition hover:bg-white/30"
            onClick={this.handleReset}
          >
            Retry
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
