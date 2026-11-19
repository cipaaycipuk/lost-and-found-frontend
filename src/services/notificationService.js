import apiClient, { USE_MOCK } from '../lib/axios'
import { INITIAL_NOTIFICATIONS } from '../lib/dummyData'

const delay = (ms = 200) => new Promise((resolve) => setTimeout(resolve, ms))

let mockNotifications = [...INITIAL_NOTIFICATIONS]

export const notificationService = {
  async getNotifications() {
    if (USE_MOCK) {
      await delay(150)
      return [...mockNotifications]
    }

    const res = await apiClient.get('/notifications')
    return res.data ?? res
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
