import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { postService } from '../services/postService'

export const postKeys = {
  all: ['posts'],
  list: (filters) => ['posts', 'list', filters],
  detail: (id) => ['posts', 'detail', String(id)],
  mine: ['posts', 'me'],
  saved: ['posts', 'saved'],
  trashed: ['posts', 'trashed'],
  byUser: (userId) => ['posts', 'user', String(userId)],
}

export function usePostsQuery(filters) {
  return useQuery({
    queryKey: postKeys.list(filters),
    queryFn: () => postService.getPosts(filters),
    placeholderData: keepPreviousData,
  })
}

export function usePostDetailQuery(id, initialPost = null) {
  const queryClient = useQueryClient()
  return useQuery({
    queryKey: postKeys.detail(id),
    queryFn: () => postService.getPostById(id),
    enabled: Boolean(id),
    initialData: () => {
      if (initialPost) return initialPost
      const listQueries = queryClient.getQueriesData({ queryKey: ['posts'] })
      for (const [, list] of listQueries) {
        if (Array.isArray(list)) {
          const found = list.find((p) => String(p.id) === String(id))
          if (found) return found
        }
      }
      return undefined
    },
    initialDataUpdatedAt: 0,
  })
}

export function useMyPostsQuery(enabled = true) {
  return useQuery({
    queryKey: postKeys.mine,
    queryFn: () => postService.getMyPosts(),
    enabled,
  })
}

export function useSavedPostsQuery(enabled = true) {
  return useQuery({
    queryKey: postKeys.saved,
    queryFn: () => postService.getSavedPosts(),
    enabled,
  })
}

export function useUserOpenPostsQuery(userId) {
  return useQuery({
    queryKey: postKeys.byUser(userId),
    queryFn: () => postService.getPublicUserProfile(userId),
    enabled: Boolean(userId),
  })
}

export function useTrashedPostsQuery(enabled = true) {
  return useQuery({
    queryKey: postKeys.trashed,
    queryFn: () => postService.getTrashedPosts(),
    enabled,
  })
}

export function useRestorePostMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id) => {
      const promise = postService.restorePost(id)
      toast.promise(promise, {
        loading: 'Memulihkan laporan...',
        success: 'Laporan berhasil dipulihkan!',
        error: (err) => err?.message || 'Gagal memulihkan laporan.',
      })
      return promise
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postKeys.all })
    },
  })
}

export function useCreatePostMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (formData) => {
      const promise = postService.createPost(formData)
      toast.promise(promise, {
        loading: 'Mempublikasikan laporan...',
        success: 'Laporan berhasil dipublikasikan!',
        error: (err) => err?.message || 'Gagal mengirim laporan.',
      })
      return promise
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postKeys.all })
    },
  })
}

export function useToggleBookmarkMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id) => {
      const promise = postService.toggleBookmark(id)
      toast.promise(promise, {
        loading: 'Memperbarui simpanan...',
        success: (updated) =>
          updated?.isSaved
            ? 'Laporan disimpan ke profil.'
            : 'Laporan dihapus dari simpanan.',
        error: (err) => err?.message || 'Gagal memperbarui simpanan.',
      })
      return promise
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: postKeys.all })
      const toggleInList = (old) =>
        Array.isArray(old)
          ? old.map((p) =>
              String(p.id) === String(id) ? { ...p, isSaved: !p.isSaved } : p
            )
          : old
      queryClient.setQueriesData({ queryKey: ['posts', 'list'] }, toggleInList)
      queryClient.setQueriesData({ queryKey: postKeys.mine }, toggleInList)
      queryClient.setQueryData(postKeys.detail(id), (old) =>
        old ? { ...old, isSaved: !old.isSaved } : old
      )
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: postKeys.all })
    },
  })
}

export function useUpdatePostMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }) => {
      const promise = postService.updatePost(id, payload)
      toast.promise(promise, {
        loading: 'Menyimpan perubahan laporan...',
        success: 'Laporan berhasil diperbarui!',
        error: (err) => err?.message || 'Gagal memperbarui laporan.',
      })
      return promise
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postKeys.all })
    },
  })
}

export function useUpdatePostStatusMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }) => {
      const promise = postService.updatePostStatus(id, status)
      toast.promise(promise, {
        loading: 'Memperbarui status laporan...',
        success: (updated) =>
          updated?.status === 'selesai'
            ? 'Laporan ditandai selesai.'
            : 'Laporan dibuka kembali.',
        error: (err) => err?.message || 'Gagal memperbarui status laporan.',
      })
      return promise
    },
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: postKeys.all })
      const updateInList = (old) =>
        Array.isArray(old)
          ? old.map((p) => (String(p.id) === String(id) ? { ...p, status } : p))
          : old
      queryClient.setQueriesData({ queryKey: ['posts', 'list'] }, updateInList)
      queryClient.setQueriesData({ queryKey: postKeys.mine }, updateInList)
      queryClient.setQueryData(postKeys.detail(id), (old) =>
        old ? { ...old, status } : old
      )
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: postKeys.all })
    },
  })
}

export function useDeletePostMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id) => {
      const promise = postService.deletePost(id)
      toast.promise(promise, {
        loading: 'Menghapus laporan...',
        success: 'Laporan berhasil dihapus.',
        error: (err) => err?.message || 'Gagal menghapus laporan.',
      })
      return promise
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: postKeys.all })
      const removeInList = (old) =>
        Array.isArray(old)
          ? old.filter((p) => String(p.id) !== String(id))
          : old
      queryClient.setQueriesData({ queryKey: ['posts', 'list'] }, removeInList)
      queryClient.setQueriesData({ queryKey: postKeys.mine }, removeInList)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: postKeys.all })
    },
  })
}
