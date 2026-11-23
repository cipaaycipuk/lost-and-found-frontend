import { useEffect, useState } from 'react'
import { HandHeart, X } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useSubmitClaimMutation } from '../hooks/useClaims'

export default function ClaimModal({ open, post, onClose }) {
  const { user } = useAuth()
  const submitClaim = useSubmitClaimMutation()
  const [message, setMessage] = useState('')
  const [whatsapp, setWhatsapp] = useState(user?.whatsapp || '')
  const [error, setError] = useState('')

  useEffect(() => {
    if (open) {
      setMessage('')
      setWhatsapp(user?.whatsapp || '')
      setError('')
    }
  }, [open, user?.whatsapp])

  useEffect(() => {
    if (!open) return undefined
    const onKeyDown = (e) => {
      if (e.key === 'Escape' && !submitClaim.isPending) {
        onClose?.()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, submitClaim.isPending, onClose])

  if (!open || !post) return null

  const isKehilangan = post.type === 'kehilangan'
  const actionLabel =
    post.reportMeta?.claim_action_label ||
    (isKehilangan ? 'Saya Menemukan Ini' : 'Ajukan Klaim')

  const handleSubmit = (e) => {
    e.preventDefault()
    const trimmed = message.trim()
    if (trimmed.length < 5) {
      setError('Tuliskan keterangan atau ciri bukti minimal 5 karakter.')
      return
    }

    submitClaim.mutate(
      {
        postId: post.id,
        message: trimmed,
        contact_whatsapp: whatsapp.trim() || undefined,
      },
      {
        onSuccess: () => {
          onClose?.()
        },
      }
    )
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="claim-modal-title"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-[2px]"
      onClick={(e) => {
        e.stopPropagation()
        if (!submitClaim.isPending) onClose?.()
      }}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-5 shadow-2xl sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-50 text-[#e0531c]">
              <HandHeart size={20} />
            </span>
            <div>
              <h3
                id="claim-modal-title"
                className="text-base font-bold text-gray-900"
              >
                {actionLabel}
              </h3>
              <p className="line-clamp-1 text-xs text-gray-500">
                {post.title}
              </p>
            </div>
          </div>
          <button
            type="button"
            disabled={submitClaim.isPending}
            aria-label="Tutup modal klaim"
            onClick={() => onClose?.()}
            className="rounded-full p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label
              htmlFor="claim-message"
              className="mb-1.5 block text-xs font-semibold text-gray-800"
            >
              {isKehilangan
                ? 'Keterangan Penemuan / Lokasi Saat Ini'
                : 'Bukti / Ciri Khusus Kepemilikan'}
            </label>
            <textarea
              id="claim-message"
              rows={3}
              value={message}
              onChange={(e) => {
                setMessage(e.target.value)
                if (error) setError('')
              }}
              placeholder={
                isKehilangan
                  ? 'Contoh: Saya menemukan barang ini di lantai 2 dan sudah diamankan di pos satpam.'
                  : 'Contoh: Di dalam dompet terdapat KTM atas nama saya dan gantungan kunci biru.'
              }
              className="w-full resize-none rounded-lg border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-black focus:bg-white"
            />
            {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
          </div>

          <div>
            <label
              htmlFor="claim-whatsapp"
              className="mb-1.5 block text-xs font-semibold text-gray-800"
            >
              Nomor WhatsApp Anda (ditampilkan setelah klaim diterima)
            </label>
            <input
              id="claim-whatsapp"
              type="tel"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              placeholder="Contoh: 081234567890"
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-black focus:bg-white"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-1">
            <button
              type="button"
              disabled={submitClaim.isPending}
              onClick={() => onClose?.()}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-xs font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitClaim.isPending}
              className="rounded-lg bg-black px-4 py-2 text-xs font-semibold text-white transition hover:bg-neutral-800 disabled:opacity-60"
            >
              {submitClaim.isPending ? 'Mengirim...' : 'Kirim Pengajuan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
