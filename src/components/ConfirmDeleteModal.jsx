import { useEffect } from 'react'
import { AlertTriangle } from 'lucide-react'

export default function ConfirmDeleteModal({
  open,
  title = 'Hapus laporan?',
  description = 'Tindakan ini akan menghapus laporan dari daftar aktif.',
  isPending = false,
  onCancel,
  onConfirm,
}) {
  useEffect(() => {
    if (!open) return undefined
    const onKeyDown = (e) => {
      if (e.key === 'Escape' && !isPending) onCancel?.()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, isPending, onCancel])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-[2px]"
      onClick={(e) => {
        e.stopPropagation()
        if (!isPending) onCancel?.()
      }}
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600">
            <AlertTriangle size={20} />
          </span>
          <div className="min-w-0">
            <h3 className="text-base font-bold text-gray-900">{title}</h3>
            <p className="mt-1 text-xs leading-relaxed text-gray-600">
              {description}
            </p>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-end gap-2">
          <button
            type="button"
            disabled={isPending}
            onClick={onCancel}
            className="rounded-lg bg-[#EFEFEF] px-4 py-2 text-xs font-semibold text-gray-800 transition hover:bg-gray-200 disabled:opacity-50"
          >
            Batal
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={onConfirm}
            className="rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
          >
            {isPending ? 'Menghapus...' : 'Ya, Hapus'}
          </button>
        </div>
      </div>
    </div>
  )
}
