import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useAuthStore } from './authStore'

// Mock axios
vi.mock('../utils/api', () => ({
  authAPI: {
    login: vi.fn(),
    register: vi.fn(),
    updateInterests: vi.fn(),
  },
}))

describe('Auth Store', () => {
  beforeEach(() => {
    // Reset store state before each test
    useAuthStore.setState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    })
  })

  it('should have initial state', () => {
    const state = useAuthStore.getState()
    expect(state.user).toBeNull()
    expect(state.token).toBeNull()
    expect(state.isAuthenticated).toBe(false)
    expect(state.isLoading).toBe(false)
    expect(state.error).toBeNull()
  })

  it('should clear error', () => {
    useAuthStore.setState({ error: 'Some error' })
    
    const { clearError } = useAuthStore.getState()
    clearError()
    
    expect(useAuthStore.getState().error).toBeNull()
  })

  it('should logout user', () => {
    // Set authenticated state
    useAuthStore.setState({
      user: { id: '1', email: 'test@example.com', interests: [] },
      token: 'token',
      isAuthenticated: true,
    })

    const { logout } = useAuthStore.getState()
    logout()

    const state = useAuthStore.getState()
    expect(state.user).toBeNull()
    expect(state.token).toBeNull()
    expect(state.isAuthenticated).toBe(false)
    expect(state.error).toBeNull()
  })

  it('should handle login success', async () => {
    const mockResponse = {
      user: { id: '1', email: 'test@example.com', interests: [] },
      access_token: 'mock-token',
    }

    const { authAPI } = await import('../utils/api')
    vi.mocked(authAPI.login).mockResolvedValue(mockResponse)

    const { login } = useAuthStore.getState()
    await login({ email: 'test@example.com', password: 'password' })

    const state = useAuthStore.getState()
    expect(state.user).toEqual(mockResponse.user)
    expect(state.token).toBe(mockResponse.access_token)
    expect(state.isAuthenticated).toBe(true)
    expect(state.isLoading).toBe(false)
    expect(state.error).toBeNull()
  })

  it('should handle login error', async () => {
    const mockError = {
      response: { data: { message: 'Invalid credentials' } }
    }

    const { authAPI } = await import('../utils/api')
    vi.mocked(authAPI.login).mockRejectedValue(mockError)

    const { login } = useAuthStore.getState()
    await login({ email: 'test@example.com', password: 'wrong' })

    const state = useAuthStore.getState()
    expect(state.user).toBeNull()
    expect(state.token).toBeNull()
    expect(state.isAuthenticated).toBe(false)
    expect(state.isLoading).toBe(false)
    expect(state.error).toBe('Invalid credentials')
  })

  it('should handle register success', async () => {
    const mockResponse = {
      user: { id: '1', email: 'test@example.com', interests: ['tech'] },
      access_token: 'mock-token',
    }

    const { authAPI } = await import('../utils/api')
    vi.mocked(authAPI.register).mockResolvedValue(mockResponse)

    const { register } = useAuthStore.getState()
    await register({ email: 'test@example.com', password: 'password', interests: ['tech'] })

    const state = useAuthStore.getState()
    expect(state.user).toEqual(mockResponse.user)
    expect(state.token).toBe(mockResponse.access_token)
    expect(state.isAuthenticated).toBe(true)
    expect(state.isLoading).toBe(false)
    expect(state.error).toBeNull()
  })

  it('should update interests', async () => {
    // Set initial authenticated state
    const initialUser = { id: '1', email: 'test@example.com', interests: ['tech'] }
    useAuthStore.setState({
      user: initialUser,
      token: 'token',
      isAuthenticated: true,
    })

    const { authAPI } = await import('../utils/api')
    vi.mocked(authAPI.updateInterests).mockResolvedValue(undefined)

    const { updateInterests } = useAuthStore.getState()
    const newInterests = ['tech', 'science', 'art']
    await updateInterests(newInterests)

    const state = useAuthStore.getState()
    expect(state.user?.interests).toEqual(newInterests)
    expect(state.isLoading).toBe(false)
    expect(state.error).toBeNull()
  })
})