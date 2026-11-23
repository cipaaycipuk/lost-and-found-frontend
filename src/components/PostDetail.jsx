import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Phone,
  Bookmark,
  CheckCircle2,
  MoreVertical,
  Clock,
  HandHeart,
} from 'lucide-react'
import Avatar from './Avatar'
import ClaimModal from './ClaimModal'
import ConfirmDialog from './ConfirmDialog'
import PostImageGrid from './PostImageGrid'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuth } from '../context/AuthContext'
import { formatWhatsAppUrl } from '../lib/formatters'
import {
  useDeletePostMutation,
  useToggleBookmarkMutation,
  useUpdatePostStatusMutation,
} from '../hooks/usePosts'
import { useCommentsQuery, useCreateCommentMutation } from '../hooks/useComments'

export default function PostDetail({ post, onBack }) {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [commentText, setCommentText] = useState('')
  const [replyTo, setReplyTo] = useState(null)
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)
  const [claimModalOpen, setClaimModalOpen] = useState(false)
  const isSubmittingRef = useRef(false)
  const commentInputRef = useRef(null)

  const isKehilangan = post.type === 'kehilangan'
  const isDone = post.status === 'selesai'
  const canManage = Boolean(user?.id) && String(user.id) === String(post.author?.id)

  const toggleBookmark = useToggleBookmarkMutation()
  const updateStatus = useUpdatePostStatusMutation()
  const deletePost = useDeletePostMutation()
  const { data: comments = [], isLoading: loadingComments } = useCommentsQuery(
    post.id
  )
  const createComment = useCreateCommentMutation(post.id)

  const waPhone =
    post.myClaim?.status === 'accepted'
      ? post.myClaim.owner_whatsapp || post.author?.whatsapp
      : canManage
        ? post.author?.whatsapp
        : null

  const waUrl = formatWhatsAppUrl(
    waPhone,
    `Halo ${post.author?.name || ''}, saya melihat laporan "${post.title}" di Lost & Found.`
  )

  // Kunci scroll halaman utama saat modal detail terbuka
  useEffect(() => {
    const prevHtmlOverflow = document.documentElement.style.overflow
    const prevBodyOverflow = document.body.style.overflow
    document.documentElement.style.overflow = 'hidden'
    document.body.style.overflow = 'hidden'

    return () => {
      document.documentElement.style.overflow = prevHtmlOverflow
      document.body.style.overflow = prevBodyOverflow
    }
  }, [])

  const handleSendComment = (e) => {
    e.preventDefault()
    const trimmed = commentText.trim()
    if (!trimmed || createComment.isPending || isSubmittingRef.current) return

    isSubmittingRef.current = true
    createComment.mutate(
      { content: trimmed, parentId: replyTo?.id || null },
      {
        onSuccess: () => {
          setCommentText('')
          setReplyTo(null)
        },
        onSettled: () => {
          isSubmittingRef.current = false
        },
      }
    )
  }

  const handleReplyClick = (item) => {
    setReplyTo(item)
    setTimeout(() => commentInputRef.current?.focus(), 0)
  }

  const sideBorderStyle = {
    borderLeftWidth: '5px',
    borderLeftColor: isKehilangan ? '#F05A00' : '#0026FF',
  }

  return (
    <>
      <article
        style={sideBorderStyle}
        className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl"
      >
        {/* 1. Bar Atas: <- Kembali */}
        <div className="border-b border-gray-200 px-5 py-3.5 sm:px-6">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 text-xs font-medium text-gray-500 transition hover:text-gray-900"
          >
            <ArrowLeft size={15} />
            <span>Kembali</span>
          </button>
        </div>

        {/* Seluruh Konten dalam 1 Kartu Menyatu */}
        <div className="space-y-5 p-5 sm:p-6">
          {/* 2. Header Author + Badge + Menu 3 Titik */}
          <div className="flex items-center justify-between gap-3">
            <div
              onClick={() => {
                if (!post.author?.id) return
                const targetPath =
                  user && String(user.id) === String(post.author.id)
                    ? '/profile'
                    : `/profile/${post.author.id}`
                navigate(targetPath, { state: { author: post.author } })
              }}
              className="group/author flex min-w-0 cursor-pointer items-center gap-3"
            >
              <Avatar
                src={post.author?.avatar}
                name={post.author?.name}
                className="h-10 w-10 shrink-0 text-sm transition group-hover/author:ring-2 group-hover/author:ring-black/20 sm:h-11 sm:w-11"
              />
              <div className="min-w-0">
                <h3 className="truncate text-sm font-bold text-gray-900 group-hover/author:underline">
                  {post.author?.name}
                </h3>
                <p className="text-xs text-gray-400">{post.timeAgo}</p>
              </div>
            </div>

            <div className="relative flex shrink-0 items-center gap-1.5 sm:gap-2">
              {isDone && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                  <CheckCircle2 size={13} />
                  Selesai
                </span>
              )}
              <span
                className={`rounded-full px-3.5 py-1 text-xs font-bold ${
                  isKehilangan
                    ? 'bg-[#FCEEE3] text-[#F05A00]'
                    : 'bg-[#E2E6FF] text-[#0026FF]'
                }`}
              >
                {post.typeLabel || (isKehilangan ? 'Kehilangan' : 'Ditemukan')}
              </span>

              {canManage && (
                <DropdownMenu>
                  <DropdownMenuTrigger
                    aria-label="Opsi laporan"
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full text-gray-700 outline-none transition hover:bg-gray-100"
                  >
                    <MoreVertical size={18} />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    sideOffset={6}
                    className="w-44 rounded-xl border border-gray-100 bg-white p-1 shadow-lg"
                  >
                    <DropdownMenuItem
                      disabled={updateStatus.isPending}
                      onClick={() =>
                        updateStatus.mutate({
                          id: post.id,
                          status: isDone ? 'open' : 'selesai',
                        })
                      }
                      className="cursor-pointer rounded-lg px-3 py-2 text-sm font-medium text-gray-900"
                    >
                      {isDone ? 'Buka kembali' : 'Tandai selesai'}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="my-0.5 bg-gray-100" />
                    <DropdownMenuItem
                      onClick={() =>
                        navigate(`/edit-laporan/${post.id}`, {
                          state: { editPost: post },
                        })
                      }
                      className="cursor-pointer rounded-lg px-3 py-2 text-sm font-medium text-gray-900"
                    >
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="my-0.5 bg-gray-100" />
                    <DropdownMenuItem
                      variant="destructive"
                      disabled={deletePost.isPending}
                      onClick={() => setConfirmDeleteOpen(true)}
                      className="cursor-pointer rounded-lg px-3 py-2 text-sm font-medium"
                    >
                      Hapus
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>

          {/* 3. Foto Barang (Grid Multi-Gambar) */}
          <PostImageGrid
            images={post.images}
            fallbackImage={post.image}
            title={post.title}
          />

          {/* 4. Judul & Tabel Informasi Detail */}
          <div className="space-y-3">
            <h1 className="text-lg font-bold text-gray-900 sm:text-xl">
              {post.title}
            </h1>

            <div className="divide-y divide-gray-200 border-b border-gray-200 text-xs sm:text-sm">
              <div className="grid grid-cols-12 py-2.5">
                <span className="col-span-5 text-gray-400 sm:col-span-4">
                  {isKehilangan ? 'Lokasi terakhir' : 'Lokasi ditemukan'}
                </span>
                <span className="col-span-7 font-medium text-gray-900 sm:col-span-8">
                  {post.location}
                </span>
              </div>
              <div className="grid grid-cols-12 py-2.5">
                <span className="col-span-5 text-gray-400 sm:col-span-4">
                  {isKehilangan ? 'Tanggal hilang' : 'Tanggal ditemukan'}
                </span>
                <span className="col-span-7 font-medium text-gray-900 sm:col-span-8">
                  {post.date}
                </span>
              </div>
              <div className="grid grid-cols-12 py-2.5">
                <span className="col-span-5 text-gray-400 sm:col-span-4">
                  Kategori
                </span>
                <span className="col-span-7 font-medium text-gray-900 sm:col-span-8">
                  {post.category}
                </span>
              </div>
              <div className="grid grid-cols-12 py-2.5">
                <span className="col-span-5 text-gray-400 sm:col-span-4">
                  Status
                </span>
                <span className="col-span-7 font-medium text-gray-900 sm:col-span-8">
                  {isDone
                    ? 'Selesai'
                    : isKehilangan
                      ? 'Masih dicari'
                      : 'Menunggu pemilik'}
                </span>
              </div>
            </div>

            {/* 5. Deskripsi */}
            <div className="space-y-1 pt-1">
              <h4 className="text-xs font-bold text-gray-900 sm:text-sm">
                Deskripsi
              </h4>
              <p className="whitespace-pre-line text-xs leading-relaxed text-gray-800 sm:text-sm">
                {post.description}
              </p>
            </div>

            {/* 6. Tombol Aksi */}
            <div className="flex flex-wrap items-center gap-2.5 pt-2">
              {!canManage && !isDone && (
                post.myClaim?.status === 'accepted' && waUrl ? (
                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex min-h-[36px] items-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700"
                  >
                    <Phone size={14} />
                    <span>Hubungi WhatsApp</span>
                  </a>
                ) : post.myClaim?.status === 'pending' ? (
                  <span className="inline-flex min-h-[36px] items-center gap-1.5 rounded-full bg-amber-50 px-4 py-2 text-xs font-semibold text-amber-800">
                    <Clock size={14} />
                    <span>Klaim Menunggu Konfirmasi</span>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      if (!user) {
                        navigate('/login')
                        return
                      }
                      setClaimModalOpen(true)
                    }}
                    className="inline-flex min-h-[36px] items-center gap-2 rounded-full bg-[#1C1C1C] px-4 py-2 text-xs font-semibold text-white transition hover:bg-neutral-800"
                  >
                    <HandHeart size={14} />
                    <span>
                      {post.reportMeta?.claim_action_label ||
                        (isKehilangan ? 'Saya Menemukan Ini' : 'Ajukan Klaim')}
                    </span>
                  </button>
                )
              )}

              <button
                type="button"
                disabled={toggleBookmark.isPending}
                onClick={() => toggleBookmark.mutate(post.id)}
                className={`inline-flex min-h-[36px] items-center gap-1.5 rounded-full border px-4 py-2 text-xs font-semibold transition ${
                  post.isSaved
                    ? 'border-[#F05A00] bg-orange-50 text-[#F05A00]'
                    : 'border-gray-300 bg-[#EFEFEF] text-gray-800 hover:bg-gray-200'
                }`}
              >
                <Bookmark
                  size={14}
                  className={post.isSaved ? 'fill-[#F05A00]' : ''}
                />
                <span>{post.isSaved ? 'Tersimpan' : 'Simpan'}</span>
              </button>
            </div>
          </div>

          <hr className="border-gray-200" />

          {/* 7. Section Komentar (dalam 1 kartu yang sama) */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-gray-900 sm:text-sm">
              Komentar ({comments.length})
            </h3>

            {loadingComments ? (
              <p className="text-xs text-gray-500">Memuat komentar...</p>
            ) : comments.length === 0 ? (
              <p className="py-2 text-xs text-gray-400">
                Belum ada komentar. Tanyakan detail atau beri info jika kamu
                melihat barang ini.
              </p>
            ) : (
              <div className="space-y-3.5">
                {comments.map((item) => {
                  const isReplyItem = Boolean(item.isReply || item.parent_id)

                  if (isReplyItem) {
                    return (
                      <div
                        key={item.id}
                        className="relative ml-4 flex items-start gap-2.5 pl-6 sm:ml-5"
                      >
                        <svg
                          aria-hidden="true"
                          viewBox="0 0 20 28"
                          fill="none"
                          className="pointer-events-none absolute -top-2.5 left-0 h-7 w-5 text-gray-300"
                        >
                          <path
                            d="M2 0V20C2 23.3137 4.68629 26 8 26H20"
                            stroke="currentColor"
                            strokeWidth="1.75"
                            strokeLinecap="round"
                          />
                        </svg>
                        <Avatar
                          src={item.avatar}
                          name={item.user}
                          className="h-8 w-8 shrink-0 text-xs"
                        />
                        <div className="min-w-0 flex-1 pt-0.5">
                          <p className="text-xs font-bold text-gray-900">
                            {item.user}
                          </p>
                          <p className="mt-0.5 text-xs leading-relaxed text-gray-700">
                            {item.text || item.content}
                          </p>
                        </div>
                      </div>
                    )
                  }

                  return (
                    <div key={item.id} className="flex items-start gap-3">
                      <Avatar
                        src={item.avatar}
                        name={item.user}
                        className="h-9 w-9 shrink-0 text-xs"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs font-bold text-gray-900 sm:text-sm">
                            {item.user}
                          </p>
                          <button
                            type="button"
                            onClick={() => handleReplyClick(item)}
                            className="text-[11px] font-medium text-gray-400 transition hover:text-gray-900"
                          >
                            Balas
                          </button>
                        </div>
                        <p className="mt-0.5 text-xs leading-relaxed text-gray-700 sm:text-sm">
                          {item.text || item.content}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* 8. Input Komentar Terpadu */}
            <form onSubmit={handleSendComment} className="space-y-1.5 pt-2">
              {replyTo && (
                <div className="flex items-center justify-between rounded-md bg-gray-100 px-3 py-1 text-xs text-gray-600">
                  <span>
                    Membalas <strong>{replyTo.user}</strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => setReplyTo(null)}
                    className="font-semibold text-gray-500 hover:text-black"
                  >
                    Batal
                  </button>
                </div>
              )}

              <div className="flex items-center rounded-lg bg-[#EFEFEF] px-3.5 py-2.5 focus-within:bg-gray-200/70">
                <input
                  ref={commentInputRef}
                  type="text"
                  placeholder={
                    replyTo
                      ? `Balas komentar ${replyTo.user}...`
                      : 'Tulis komentar...'
                  }
                  value={commentText}
                  disabled={createComment.isPending}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="min-w-0 flex-1 bg-transparent text-xs text-gray-900 placeholder-gray-400 outline-none sm:text-sm"
                />
                <button
                  type="submit"
                  disabled={!commentText.trim() || createComment.isPending}
                  className="ml-3 shrink-0 text-xs font-bold text-gray-900 transition hover:text-[#F05A00] disabled:cursor-not-allowed disabled:text-gray-400 sm:text-sm"
                >
                  {createComment.isPending ? '...' : 'Kirim'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </article>

      <ClaimModal
        open={claimModalOpen}
        post={post}
        onClose={() => setClaimModalOpen(false)}
      />

      <ConfirmDialog
        open={confirmDeleteOpen}
        title="Yakin Hapus Laporan?"
        description={`Laporan "${post.title}" akan dipindahkan ke sampah dan masih bisa dipulihkan kembali dari halaman Profil.`}
        confirmLabel="Ya, Hapus"
        loading={deletePost.isPending}
        onConfirm={() =>
          deletePost.mutate(post.id, {
            onSuccess: () => {
              setConfirmDeleteOpen(false)
              onBack?.()
            },
          })
        }
        onCancel={() => setConfirmDeleteOpen(false)}
      />
    </>
  )
}
