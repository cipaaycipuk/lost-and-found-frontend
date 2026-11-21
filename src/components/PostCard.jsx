import { useNavigate } from 'react-router-dom'
import {
  MapPin,
  CalendarDays,
  MessageSquare,
  Bookmark,
  CheckCircle2,
  MoreVertical,
} from 'lucide-react'
import Avatar from './Avatar'
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

export default function PostCard({ post, isOwner = false, onSelect }) {
  const navigate = useNavigate()
  const { user } = useAuth()
  const isKehilangan = post.type === 'kehilangan'
  const isDone = post.status === 'selesai'
  const canManage =
    isOwner || (Boolean(user?.id) && String(user.id) === String(post.author?.id))

  const toggleBookmark = useToggleBookmarkMutation()
  const updateStatus = useUpdatePostStatusMutation()
  const deletePost = useDeletePostMutation()

  const handleOpenPost = () => {
    if (onSelect) {
      onSelect(post)
      return
    }
    navigate(`/posts/${post.id}`, { state: { post } })
  }

  const handleOpenAuthorProfile = (e) => {
    e.stopPropagation()
    if (!post.author?.id) return
    const targetPath =
      user && String(user.id) === String(post.author.id)
        ? '/profile'
        : `/profile/${post.author.id}`
    navigate(targetPath, { state: { author: post.author } })
  }

  const waUrl = formatWhatsAppUrl(
    post.author?.whatsapp,
    `Halo ${post.author?.name || ''}, saya melihat laporan "${post.title}" di Lost & Found.`
  )

  const sideBorderStyle = {
    borderLeftWidth: '5px',
    borderLeftColor: isKehilangan ? '#F05A00' : '#0026FF',
  }

  return (
    <article
      onClick={handleOpenPost}
      style={sideBorderStyle}
      className={`cursor-pointer space-y-3.5 rounded-xl border border-gray-200/90 bg-white p-4 shadow-sm transition hover:border-gray-300 hover:shadow-md sm:space-y-4 sm:p-5 ${
        isDone ? 'opacity-85' : ''
      }`}
    >
      {/* Header Post */}
      <div className="flex items-center justify-between gap-2 sm:gap-3">
        <div
          onClick={handleOpenAuthorProfile}
          className="group/author flex min-w-0 cursor-pointer items-center gap-2.5 sm:gap-3"
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

        <div
          onClick={(e) => e.stopPropagation()}
          className="relative flex shrink-0 items-center gap-1.5 sm:gap-2"
        >
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
                  onClick={() => deletePost.mutate(post.id)}
                  className="cursor-pointer rounded-lg px-3 py-2 text-sm font-medium"
                >
                  Hapus
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Foto Barang (Grid Multi-Gambar) */}
      <PostImageGrid
        images={post.images}
        fallbackImage={post.image}
        title={post.title}
      />

      {/* Detail Konten */}
      <div className="space-y-2.5">
        <h2 className="text-base font-bold leading-snug text-gray-900 sm:text-lg">
          {post.title}
        </h2>

        <div className="flex flex-wrap gap-1.5 text-xs sm:gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-gray-300 bg-[#EFEFEF] px-3 py-1 font-medium text-gray-500">
            <MapPin size={13} className="text-gray-400" />
            {post.location}
          </span>

          <span className="inline-flex items-center gap-1.5 rounded-full border border-gray-300 bg-[#EFEFEF] px-3 py-1 font-medium text-gray-500">
            <CalendarDays size={13} className="text-gray-400" />
            {post.date}
          </span>

          <span className="inline-flex items-center gap-1.5 rounded-full border border-gray-300 bg-[#EFEFEF] px-3 py-1 font-medium text-gray-500">
            {post.category}
          </span>
        </div>

        <p className="line-clamp-3 text-sm leading-relaxed text-gray-800">
          {post.description}
        </p>
      </div>

      {/* Footer Post */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-200 pt-3"
      >
        <div className="flex items-center gap-4 text-xs font-medium text-gray-400 sm:gap-5 sm:text-sm">
          <button
            type="button"
            onClick={handleOpenPost}
            className="flex min-h-[36px] items-center gap-1.5 transition hover:text-gray-900"
          >
            <MessageSquare size={16} />
            <span className="tabular-nums">{post.commentsCount || 0}</span>
          </button>

          <button
            type="button"
            disabled={toggleBookmark.isPending}
            onClick={() => toggleBookmark.mutate(post.id)}
            className={`flex min-h-[36px] items-center gap-1.5 transition ${
              post.isSaved ? 'font-semibold text-[#F05A00]' : 'hover:text-gray-900'
            }`}
          >
            <Bookmark
              size={16}
              className={post.isSaved ? 'fill-[#F05A00]' : ''}
            />
            <span>{post.isSaved ? 'Tersimpan' : 'Simpan'}</span>
          </button>
        </div>

        {waUrl && (
          <a
            href={waUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-[36px] items-center gap-2 rounded-full bg-[#1C1C1C] px-4 py-2 text-xs font-semibold text-white transition hover:bg-neutral-800"
          >
            <MessageSquare size={14} />
            Hubungi Whatsapp
          </a>
        )}
      </div>
    </article>
  )
}
