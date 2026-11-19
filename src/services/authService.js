import apiClient, { USE_MOCK } from '../lib/axios'
import { currentUser } from '../lib/dummyData'

const delay = (ms = 350) => new Promise((resolve) => setTimeout(resolve, ms))

export const authService = {
  async login({ email, password }) {
    if (USE_MOCK) {
      await delay()
      const user = {
        ...currentUser,
        email,
        name: email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      }
      return {
        token: 'mock-jwt-token-widyatama',
        user,
      }
    }

    const res = await apiClient.post('/auth/login', { email, password })
    return res.data ?? res
  },

  async register({ name, email, password, contact }) {
    if (USE_MOCK) {
      await delay()
      const user = {
        id: Date.now(),
        name,
        email,
        whatsapp: contact,
        avatar: '/users/emily.jpg',
      }
      return {
        token: 'mock-jwt-token-widyatama',
        user,
      }
    }

    const res = await apiClient.post('/auth/register', {
      name,
      email,
      password,
      whatsapp: contact,
    })
    return res.data ?? res
  },

  async getMe() {
    if (USE_MOCK) {
      await delay(200)
      const saved = localStorage.getItem('auth_user')
      return saved ? JSON.parse(saved) : currentUser
    }

    const res = await apiClient.get('/auth/me')
    return res.data ?? res
  },

  async updateProfile(payload) {
    if (USE_MOCK) {
      await delay(300)
      const saved = localStorage.getItem('auth_user')
      const base = saved ? JSON.parse(saved) : currentUser
      const updated = { ...base, ...payload }
      localStorage.setItem('auth_user', JSON.stringify(updated))
      return updated
    }

    const res = await apiClient.put('/auth/profile', payload)
    return res.data ?? res
  },

  async logout() {
    if (!USE_MOCK) {
      try {
        await apiClient.post('/auth/logout')
      } catch {
        // Ignore network errors on logout
      }
    }
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_user')
  },
}
