import { Component, type ErrorInfo, type ReactNode } from "react";
import { Button } from "./ui";

type Props = { children: ReactNode };
type State = { hasError: boolean };

/** Last-resort catch for an uncaught render error — without this, a bug in
 * any page renders a blank white screen instead of a recoverable message. */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("ELATŌ admin — unhandled UI error:", error, info.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-neutral-50 px-6 text-center">
        <p className="text-sm font-medium text-neutral-800">Something went wrong.</p>
        <p className="max-w-sm text-xs text-neutral-500">
          The admin panel hit an unexpected error. Reloading usually fixes it.
        </p>
        <Button variant="primary" size="sm" onClick={() => window.location.assign("/")}>
          Reload
        </Button>
      </div>
    );
  }
}
