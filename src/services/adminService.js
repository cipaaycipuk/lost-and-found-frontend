import apiClient from '../lib/axios'

export const adminService = {
  async getStats() {
    const res = await apiClient.get('/admin/stats')
    return res?.data ?? res
  },

  async getPosts(params = {}) {
    const res = await apiClient.get('/admin/posts', { params })
    return res?.data ?? res
  },

  async restorePost(id) {
    const res = await apiClient.post(`/admin/posts/${id}/restore`)
    return res?.data ?? res
  },

  async deletePost(id) {
    const res = await apiClient.delete(`/admin/posts/${id}`)
    return res?.data ?? res
  },

  async getUsers(params = {}) {
    const res = await apiClient.get('/admin/users', { params })
    return res?.data ?? res
  },

  async updateUserRole(userId, role) {
    const res = await apiClient.patch(`/admin/users/${userId}/role`, { role })
    return res?.data ?? res
  },

  async getClaims(params = {}) {
    const res = await apiClient.get('/admin/claims', { params })
    return res?.data ?? res
  },

  async respondClaim(claimId, { status, owner_note = '' }) {
    const res = await apiClient.patch(`/admin/claims/${claimId}/respond`, {
      status,
      owner_note,
    })
    return res?.data ?? res
  },
}
