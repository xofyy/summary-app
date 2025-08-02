import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Header from './Header'
import { useAuthStore } from '../store/authStore'

// Mock the auth store
vi.mock('../store/authStore', () => ({
  useAuthStore: vi.fn()
}))

describe('Header Component', () => {
  const mockLogout = vi.fn()

  const renderHeader = () => {
    return render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    )
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render app title', () => {
    vi.mocked(useAuthStore).mockReturnValue({
      user: null,
      isAuthenticated: false,
      logout: mockLogout,
      login: vi.fn(),
      register: vi.fn(),
      updateInterests: vi.fn(),
      isLoading: false,
      error: null,
      token: null,
      clearError: vi.fn(),
    })

    renderHeader()
    
    expect(screen.getByText('Summary App')).toBeInTheDocument()
    expect(screen.getByText('Summary App')).toHaveAttribute('href', '/')
  })

  it('should show login and register links when not authenticated', () => {
    vi.mocked(useAuthStore).mockReturnValue({
      user: null,
      isAuthenticated: false,
      logout: mockLogout,
      login: vi.fn(),
      register: vi.fn(),
      updateInterests: vi.fn(),
      isLoading: false,
      error: null,
      token: null,
      clearError: vi.fn(),
    })

    renderHeader()
    
    expect(screen.getByText('Giriş Yap')).toBeInTheDocument()
    expect(screen.getByText('Kayıt Ol')).toBeInTheDocument()
    expect(screen.getByText('Giriş Yap')).toHaveAttribute('href', '/login')
    expect(screen.getByText('Kayıt Ol')).toHaveAttribute('href', '/register')
  })

  it('should show navigation and user info when authenticated', () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      interests: ['teknoloji']
    }

    vi.mocked(useAuthStore).mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      logout: mockLogout,
      login: vi.fn(),
      register: vi.fn(),
      updateInterests: vi.fn(),
      isLoading: false,
      error: null,
      token: 'token',
      clearError: vi.fn(),
    })

    renderHeader()
    
    expect(screen.getByText('Ana Sayfa')).toBeInTheDocument()
    expect(screen.getByText('İlgi Alanları')).toBeInTheDocument()
    expect(screen.getByText('test@example.com')).toBeInTheDocument()
    expect(screen.getByText('Çıkış')).toBeInTheDocument()
    
    expect(screen.getByText('Ana Sayfa')).toHaveAttribute('href', '/')
    expect(screen.getByText('İlgi Alanları')).toHaveAttribute('href', '/interests')

    // Should not show login/register links
    expect(screen.queryByText('Giriş Yap')).not.toBeInTheDocument()
    expect(screen.queryByText('Kayıt Ol')).not.toBeInTheDocument()
  })

  it('should handle logout', () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      interests: ['teknoloji']
    }

    vi.mocked(useAuthStore).mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      logout: mockLogout,
      login: vi.fn(),
      register: vi.fn(),
      updateInterests: vi.fn(),
      isLoading: false,
      error: null,
      token: 'token',
      clearError: vi.fn(),
    })

    renderHeader()
    
    const logoutButton = screen.getByText('Çıkış')
    fireEvent.click(logoutButton)
    
    expect(mockLogout).toHaveBeenCalled()
  })

  it('should have correct CSS classes for styling', () => {
    vi.mocked(useAuthStore).mockReturnValue({
      user: null,
      isAuthenticated: false,
      logout: mockLogout,
      login: vi.fn(),
      register: vi.fn(),
      updateInterests: vi.fn(),
      isLoading: false,
      error: null,
      token: null,
      clearError: vi.fn(),
    })

    renderHeader()
    
    const header = screen.getByRole('banner')
    expect(header).toHaveClass('bg-white', 'shadow-sm', 'border-b')
  })
})