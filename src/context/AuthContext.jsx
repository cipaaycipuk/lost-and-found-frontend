import { createContext, useContext, useEffect, useState } from 'react'
import { authService } from '../services/authService'
import { currentUser as defaultMockUser } from '../lib/dummyData'
import { USE_MOCK } from '../lib/axios'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('auth_user')
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch {
        return null
      }
    }
    return USE_MOCK ? defaultMockUser : null
  })
  const [token, setToken] = useState(() => localStorage.getItem('auth_token'))

  useEffect(() => {
    const handleUnauthorized = () => {
      setUser(null)
      setToken(null)
    }
    window.addEventListener('auth:unauthorized', handleUnauthorized)
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized)
  }, [])

  const persistSession = (nextToken, nextUser) => {
    if (nextToken) {
      localStorage.setItem('auth_token', nextToken)
      setToken(nextToken)
    }
    if (nextUser) {
      localStorage.setItem('auth_user', JSON.stringify(nextUser))
      setUser(nextUser)
    }
  }

  const login = async (credentials) => {
    const data = await authService.login(credentials)
    persistSession(data.token, data.user)
    return data
  }

  const register = async (payload) => {
    const data = await authService.register(payload)
    persistSession(data.token, data.user)
    return data
  }

  const updateProfile = async (payload) => {
    const updated = await authService.updateProfile(payload)
    persistSession(null, updated)
    return updated
  }

  const logout = async () => {
    await authService.logout()
    setUser(null)
    setToken(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: Boolean(token || (USE_MOCK && user)),
        login,
        register,
        updateProfile,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth harus digunakan di dalam AuthProvider')
  return ctx
}
