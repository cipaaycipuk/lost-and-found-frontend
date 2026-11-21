import apiClient, { USE_MOCK } from '../lib/axios'
import { INITIAL_COMMENTS, currentUser } from '../lib/dummyData'

const delay = (ms = 0) => new Promise((resolve) => setTimeout(resolve, ms))

const mockCommentsStore = { ...INITIAL_COMMENTS }

const normalizeComment = (c) => ({
  id: c.id,
  post_id: c.post_id,
  parent_id: c.parent_id ?? null,
  user:
    typeof c.user === 'string'
      ? c.user
      : c.user?.name || c.author?.name || 'Pengguna',
  avatar:
    c.avatar ||
    c.user?.avatar_url ||
    c.user?.avatar ||
    c.author?.avatar_url ||
    c.author?.avatar ||
    '',
  text: c.text || c.content || '',
  content: c.content || c.text || '',
  isReply: Boolean(c.isReply || c.parent_id),
  created_at: c.created_at,
})

const flattenComments = (list) => {
  if (!Array.isArray(list)) return []
  const result = []
  const seenIds = new Set()

  const pushUnique = (comment) => {
    const normalized = normalizeComment(comment)
    const key = String(normalized.id)
    if (seenIds.has(key)) return
    seenIds.add(key)
    result.push(normalized)
  }

  list.forEach((item) => {
    pushUnique(item)
    if (Array.isArray(item.replies)) {
      item.replies.forEach((reply) => {
        pushUnique({
          ...reply,
          parent_id: reply.parent_id ?? item.id,
          isReply: true,
        })
      })
    }
  })
  return result
}

export const commentService = {
  async getComments(postId) {
    if (USE_MOCK) {
      await delay(180)
      return mockCommentsStore[postId] ? [...mockCommentsStore[postId]] : []
    }

    try {
      const res = await apiClient.get(`/posts/${postId}/comments`)
      const raw = res?.data ?? res
      const list = Array.isArray(raw) ? raw : raw?.data || raw?.comments || []
      return flattenComments(list)
    } catch (err) {
      if (!err.status) {
        return mockCommentsStore[postId] ? [...mockCommentsStore[postId]] : []
      }
      throw err
    }
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
    return normalizeComment(res?.data ?? res)
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
