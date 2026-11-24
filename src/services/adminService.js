import apiClient from '../lib/axios'

function unwrapList(res, key) {
  const payload = res?.data ?? res
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.data)) return payload.data
  if (key && Array.isArray(payload?.[key])) return payload[key]
  return []
}

export const adminService = {
  async getStats() {
    const res = await apiClient.get('/admin/stats')
    return res?.data ?? res
  },

  async getPosts(params = {}) {
    const res = await apiClient.get('/admin/posts', { params })
    return unwrapList(res, 'posts')
  },

  async deletePost(id) {
    const res = await apiClient.delete(`/admin/posts/${id}`)
    return res?.data ?? res
  },

  async getUsers(params = {}) {
    const res = await apiClient.get('/admin/users', { params })
    return unwrapList(res, 'users')
  },

  async updateUserRole(userId, role) {
    const res = await apiClient.patch(`/admin/users/${userId}/role`, { role })
    return res?.data ?? res
  },

  async getClaims(params = {}) {
    const res = await apiClient.get('/admin/claims', { params })
    return unwrapList(res, 'claims')
  },

  async respondClaim(claimId, { status, owner_note = '' }) {
    const res = await apiClient.patch(`/admin/claims/${claimId}/respond`, {
      status,
      owner_note,
    })
    return res?.data ?? res
  },
}
