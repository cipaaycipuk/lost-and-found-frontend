import apiClient, { USE_MOCK } from '../lib/axios'

let mockClaimsStore = { submitted: [], received: [] }

export const claimService = {
  async submitClaim(postId, { message, contact_whatsapp }) {
    if (USE_MOCK) {
      const claim = {
        id: Date.now(),
        post_id: postId,
        message,
        contact_whatsapp,
        status: 'pending',
        created_at: new Date().toISOString(),
      }
      mockClaimsStore.submitted = [claim, ...mockClaimsStore.submitted]
      return claim
    }

    const res = await apiClient.post(`/posts/${postId}/claims`, {
      message,
      contact_whatsapp,
    })
    return res?.data ?? res
  },

  async getMyClaims() {
    if (USE_MOCK) {
      return mockClaimsStore
    }

    const res = await apiClient.get('/claims/me')
    const data = res?.data ?? res
    return {
      submitted: Array.isArray(data?.submitted) ? data.submitted : [],
      received: Array.isArray(data?.received) ? data.received : [],
    }
  },

  async respondClaim(claimId, { status, owner_note = '' }) {
    if (USE_MOCK) {
      return { id: claimId, status, owner_note }
    }

    const res = await apiClient.patch(`/claims/${claimId}/respond`, {
      status,
      owner_note,
    })
    return res?.data ?? res
  },
}
