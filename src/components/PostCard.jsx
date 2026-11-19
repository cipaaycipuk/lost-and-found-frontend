import { useEffect, useState } from 'react'
import {
  MapPin,
  CalendarDays,
  MessageSquareReply,
  Bookmark,
  Phone,
  X,
  CheckCircle2,
  Trash2,
  Tag,
} from 'lucide-react'
import Avatar from './Avatar'
import { formatWhatsAppUrl } from '../lib/formatters'
import {
  useDeletePostMutation,
  useToggleBookmarkMutation,
  useUpdatePostStatusMutation,
} from '../hooks/usePosts'

export default function PostCard({ post, isOwner = false, onSelect }) {
  const isKehilangan = post.type === 'kehilangan'
  const isDone = post.status === 'selesai'
  const [isImageOpen, setIsImageOpen] = useState(false)

  const toggleBookmark = useToggleBookmarkMutation()
  const updateStatus = useUpdatePostStatusMutation()
  const deletePost = useDeletePostMutation()

  const waUrl = formatWhatsAppUrl(
    post.author?.whatsapp,
    `Halo ${post.author?.name || ''}, saya melihat laporan "${post.title}" di Lost & Found.`
  )

  useEffect(() => {
    if (!isImageOpen) return
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setIsImageOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isImageOpen])

  return (
    <article
      onClick={() => onSelect?.(post)}
      className={`space-y-4 rounded-xl border border-gray-200/90 bg-white p-5 shadow-sm transition hover:border-gray-300 hover:shadow-md ${
        onSelect ? 'cursor-pointer' : ''
      } ${isDone ? 'opacity-85' : ''}`}
    >
      {/* Header Post */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <Avatar
            src={post.author?.avatar}
            name={post.author?.name}
            className="h-11 w-11 shrink-0 text-sm"
          />

          <div className="min-w-0">
            <h3 className="truncate text-sm font-bold text-gray-900">
              {post.author?.name}
            </h3>
            <p className="text-xs text-gray-500">{post.timeAgo}</p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {isDone && (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
              <CheckCircle2 size={13} />
              Selesai
            </span>
          )}
          <span
            className={`rounded-full px-3 py-1 text-xs font-bold ${
              isKehilangan
                ? 'bg-[#FCEEE3] text-[#d95200]'
                : 'bg-[#D8DEFF] text-[#001C99]'
            }`}
          >
            {post.typeLabel || (isKehilangan ? 'Kehilangan' : 'Ditemukan')}
          </span>
        </div>
      </div>

      {/* Foto Barang */}
      {post.image && (
        <div
          className="aspect-[16/10] w-full cursor-zoom-in overflow-hidden rounded-lg bg-gray-100"
          onClick={(e) => {
            e.stopPropagation()
            setIsImageOpen(true)
          }}
        >
          <img
            src={post.image}
            alt={post.title}
            loading="lazy"
            className="h-full w-full object-cover object-center transition duration-300 hover:scale-[1.02]"
          />
        </div>
      )}

      {/* Detail Konten */}
      <div className="space-y-3">
        <h2 className="text-lg font-bold leading-snug text-gray-900">
          {post.title}
        </h2>

        <div className="flex flex-wrap gap-2 text-xs">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 font-medium text-gray-700">
            <MapPin size={14} className="text-gray-500" />
            {post.location}
          </span>

          <span className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 font-medium text-gray-700">
            <CalendarDays size={14} className="text-gray-500" />
            {post.date}
          </span>

          <span className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 font-medium text-gray-700">
            <Tag size={14} className="text-gray-500" />
            {post.category}
          </span>
        </div>

        <p className="line-clamp-3 text-sm leading-relaxed text-gray-600">
          {post.description}
        </p>
      </div>

      {/* Owner Actions (hanya di Profil) */}
      {isOwner && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="flex flex-wrap items-center gap-2 border-t border-gray-100 pt-3"
        >
          <button
            type="button"
            disabled={updateStatus.isPending}
            onClick={() =>
              updateStatus.mutate({
                id: post.id,
                status: isDone ? 'open' : 'selesai',
              })
            }
            className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
              isDone
                ? 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100'
                : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
            }`}
          >
            <CheckCircle2 size={14} />
            {isDone ? 'Buka Kembali' : 'Tandai Selesai'}
          </button>

          <button
            type="button"
            disabled={deletePost.isPending}
            onClick={() => deletePost.mutate(post.id)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-100"
          >
            <Trash2 size={14} />
            Hapus
          </button>
        </div>
      )}

      {/* Footer Post */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-3"
      >
        <div className="flex items-center gap-5 text-sm font-medium text-gray-500">
          <button
            type="button"
            onClick={() => onSelect?.(post)}
            className="flex items-center gap-1.5 transition hover:text-black"
          >
            <MessageSquareReply size={18} />
            <span className="tabular-nums">{post.commentsCount || 0}</span>
          </button>

          <button
            type="button"
            disabled={toggleBookmark.isPending}
            onClick={() => toggleBookmark.mutate(post.id)}
            className={`flex items-center gap-1.5 transition ${
              post.isSaved ? 'font-semibold text-[#e0531c]' : 'hover:text-black'
            }`}
          >
            <Bookmark
              size={18}
              className={post.isSaved ? 'fill-[#e0531c]' : ''}
            />
            <span>{post.isSaved ? 'Tersimpan' : 'Simpan'}</span>
          </button>
        </div>

        {waUrl && (
          <a
            href={waUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-[#232323] px-4 py-2 text-xs font-semibold text-white transition hover:bg-neutral-800 sm:text-sm"
          >
            <Phone size={15} />
            Hubungi WhatsApp
          </a>
        )}
      </div>

      {/* Lightbox */}
      {isImageOpen && (
        <div
          className="fixed inset-0 z-[999] flex items-center justify-center bg-black/90 p-4"
          onClick={(e) => {
            e.stopPropagation()
            setIsImageOpen(false)
          }}
        >
          <button
            type="button"
            aria-label="Tutup pratinjau gambar"
            onClick={(e) => {
              e.stopPropagation()
              setIsImageOpen(false)
            }}
            className="absolute right-5 top-5 rounded-full bg-white/10 p-2 text-white transition hover:bg-white/20"
          >
            <X size={24} />
          </button>

          <img
            src={post.image}
            alt={post.title}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[90vh] max-w-[95vw] rounded-lg object-contain"
          />
        </div>
      )}
    </article>
  )
}
