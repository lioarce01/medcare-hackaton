import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import Login from '../../pages/Login'

// Mock the useNavigate hook
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

// Mock Supabase client
const mockSupabase = {
  auth: {
    signInWithPassword: vi.fn(),
  },
}

vi.mock('@supabase/supabase-js', () => ({
  createClient: () => mockSupabase,
}))

describe('Login Component', () => {
  const renderLogin = () => {
    return render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    )
  }

  it('renders login form', () => {
    renderLogin()
    
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  it('shows validation errors for empty fields', async () => {
    renderLogin()
    
    const signInButton = screen.getByRole('button', { name: /sign in/i })
    fireEvent.click(signInButton)

    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument()
      expect(screen.getByText(/password is required/i)).toBeInTheDocument()
    })
  })

  it('handles successful login', async () => {
    mockSupabase.auth.signInWithPassword.mockResolvedValueOnce({
      data: { user: { id: '123' } },
      error: null,
    })

    renderLogin()
    
    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const signInButton = screen.getByRole('button', { name: /sign in/i })

    await userEvent.type(emailInput, 'test@example.com')
    await userEvent.type(passwordInput, 'password123')
    fireEvent.click(signInButton)

    await waitFor(() => {
      expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      })
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard')
    })
  })

  it('handles login error', async () => {
    mockSupabase.auth.signInWithPassword.mockResolvedValueOnce({
      data: { user: null },
      error: { message: 'Invalid login credentials' },
    })

    renderLogin()
    
    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const signInButton = screen.getByRole('button', { name: /sign in/i })

    await userEvent.type(emailInput, 'test@example.com')
    await userEvent.type(passwordInput, 'wrongpassword')
    fireEvent.click(signInButton)

    await waitFor(() => {
      expect(screen.getByText(/invalid login credentials/i)).toBeInTheDocument()
    })
  })
}) 