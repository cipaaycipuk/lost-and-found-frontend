import apiClient, { USE_MOCK } from '../lib/axios'
import { INITIAL_NOTIFICATIONS } from '../lib/dummyData'
import { formatTimeAgo } from '../lib/formatters'

const delay = (ms = 0) => new Promise((resolve) => setTimeout(resolve, ms))

let mockNotifications = [...INITIAL_NOTIFICATIONS]

const extractPostId = (n) => {
  const direct = n.post_id ?? n.postId ?? n.data?.post_id ?? n.data?.postId
  if (direct) return direct
  const urlMatch = String(n.url || n.link || '').match(/\/posts\/(\d+)/)
  return urlMatch ? urlMatch[1] : null
}

const normalizeNotification = (n) => ({
  id: n.id,
  type: n.type || 'info',
  postId: extractPostId(n),
  url: n.url || n.link || null,
  message: n.message || n.title || n.data?.message || '',
  timeAgo: n.timeAgo || n.time_ago || formatTimeAgo(n.created_at),
  isRead: Boolean(n.is_read ?? n.isRead ?? n.read_at),
})

export const notificationService = {
  async getNotifications() {
    if (USE_MOCK) {
      await delay(150)
      return [...mockNotifications]
    }

    try {
      const res = await apiClient.get('/notifications')
      const raw = res?.data ?? res
      const list = Array.isArray(raw) ? raw : raw?.data || raw?.notifications || []
      return list.map(normalizeNotification)
    } catch (err) {
      if (!err.status) {
        return [...mockNotifications]
      }
      return []
    }
  },

  async markAsRead(id) {
    if (USE_MOCK) {
      mockNotifications = mockNotifications.map((n) =>
        n.id === id ? { ...n, isRead: true } : n
      )
      return { id }
    }

    return apiClient.patch(`/notifications/${id}/read`)
  },

  async markAllAsRead() {
    if (USE_MOCK) {
      mockNotifications = mockNotifications.map((n) => ({ ...n, isRead: true }))
      return { success: true }
    }

    return apiClient.patch('/notifications/read-all')
  },
}
