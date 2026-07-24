import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { LoginPage } from '../LoginPage'
import { AuthProvider } from '../../../context/AuthContext'
import { ToastProvider } from '../../../context/ToastContext'
import { queryClient } from '../../../lib/query-client'
import { authApi } from '../../../api/auth'

vi.mock('../../../api/auth', () => ({
  authApi: {
    login: vi.fn(),
    logout: vi.fn(),
    refresh: vi.fn(),
  },
}))

// Provider order mirrors main.tsx exactly (QueryClientProvider > ToastProvider
// > AuthProvider > App): AuthProvider calls useToast() to surface a "session
// expired" notice, so it must be rendered under a real ToastProvider here too.
function renderLoginPage() {
  return render(
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <MemoryRouter initialEntries={['/login']}>
          <AuthProvider>
            <LoginPage />
          </AuthProvider>
        </MemoryRouter>
      </ToastProvider>
    </QueryClientProvider>,
  )
}

describe('LoginPage', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.mocked(authApi.refresh).mockRejectedValue(new Error('no session'))
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('renders email and password fields and a submit button', async () => {
    renderLoginPage()
    await waitFor(() => expect(screen.getByLabelText(/^Email/)).toBeInTheDocument())
    expect(screen.getByLabelText(/^Password/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeInTheDocument()
  })

  it('calls authApi.login with the entered credentials on submit', async () => {
    const user = userEvent.setup()
    vi.mocked(authApi.login).mockResolvedValue({
      access_token: 'access-1',
      refresh_token: 'refresh-1',
      admin: { id: '1', email: 'owner@elato.in', role: 'owner', name: 'Owner' },
    } as never)

    renderLoginPage()
    await waitFor(() => screen.getByLabelText(/^Email/))

    await user.type(screen.getByLabelText(/^Email/), 'owner@elato.in')
    await user.type(screen.getByLabelText(/^Password/), 'correct-horse-battery-staple')
    await user.click(screen.getByRole('button', { name: 'Sign in' }))

    await waitFor(() => {
      expect(authApi.login).toHaveBeenCalledWith({
        email: 'owner@elato.in',
        password: 'correct-horse-battery-staple',
      })
    })
  })

  it('shows an inline error message when login fails', async () => {
    const user = userEvent.setup()
    vi.mocked(authApi.login).mockRejectedValue(new Error('Invalid email or password.'))

    renderLoginPage()
    await waitFor(() => screen.getByLabelText(/^Email/))

    await user.type(screen.getByLabelText(/^Email/), 'owner@elato.in')
    await user.type(screen.getByLabelText(/^Password/), 'wrong-password')
    await user.click(screen.getByRole('button', { name: 'Sign in' }))

    await waitFor(() => {
      expect(screen.getByText('Invalid email or password.')).toBeInTheDocument()
    })
    // Still on the login form — a failed login must not navigate away.
    expect(screen.getByLabelText(/^Email/)).toBeInTheDocument()
  })

  it('requires both fields before the browser allows submission', async () => {
    renderLoginPage()
    await waitFor(() => screen.getByLabelText(/^Email/))
    expect(screen.getByLabelText(/^Email/)).toBeRequired()
    expect(screen.getByLabelText(/^Password/)).toBeRequired()
  })
})
