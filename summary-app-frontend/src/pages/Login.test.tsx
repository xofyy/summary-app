import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Login from './Login'
import { useAuthStore } from '../store/authStore'

// Mock the auth store
vi.mock('../store/authStore', () => ({
  useAuthStore: vi.fn()
}))

// Mock react-router-dom
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

describe('Login Component', () => {
  const mockLogin = vi.fn()
  const mockClearError = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    
    // Default mock implementation
    vi.mocked(useAuthStore).mockReturnValue({
      login: mockLogin,
      isLoading: false,
      error: null,
      clearError: mockClearError,
      user: null,
      token: null,
      isAuthenticated: false,
      register: vi.fn(),
      logout: vi.fn(),
      updateInterests: vi.fn(),
    })
  })

  const renderLogin = () => {
    return render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    )
  }

  it('should render login form', () => {
    renderLogin()
    
    expect(screen.getByText('Hesabınıza giriş yapın')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('E-posta adresi')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Şifre')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Giriş Yap' })).toBeInTheDocument()
    expect(screen.getByText('Hesabınız yok mu? Kayıt olun')).toBeInTheDocument()
  })

  it('should handle form submission', async () => {
    renderLogin()
    
    const emailInput = screen.getByPlaceholderText('E-posta adresi')
    const passwordInput = screen.getByPlaceholderText('Şifre')
    const submitButton = screen.getByRole('button', { name: 'Giriş Yap' })

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.click(submitButton)

    expect(mockClearError).toHaveBeenCalled()
    expect(mockLogin).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123'
    })
  })

  it('should show loading state', () => {
    vi.mocked(useAuthStore).mockReturnValue({
      login: mockLogin,
      isLoading: true,
      error: null,
      clearError: mockClearError,
      user: null,
      token: null,
      isAuthenticated: false,
      register: vi.fn(),
      logout: vi.fn(),
      updateInterests: vi.fn(),
    })

    renderLogin()
    
    expect(screen.getByText('Giriş yapılıyor...')).toBeInTheDocument()
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('should show error message', () => {
    const errorMessage = 'Invalid credentials'
    vi.mocked(useAuthStore).mockReturnValue({
      login: mockLogin,
      isLoading: false,
      error: errorMessage,
      clearError: mockClearError,
      user: null,
      token: null,
      isAuthenticated: false,
      register: vi.fn(),
      logout: vi.fn(),
      updateInterests: vi.fn(),
    })

    renderLogin()
    
    expect(screen.getByText(errorMessage)).toBeInTheDocument()
  })

  it('should navigate after successful login', async () => {
    mockLogin.mockResolvedValue(undefined)
    
    renderLogin()
    
    const emailInput = screen.getByPlaceholderText('E-posta adresi')
    const passwordInput = screen.getByPlaceholderText('Şifre')
    const submitButton = screen.getByRole('button', { name: 'Giriş Yap' })

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/')
    })
  })

  it('should require email and password fields', () => {
    renderLogin()
    
    const emailInput = screen.getByPlaceholderText('E-posta adresi')
    const passwordInput = screen.getByPlaceholderText('Şifre')

    expect(emailInput).toBeRequired()
    expect(passwordInput).toBeRequired()
    expect(emailInput).toHaveAttribute('type', 'email')
    expect(passwordInput).toHaveAttribute('type', 'password')
  })
})