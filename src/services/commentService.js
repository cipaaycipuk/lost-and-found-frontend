import apiClient, { USE_MOCK } from '../lib/axios'
import { INITIAL_COMMENTS, currentUser } from '../lib/dummyData'

const delay = (ms = 220) => new Promise((resolve) => setTimeout(resolve, ms))

const mockCommentsStore = { ...INITIAL_COMMENTS }

export const commentService = {
  async getComments(postId) {
    if (USE_MOCK) {
      await delay(180)
      return mockCommentsStore[postId] ? [...mockCommentsStore[postId]] : []
    }

    const res = await apiClient.get(`/posts/${postId}/comments`)
    return res.data ?? res
  },

  async createComment(postId, { content, parentId = null }) {
    if (USE_MOCK) {
      await delay(250)
      const savedUser = localStorage.getItem('auth_user')
      const user = savedUser ? JSON.parse(savedUser) : currentUser

      const newComment = {
        id: Date.now(),
        post_id: postId,
        parent_id: parentId,
        user: user.name,
        avatar: user.avatar || '/users/emily.jpg',
        text: content,
        isReply: Boolean(parentId),
        created_at: new Date().toISOString(),
      }

      mockCommentsStore[postId] = [...(mockCommentsStore[postId] || []), newComment]
      return newComment
    }

    const res = await apiClient.post(`/posts/${postId}/comments`, {
      content,
      parent_id: parentId,
    })
    return res.data ?? res
  },

  async deleteComment(commentId) {
    if (USE_MOCK) {
      await delay(200)
      Object.keys(mockCommentsStore).forEach((pid) => {
        mockCommentsStore[pid] = mockCommentsStore[pid].filter(
          (c) => String(c.id) !== String(commentId)
        )
      })
      return { id: commentId }
    }

    return apiClient.delete(`/comments/${commentId}`)
  },
}
