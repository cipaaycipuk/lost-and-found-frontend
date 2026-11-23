import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { notificationService } from '../services/notificationService'

export function useNotificationsQuery() {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationService.getNotifications(),
  })
}

export function useMarkNotificationReadMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id) => notificationService.markAsRead(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['notifications'] })
      queryClient.setQueryData(['notifications'], (old) =>
        Array.isArray(old)
          ? old.map((n) => (String(n.id) === String(id) ? { ...n, isRead: true } : n))
          : old
      )
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })
}

export function useMarkAllNotificationsReadMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => notificationService.markAllAsRead(),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['notifications'] })
      queryClient.setQueryData(['notifications'], (old) =>
        Array.isArray(old) ? old.map((n) => ({ ...n, isRead: true })) : old
      )
    },
    onSuccess: () => {
      toast.success('Semua notifikasi ditandai sudah dibaca.')
    },
    onError: (err) => {
      toast.error(err?.message || 'Gagal menandai notifikasi.')
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })
}
