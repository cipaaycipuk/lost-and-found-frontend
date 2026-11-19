import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { commentService } from '../services/commentService'
import { postKeys } from './usePosts'

export function useCommentsQuery(postId) {
  return useQuery({
    queryKey: ['comments', String(postId)],
    queryFn: () => commentService.getComments(postId),
    enabled: Boolean(postId),
  })
}

export function useCreateCommentMutation(postId) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload) => commentService.createComment(postId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', String(postId)] })
      queryClient.invalidateQueries({ queryKey: postKeys.all })
      toast.success('Komentar terkirim.')
    },
    onError: (err) => {
      toast.error(err.message || 'Gagal mengirim komentar.')
    },
  })
}
