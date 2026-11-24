import { AlertTriangle } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

export default function ConfirmDialog({
  open,
  title = 'Konfirmasi Hapus',
  description = 'Apakah Anda yakin ingin melanjutkan tindakan ini?',
  subDescription = '',
  confirmLabel = 'Ya, Hapus',
  cancelLabel = 'Batal',
  variant = 'warning',
  loading = false,
  onConfirm,
  onCancel,
}) {
  const iconBgClass =
    variant === 'danger'
      ? 'bg-red-100/80 text-red-600'
      : 'bg-amber-100/80 text-amber-500'

  const confirmClasses =
    variant === 'danger'
      ? 'bg-red-600 text-white hover:bg-red-700'
      : 'bg-[#1C1C1C] text-white hover:bg-neutral-800'

  return (
    <AlertDialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen && !loading) onCancel?.()
      }}
    >
      <AlertDialogContent
        size="md"
        className="rounded-2xl border border-gray-200/80 bg-white p-6 text-center shadow-2xl sm:p-7"
      >
        <div className="flex flex-col items-center">
          <span
            className={`mb-4 flex h-12 w-12 items-center justify-center rounded-full ${iconBgClass}`}
          >
            <AlertTriangle size={22} />
          </span>

          <AlertDialogTitle className="text-lg font-bold text-gray-900 sm:text-xl">
            {title}
          </AlertDialogTitle>

          <AlertDialogDescription className="mt-2.5 text-sm leading-relaxed text-gray-800">
            {description}
          </AlertDialogDescription>

          {subDescription && (
            <p className="mt-2.5 text-xs leading-relaxed text-gray-500 sm:text-sm">
              {subDescription}
            </p>
          )}

          <div className="mt-6 flex w-full flex-col-reverse items-center justify-center gap-2.5 sm:w-auto sm:flex-row sm:gap-3">
            <button
              type="button"
              disabled={loading}
              onClick={() => onCancel?.()}
              className="w-full rounded-full border border-gray-300 bg-white px-5 py-2 text-xs font-semibold text-gray-800 transition hover:bg-gray-50 disabled:opacity-50 sm:w-auto sm:text-sm"
            >
              {cancelLabel}
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => onConfirm?.()}
              className={`w-full rounded-full px-5 py-2 text-xs font-semibold transition disabled:opacity-60 sm:w-auto sm:text-sm ${confirmClasses}`}
            >
              {loading ? 'Memproses...' : confirmLabel}
            </button>
          </div>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  )
}
