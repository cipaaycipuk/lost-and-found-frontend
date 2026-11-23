import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { claimService } from '../services/claimService'
import { postKeys } from './usePosts'

export const claimKeys = {
  mine: ['claims', 'me'],
}

export function useMyClaimsQuery(enabled = true) {
  return useQuery({
    queryKey: claimKeys.mine,
    queryFn: () => claimService.getMyClaims(),
    enabled,
  })
}

export function useSubmitClaimMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ postId, message, contact_whatsapp }) => {
      const promise = claimService.submitClaim(postId, {
        message,
        contact_whatsapp,
      })
      toast.promise(promise, {
        loading: 'Mengirim pengajuan klaim...',
        success: 'Pengajuan klaim berhasil dikirim!',
        error: (err) => err?.message || 'Gagal mengirim pengajuan klaim.',
      })
      return promise
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: claimKeys.mine })
      queryClient.invalidateQueries({ queryKey: postKeys.all })
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })
}

export function useRespondClaimMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ claimId, status, owner_note }) => {
      const promise = claimService.respondClaim(claimId, {
        status,
        owner_note,
      })
      toast.promise(promise, {
        loading: 'Memproses respons klaim...',
        success:
          status === 'accepted'
            ? 'Klaim diterima! Laporan ditandai selesai.'
            : 'Klaim ditolak.',
        error: (err) => err?.message || 'Gagal memproses klaim.',
      })
      return promise
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: claimKeys.mine })
      queryClient.invalidateQueries({ queryKey: postKeys.all })
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })
}
