import apiClient, { USE_MOCK } from '../lib/axios'
import { INITIAL_POSTS, currentUser } from '../lib/dummyData'
import { normalizePost } from '../lib/formatters'

const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms))

// In-memory store for mock mode so create/bookmark/status updates persist during session
let mockPostsStore = INITIAL_POSTS.map(normalizePost)

const extractList = (res) => {
  const payload = res?.data ?? res
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.data)) return payload.data
  if (Array.isArray(payload?.posts)) return payload.posts
  return []
}

export const postService = {
  async getPosts(params = {}) {
    if (USE_MOCK) {
      await delay(280)
      let items = [...mockPostsStore]

      if (params.type && params.type !== 'Semua') {
        const targetType = params.type.toLowerCase()
        items = items.filter((p) => p.type === targetType)
      }

      if (params.category && params.category !== 'Semua kategori') {
        items = items.filter(
          (p) => p.category.toLowerCase() === params.category.toLowerCase()
        )
      }

      if (params.location && params.location !== 'Semua') {
        items = items.filter((p) =>
          p.location.toLowerCase().includes(params.location.toLowerCase())
        )
      }

      if (params.search && params.search.trim()) {
        const q = params.search.trim().toLowerCase()
        items = items.filter(
          (p) =>
            p.title.toLowerCase().includes(q) ||
            p.description.toLowerCase().includes(q) ||
            p.location.toLowerCase().includes(q) ||
            p.category.toLowerCase().includes(q)
        )
      }

      items.sort((a, b) => {
        const tA = new Date(a.createdAt).getTime()
        const tB = new Date(b.createdAt).getTime()
        return params.sort === 'oldest' ? tA - tB : tB - tA
      })

      return items
    }

    try {
      const res = await apiClient.get('/posts', { params })
      const rawList = extractList(res)
      return rawList.map(normalizePost)
    } catch (err) {
      if (!err.status) {
        return mockPostsStore
      }
      throw err
    }
  },

  async getPostById(id) {
    if (USE_MOCK) {
      await delay(200)
      const found = mockPostsStore.find((p) => String(p.id) === String(id))
      if (!found) throw new Error('Laporan tidak ditemukan')
      return found
    }

    const res = await apiClient.get(`/posts/${id}`)
    const payload = res?.data ?? res
    return normalizePost(payload?.post ?? payload)
  },

  async createPost(formData) {
    if (USE_MOCK) {
      await delay(450)
      const files = [
        ...formData.getAll('images[]'),
        ...formData.getAll('images'),
        ...formData.getAll('foto'),
      ]
      const previewUrls = files
        .filter((f) => f instanceof File)
        .map((f) => URL.createObjectURL(f))

      const savedUser = localStorage.getItem('auth_user')
      const author = savedUser ? JSON.parse(savedUser) : currentUser

      const newPost = normalizePost({
        id: Date.now(),
        type: formData.get('type') || formData.get('tipe') || 'kehilangan',
        status: 'open',
        title: formData.get('title') || formData.get('nama_barang'),
        category: formData.get('category') || formData.get('kategori'),
        location: formData.get('location') || formData.get('lokasi') || '-',
        incident_date: formData.get('incident_date') || formData.get('tanggal'),
        description: formData.get('description') || formData.get('deskripsi'),
        images: previewUrls,
        comments_count: 0,
        is_saved: false,
        created_at: new Date().toISOString(),
        author,
      })

      mockPostsStore = [newPost, ...mockPostsStore]
      return newPost
    }

    const res = await apiClient.post('/posts', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    const payload = res?.data ?? res
    return normalizePost(payload?.post ?? payload)
  },

  async updatePostStatus(id, status) {
    if (USE_MOCK) {
      await delay(250)
      mockPostsStore = mockPostsStore.map((p) =>
        String(p.id) === String(id) ? { ...p, status } : p
      )
      return mockPostsStore.find((p) => String(p.id) === String(id))
    }

    const res = await apiClient.patch(`/posts/${id}/status`, { status })
    const payload = res?.data ?? res
    return normalizePost(payload?.post ?? payload)
  },

  async deletePost(id) {
    if (USE_MOCK) {
      await delay(250)
      mockPostsStore = mockPostsStore.filter((p) => String(p.id) !== String(id))
      return { id }
    }

    return apiClient.delete(`/posts/${id}`)
  },

  async toggleBookmark(id) {
    if (USE_MOCK) {
      await delay(180)
      let updatedPost = null
      mockPostsStore = mockPostsStore.map((p) => {
        if (String(p.id) === String(id)) {
          updatedPost = { ...p, isSaved: !p.isSaved, is_saved: !p.isSaved }
          return updatedPost
        }
        return p
      })
      return updatedPost
    }

    const res = await apiClient.post(`/posts/${id}/bookmark`)
    const data = res?.data ?? res
    return {
      ...data,
      isSaved: Boolean(data?.is_saved ?? data?.isSaved),
    }
  },

  async getMyPosts() {
    if (USE_MOCK) {
      await delay(220)
      const savedUser = localStorage.getItem('auth_user')
      const me = savedUser ? JSON.parse(savedUser) : currentUser
      return mockPostsStore.filter(
        (p) => p.author.id === me.id || p.author.email === me.email
      )
    }

    try {
      const res = await apiClient.get('/posts/me')
      return extractList(res).map(normalizePost)
    } catch (err) {
      if (!err.status) {
        const savedUser = localStorage.getItem('auth_user')
        const me = savedUser ? JSON.parse(savedUser) : currentUser
        return mockPostsStore.filter(
          (p) => p.author.id === me.id || p.author.email === me.email
        )
      }
      throw err
    }
  },

  async getSavedPosts() {
    if (USE_MOCK) {
      await delay(220)
      return mockPostsStore.filter((p) => p.isSaved)
    }

    try {
      const res = await apiClient.get('/posts/saved')
      return extractList(res).map(normalizePost)
    } catch (err) {
      if (!err.status) {
        return mockPostsStore.filter((p) => p.isSaved)
      }
      throw err
    }
  },

  async getUserOpenPosts(userId) {
    if (!userId) return []

    if (USE_MOCK) {
      await delay(220)
      return mockPostsStore.filter(
        (p) => String(p.author?.id) === String(userId) && p.status !== 'selesai'
      )
    }

    try {
      const res = await apiClient.get('/posts', { params: { limit: 100 } })
      return extractList(res)
        .map(normalizePost)
        .filter(
          (p) => String(p.author?.id) === String(userId) && p.status !== 'selesai'
        )
    } catch (err) {
      if (!err.status) {
        return mockPostsStore.filter(
          (p) => String(p.author?.id) === String(userId) && p.status !== 'selesai'
        )
      }
      throw err
    }
  },
}
