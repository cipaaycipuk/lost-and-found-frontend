import apiClient, { API_BASE_URL, USE_MOCK } from '../lib/axios'
import { currentUser } from '../lib/dummyData'
import { EMAIL_DOMAIN } from '../lib/validators'

const delay = (ms = 0) => new Promise((resolve) => setTimeout(resolve, ms))

const assertWidyatamaEmail = (email) => {
  const normalized = String(email || '').trim().toLowerCase()
  if (!normalized || !normalized.endsWith(EMAIL_DOMAIN) || normalized.length <= EMAIL_DOMAIN.length) {
    throw new Error(`Hanya email kampus (${EMAIL_DOMAIN}) yang diperbolehkan untuk login.`)
  }
}

export const authService = {
  async login({ email, password }) {
    assertWidyatamaEmail(email)

    if (USE_MOCK) {
      await delay()
      const user = {
        ...currentUser,
        email: email.trim().toLowerCase(),
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

  async loginWithGoogle(payload) {
    if (payload?.email) {
      assertWidyatamaEmail(payload.email)
    }

    if (USE_MOCK) {
      await delay()
      const email = payload.email || currentUser.email
      assertWidyatamaEmail(email)
      const name =
        payload.name ||
        email
          .split('@')[0]
          .replace(/[._]/g, ' ')
          .replace(/\b\w/g, (c) => c.toUpperCase())

      const saved = localStorage.getItem('auth_user')
      const existing = saved ? JSON.parse(saved) : null
      const isSameEmail =
        existing && existing.email?.toLowerCase() === email.toLowerCase()

      const user = isSameEmail
        ? {
            ...existing,
            google_id: payload.google_id || `google-${email}`,
            auth_provider: 'manual,google',
          }
        : {
            ...currentUser,
            email,
            name,
            avatar: payload.avatar || currentUser.avatar,
            google_id: payload.google_id || `google-${email}`,
            auth_provider: 'google',
          }

      return {
        token: 'mock-jwt-token-google-widyatama',
        user,
      }
    }

    const res = await apiClient.post('/auth/google', payload)
    return res.data ?? res
  },

  async redirectToGoogleOAuth() {
    if (USE_MOCK) {
      return null
    }
    try {
      const res = await apiClient.get('/auth/google/redirect')
      const url = res?.data?.url || res?.url || res?.redirect_url
      if (url) {
        window.location.href = url
        return url
      }
    } catch {
      // Fallback direct browser redirect to backend Socialite route
    }
    window.location.href = `${API_BASE_URL}/auth/google/redirect`
    return `${API_BASE_URL}/auth/google/redirect`
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
      let updates = payload
      if (payload instanceof FormData) {
        updates = {}
        if (payload.get('name')) updates.name = payload.get('name')
        if (payload.get('whatsapp')) updates.whatsapp = payload.get('whatsapp')
        const avatarFile = payload.get('avatar')
        if (avatarFile instanceof File) {
          updates.avatar = URL.createObjectURL(avatarFile)
        }
      }
      const updated = { ...base, ...updates }
      localStorage.setItem('auth_user', JSON.stringify(updated))
      return updated
    }

    const isFormData = payload instanceof FormData
    const res = await apiClient.post(
      '/auth/profile',
      payload,
      isFormData
        ? { headers: { 'Content-Type': 'multipart/form-data' } }
        : undefined
    )
    const data = res.data ?? res
    return data.user ?? data
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
