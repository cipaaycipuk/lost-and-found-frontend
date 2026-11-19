import { useEffect, useState } from 'react'
import {
  ArrowLeft,
  Phone,
  Bookmark,
  X,
  Reply,
  CheckCircle2,
  Send,
} from 'lucide-react'
import Avatar from './Avatar'
import { formatWhatsAppUrl } from '../lib/formatters'
import { useToggleBookmarkMutation } from '../hooks/usePosts'
import { useCommentsQuery, useCreateCommentMutation } from '../hooks/useComments'

export default function PostDetail({ post, onBack }) {
  const [commentText, setCommentText] = useState('')
  const [replyTo, setReplyTo] = useState(null)
  const [isImageOpen, setIsImageOpen] = useState(false)

  const isKehilangan = post.type === 'kehilangan'
  const isDone = post.status === 'selesai'

  const toggleBookmark = useToggleBookmarkMutation()
  const { data: comments = [], isLoading: loadingComments } = useCommentsQuery(
    post.id
  )
  const createComment = useCreateCommentMutation(post.id)

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

  const handleSendComment = (e) => {
    e.preventDefault()
    if (!commentText.trim() || createComment.isPending) return

    createComment.mutate(
      { content: commentText.trim(), parentId: replyTo?.id || null },
      {
        onSuccess: () => {
          setCommentText('')
          setReplyTo(null)
        },
      }
    )
  }

  return (
    <article className="space-y-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      {/* 1. Tombol Kembali */}
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-2 text-xs font-semibold text-gray-600 transition hover:text-black"
      >
        <ArrowLeft size={16} />
        <span>Kembali ke daftar</span>
      </button>

      {/* 2. Header Post */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Avatar
            src={post.author?.avatar}
            name={post.author?.name}
            className="h-11 w-11 shrink-0 text-sm"
          />
          <div>
            <h3 className="text-sm font-bold text-gray-900">
              {post.author?.name}
            </h3>
            <p className="text-xs text-gray-500">{post.timeAgo}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
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

      {/* 3. Foto Gambar Utama */}
      {post.image && (
        <div
          className="aspect-[16/10] w-full cursor-zoom-in overflow-hidden rounded-lg bg-gray-100"
          onClick={() => setIsImageOpen(true)}
        >
          <img
            src={post.image}
            alt={post.title}
            className="h-full w-full object-cover object-center transition duration-300 hover:scale-[1.02]"
          />
        </div>
      )}

      {/* 4. Judul & Tabel Informasi Detail */}
      <div className="space-y-4">
        <h1 className="text-xl font-bold text-gray-900">{post.title}</h1>

        <div className="divide-y divide-gray-100 rounded-xl border border-gray-200/80 text-xs">
          <div className="grid grid-cols-12 bg-gray-50/60 p-3">
            <span className="col-span-4 text-gray-500">
              {isKehilangan ? 'Lokasi terakhir' : 'Lokasi ditemukan'}
            </span>
            <span className="col-span-8 font-semibold text-gray-900">
              {post.location}
            </span>
          </div>
          <div className="grid grid-cols-12 p-3">
            <span className="col-span-4 text-gray-500">
              {isKehilangan ? 'Tanggal hilang' : 'Tanggal ditemukan'}
            </span>
            <span className="col-span-8 font-semibold text-gray-900">
              {post.date}
            </span>
          </div>
          <div className="grid grid-cols-12 bg-gray-50/60 p-3">
            <span className="col-span-4 text-gray-500">Kategori</span>
            <span className="col-span-8 font-semibold text-gray-900">
              {post.category}
            </span>
          </div>
          <div className="grid grid-cols-12 p-3">
            <span className="col-span-4 text-gray-500">Status</span>
            <span className="col-span-8 font-semibold text-gray-900">
              {isDone
                ? 'Selesai'
                : isKehilangan
                  ? 'Masih dicari'
                  : 'Menunggu pemilik'}
            </span>
          </div>
        </div>

        {/* Deskripsi */}
        <div className="space-y-1.5 pt-1">
          <h4 className="text-xs font-bold text-gray-900">Deskripsi</h4>
          <p className="text-sm leading-relaxed text-gray-700">
            {post.description}
          </p>
        </div>

        {/* Tombol Aksi */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          {waUrl && (
            <a
              href={waUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-black px-4 py-2 text-xs font-semibold text-white transition hover:bg-neutral-800"
            >
              <Phone size={14} />
              <span>Hubungi WhatsApp</span>
            </a>
          )}

          <button
            type="button"
            disabled={toggleBookmark.isPending}
            onClick={() => toggleBookmark.mutate(post.id)}
            className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-xs font-semibold transition ${
              post.isSaved
                ? 'border-[#e0531c] bg-orange-50 text-[#e0531c]'
                : 'border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Bookmark
              size={14}
              className={post.isSaved ? 'fill-[#e0531c]' : ''}
            />
            <span>{post.isSaved ? 'Tersimpan' : 'Simpan'}</span>
          </button>
        </div>
      </div>

      <hr className="border-gray-100" />

      {/* 5. Section Komentar */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-gray-900">
          Komentar ({comments.length})
        </h3>

        {loadingComments ? (
          <p className="text-xs text-gray-500">Memuat komentar...</p>
        ) : comments.length === 0 ? (
          <p className="rounded-lg bg-gray-50 px-4 py-4 text-center text-xs text-gray-500">
            Belum ada komentar. Tanyakan detail atau beri info jika kamu
            melihat barang ini.
          </p>
        ) : (
          <div className="space-y-3">
            {comments.map((item) => (
              <div
                key={item.id}
                className={`flex items-start gap-2.5 ${
                  item.isReply || item.parent_id ? 'ml-7' : ''
                }`}
              >
                <Avatar
                  src={item.avatar}
                  name={item.user}
                  className="h-7 w-7 shrink-0 text-[10px]"
                />
                <div className="flex-1 rounded-2xl bg-gray-50 px-3.5 py-2.5 text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-gray-900">{item.user}</span>
                    {!item.isReply && !item.parent_id && (
                      <button
                        type="button"
                        onClick={() => setReplyTo(item)}
                        className="inline-flex items-center gap-1 text-[11px] font-medium text-gray-500 hover:text-black"
                      >
                        <Reply size={12} />
                        Balas
                      </button>
                    )}
                  </div>
                  <p className="mt-0.5 leading-relaxed text-gray-700">
                    {item.text || item.content}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Input Form Komentar */}
        <form onSubmit={handleSendComment} className="space-y-2 pt-2">
          {replyTo && (
            <div className="flex items-center justify-between rounded-lg bg-gray-100 px-3 py-1.5 text-xs text-gray-600">
              <span>
                Membalas <strong>{replyTo.user}</strong>
              </span>
              <button
                type="button"
                onClick={() => setReplyTo(null)}
                className="text-gray-500 hover:text-black"
              >
                Batal
              </button>
            </div>
          )}
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder={
                replyTo
                  ? `Tulis balasan untuk ${replyTo.user}...`
                  : 'Tulis komentar...'
              }
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="flex-1 rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-xs text-gray-800 placeholder-gray-400 outline-none transition focus:border-black focus:bg-white"
            />
            <button
              type="submit"
              disabled={!commentText.trim() || createComment.isPending}
              className="inline-flex items-center gap-1.5 rounded-lg bg-black px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-500"
            >
              <Send size={13} />
              <span>{createComment.isPending ? 'Mengirim...' : 'Kirim'}</span>
            </button>
          </div>
        </form>
      </div>

      {isImageOpen && (
        <div
          className="fixed inset-0 z-[999] flex items-center justify-center bg-black/90 p-4"
          onClick={() => setIsImageOpen(false)}
        >
          <button
            type="button"
            aria-label="Tutup pratinjau gambar"
            onClick={() => setIsImageOpen(false)}
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
