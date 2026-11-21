import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { postService } from '../services/postService'

export const postKeys = {
  all: ['posts'],
  list: (filters) => ['posts', 'list', filters],
  detail: (id) => ['posts', 'detail', String(id)],
  mine: ['posts', 'me'],
  saved: ['posts', 'saved'],
  byUser: (userId) => ['posts', 'user', String(userId)],
}

export function usePostsQuery(filters) {
  return useQuery({
    queryKey: postKeys.list(filters),
    queryFn: () => postService.getPosts(filters),
  })
}

export function usePostDetailQuery(id) {
  return useQuery({
    queryKey: postKeys.detail(id),
    queryFn: () => postService.getPostById(id),
    enabled: Boolean(id),
  })
}

export function useMyPostsQuery() {
  return useQuery({
    queryKey: postKeys.mine,
    queryFn: () => postService.getMyPosts(),
  })
}

export function useSavedPostsQuery() {
  return useQuery({
    queryKey: postKeys.saved,
    queryFn: () => postService.getSavedPosts(),
  })
}

export function useUserOpenPostsQuery(userId) {
  return useQuery({
    queryKey: postKeys.byUser(userId),
    queryFn: () => postService.getUserOpenPosts(userId),
    enabled: Boolean(userId),
  })
}

export function useCreatePostMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (formData) => postService.createPost(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postKeys.all })
      toast.success('Laporan berhasil dipublikasikan!')
    },
    onError: (err) => {
      toast.error(err.message || 'Gagal mengirim laporan.')
    },
  })
}

export function useToggleBookmarkMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id) => postService.toggleBookmark(id),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: postKeys.all })
      if (updated?.isSaved) {
        toast.success('Laporan disimpan ke profil.')
      } else {
        toast.success('Laporan dihapus dari simpanan.')
      }
    },
    onError: (err) => {
      toast.error(err.message || 'Gagal memperbarui simpanan.')
    },
  })
}

export function useUpdatePostStatusMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }) => postService.updatePostStatus(id, status),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: postKeys.all })
      toast.success(
        updated?.status === 'selesai'
          ? 'Laporan ditandai selesai.'
          : 'Laporan dibuka kembali.'
      )
    },
    onError: (err) => {
      toast.error(err.message || 'Gagal memperbarui status laporan.')
    },
  })
}

export function useDeletePostMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id) => postService.deletePost(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postKeys.all })
      toast.success('Laporan berhasil dihapus.')
    },
    onError: (err) => {
      toast.error(err.message || 'Gagal menghapus laporan.')
    },
  })
}
