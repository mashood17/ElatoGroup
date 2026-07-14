import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { QueryClientProvider } from '@tanstack/react-query'
import App from '../App'
import { queryClient } from '../lib/query-client'
import { AuthProvider } from '../context/AuthContext'
import { ToastProvider } from '../context/ToastContext'

// Smoke test: the app must render without crashing. There's no seeded
// session in a fresh test environment (jsdom's localStorage starts empty),
// so an unauthenticated visit to "/" should redirect through ProtectedRoute
// to the login screen rather than throwing — this exercises the full
// provider tree (QueryClient, Toast, Auth, Router) the way main.tsx wires
// it up for real.
function renderApp() {
  return render(
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </ToastProvider>
    </QueryClientProvider>,
  )
}

describe('App', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('renders without crashing and redirects an unauthenticated visitor to the login screen', async () => {
    renderApp()

    await waitFor(() => {
      expect(screen.getByText('Sign in to the admin panel')).toBeInTheDocument()
    })
    // Regex, not an exact string: the label renders a trailing "*" required
    // marker as a child span, so the label's full text content is "Email*".
    expect(screen.getByLabelText(/^Email/)).toBeInTheDocument()
    expect(screen.getByLabelText(/^Password/)).toBeInTheDocument()
  })
})
