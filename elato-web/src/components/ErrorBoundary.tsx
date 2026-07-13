import { Component, type ErrorInfo, type ReactNode } from 'react'
import { Button } from './ui/Button'

type Props = { children: ReactNode }
type State = { hasError: boolean }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // No Sentry/monitoring wired up yet (Phase 10) — log so it's at least visible in dev/server logs.
    console.error('ELATŌ — unhandled UI error:', error, info.componentStack)
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-surface-base px-6 text-center">
        <h1 className="text-h1 text-secondary-900">Something went wrong</h1>
        <p className="text-body-lg max-w-md text-neutral-warm-500">
          We hit an unexpected error. Reloading usually fixes it — if it keeps happening, please reach out to us directly.
        </p>
        <Button variant="primary" onClick={() => window.location.assign('/')}>
          Reload Home
        </Button>
      </main>
    )
  }
}
