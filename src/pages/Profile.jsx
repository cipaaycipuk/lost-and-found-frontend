import { useMemo, useState } from 'react'
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import {
  AlertCircle,
  ArrowLeft,
  Camera,
  Check,
  ChevronDown,
  Clock,
  Loader2,
  Mail,
  Phone,
  X,
} from 'lucide-react'
import { toast } from 'sonner'
import Avatar from '../components/Avatar'
import ConfirmDialog from '../components/ConfirmDialog'
import PostCard from '../components/PostCard'
import PostDetailModal from '../components/PostDetailModal'
import { useAuth } from '../context/AuthContext'
import {
  useMyPostsQuery,
  useSavedPostsQuery,
  useUserOpenPostsQuery,
} from '../hooks/usePosts'
import { useMyClaimsQuery, useRespondClaimMutation } from '../hooks/useClaims'
import { currentUser as fallbackDummyUser } from '../lib/dummyData'
import { formatTimeAgo, formatWhatsAppUrl, resolveMediaUrl } from '../lib/formatters'

function normalizeClaimStatus(rawStatus) {
  const s = String(rawStatus || 'pending').trim().toLowerCase()
  if (s === 'accepted' || s === 'approved' || s === 'diterima' || s === 'disetujui') {
    return 'accepted'
  }
  if (s === 'rejected' || s === 'declined' || s === 'ditolak') {
    return 'rejected'
  }
  return 'pending'
}

function groupClaimsByPost(list) {
  const map = new Map()
  list.forEach((claim) => {
    const pid = String(claim.post?.id || claim.post_id || claim.id)
    if (!map.has(pid)) {
      map.set(pid, {
        postId: pid,
        post: claim.post || {
          id: pid,
          title: `Laporan #${pid}`,
          type: 'kehilangan',
          image: null,
        },
        claims: [],
      })
    }
    map.get(pid).claims.push(claim)
  })
  return Array.from(map.values())
}

function ClaimGroupCard({
  group,
  isReceived,
  isPending,
  respondDisabled,
  onRespond,
  onOpenPost,
}) {
  const isKehilangan = group.post?.type !== 'ditemukan'
  const thumbUrl = resolveMediaUrl(group.post?.image || group.post?.images?.[0])
  const hasAccepted = group.claims.some((c) => c.normalizedStatus === 'accepted')

  const headerStatus = !isPending
    ? hasAccepted
      ? 'Selesai • Diterima'
      : group.post?.status === 'selesai'
        ? 'Selesai • Ditolak'
        : 'Ditolak'
    : null

  return (
    <div
      style={{
        borderLeftWidth: '5px',
        borderLeftColor: isKehilangan ? '#F05A00' : '#0026FF',
      }}
      className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
    >
      <div className="flex items-center justify-between gap-3 border-b border-gray-200 px-4 py-3 sm:px-5">
        <button
          type="button"
          onClick={() => group.post?.id && onOpenPost(group.post)}
          className="group/post flex min-w-0 items-center gap-3 text-left"
        >
          {thumbUrl && (
            <img
              src={thumbUrl}
              alt={group.post?.title}
              className="h-10 w-10 shrink-0 rounded-lg object-cover"
            />
          )}
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <h3 className="truncate text-sm font-bold text-gray-900 group-hover/post:underline sm:text-base">
              {group.post?.title}
            </h3>
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                isKehilangan
                  ? 'bg-[#FCEEE3] text-[#c84615]'
                  : 'bg-[#E2E6FF] text-[#0022CC]'
              }`}
            >
              {isKehilangan ? 'Kehilangan' : 'Ditemukan'}
            </span>
          </div>
        </button>

        {isPending ? (
          isReceived ? (
            <span className="shrink-0 text-xs text-gray-500 tabular-nums">
              {group.claims.length} pengajuan menunggu
            </span>
          ) : (
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800">
              <Clock size={12} />
              Menunggu
            </span>
          )
        ) : (
          <span className="shrink-0 text-xs text-gray-500">{headerStatus}</span>
        )}
      </div>

      <div className="divide-y divide-gray-200">
        {group.claims.map((claim) => {
          const person = isReceived
            ? claim.claimer || claim.claimant || claim.user
            : claim.owner || claim.post_owner || group.post?.author || group.post?.user

          const phone = isReceived
            ? person?.whatsapp || claim.contact_whatsapp
            : claim.owner_whatsapp || person?.whatsapp || person?.contact
          const email = isReceived ? person?.email : claim.owner_email || person?.email

          const isAccepted = claim.normalizedStatus === 'accepted'
          const waUrl = isAccepted
            ? formatWhatsAppUrl(
                phone,
                `Halo ${person?.name || ''}, terkait klaim laporan "${group.post?.title || ''}" di Lost & Found.`
              )
            : null
          const mailUrl =
            isAccepted && !waUrl && email
              ? `mailto:${email}?subject=${encodeURIComponent(`Klaim Lost & Found: ${group.post?.title || ''}`)}`
              : null

          const timeLabel = formatTimeAgo(
            !isPending
              ? claim.responded_at || claim.updated_at || claim.created_at || claim.createdAt
              : claim.created_at || claim.createdAt
          )

          return (
            <div
              key={claim.id}
              className="flex flex-col justify-between gap-3 px-4 py-3 sm:flex-row sm:items-center sm:px-5"
            >
              <div className="flex min-w-0 items-start gap-3">
                {(isReceived || person?.name) && (
                  <Avatar
                    src={person?.avatar_url || person?.avatar}
                    name={person?.name}
                    className="h-9 w-9 shrink-0 text-xs"
                  />
                )}
                <div className="min-w-0">
                  {isPending ? (
                    <>
                      <p className="text-xs text-gray-600 sm:text-sm">
                        {isReceived ? (
                          <>
                            <strong className="font-bold text-gray-900">
                              {person?.name || 'Pengguna'}
                            </strong>{' '}
                            {isKehilangan
                              ? 'melaporkan telah menemukan barang ini'
                              : 'mengajukan klaim atas barang ini'}
                          </>
                        ) : person?.name ? (
                          <>
                            Diajukan kepada{' '}
                            <strong className="font-bold text-gray-900">
                              {person.name}
                            </strong>
                          </>
                        ) : isKehilangan ? (
                          'Anda melaporkan penemuan barang ini'
                        ) : (
                          'Anda mengajukan klaim kepemilikan barang ini'
                        )}
                      </p>
                      <p className="mt-0.5 text-[11px] text-gray-500">
                        {timeLabel} •{' '}
                        {isReceived
                          ? 'Lanjut di verifikasi via Whatsapp'
                          : `Menunggu konfirmasi ${isKehilangan ? 'pemilik' : 'penemu'}`}
                      </p>
                      {claim.message && (
                        <p className="mt-1 text-xs text-gray-600">
                          &ldquo;{claim.message}&rdquo;
                        </p>
                      )}
                    </>
                  ) : (
                    <>
                      <p className="text-xs font-bold text-gray-900 sm:text-sm">
                        {person?.name || (isReceived ? 'Pengguna' : 'Pemilik Laporan')}
                      </p>
                      <p className="text-[11px] text-gray-500">
                        {isAccepted ? 'Diterima' : 'Ditolak'} • {timeLabel}
                      </p>
                      {!isReceived && claim.owner_note && (
                        <p className="mt-1 text-xs text-gray-600">
                          Catatan: &ldquo;{claim.owner_note}&rdquo;
                        </p>
                      )}
                    </>
                  )}
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-2 self-end sm:self-center">
                {isPending && isReceived && (
                  <>
                    <button
                      type="button"
                      disabled={respondDisabled}
                      onClick={() => onRespond(claim, group.post, 'rejected')}
                      className="rounded-full border border-gray-300 bg-white px-4 py-1.5 text-xs font-semibold text-gray-800 transition hover:bg-gray-50 disabled:opacity-50"
                    >
                      Tolak
                    </button>
                    <button
                      type="button"
                      disabled={respondDisabled}
                      onClick={() => onRespond(claim, group.post, 'accepted')}
                      className="rounded-full bg-[#1C1C1C] px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-neutral-800 disabled:opacity-50"
                    >
                      Terima
                    </button>
                  </>
                )}

                {isPending && !isReceived && group.post?.id && (
                  <button
                    type="button"
                    onClick={() => onOpenPost(group.post)}
                    className="rounded-full border border-gray-300 bg-white px-4 py-1.5 text-xs font-semibold text-gray-800 transition hover:bg-gray-50"
                  >
                    Lihat Laporan
                  </button>
                )}

                {!isPending &&
                  (waUrl ? (
                    <a
                      href={waUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-full bg-[#1C1C1C] px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-neutral-800"
                    >
                      <Phone size={13} />
                      Hubungi WhatsApp
                    </a>
                  ) : mailUrl ? (
                    <a
                      href={mailUrl}
                      className="inline-flex items-center gap-1.5 rounded-full border border-gray-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-gray-800 transition hover:bg-gray-50"
                    >
                      <Mail size={13} />
                      Hubungi Email
                    </a>
                  ) : (
                    !isReceived &&
                    isAccepted &&
                    group.post?.id && (
                      <button
                        type="button"
                        onClick={() => onOpenPost(group.post)}
                        className="rounded-full border border-gray-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-gray-800 transition hover:bg-gray-50"
                      >
                        Lihat Laporan
                      </button>
                    )
                  ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function Profile() {
  const { userId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const queryClient = useQueryClient()
  const { user, isAuthenticated, updateProfile, logout } = useAuth()

  const isOwnProfile =
    !userId || (isAuthenticated && user && String(user.id) === String(userId))

  const rawTab = searchParams.get('tab') || location.state?.activeTab || 'posts'
  const activeTab =
    isOwnProfile && ['posts', 'saved', 'claims'].includes(rawTab) ? rawTab : 'posts'
  const rawSub = searchParams.get('sub') || location.state?.claimSubTab || 'received'
  const claimSubTab = rawSub === 'submitted' ? 'submitted' : 'received'

  const setTabParams = (nextTab, nextSub = claimSubTab) => {
    const next = new URLSearchParams(searchParams)
    if (nextTab === 'posts') {
      next.delete('tab')
      next.delete('sub')
    } else {
      next.set('tab', nextTab)
      if (nextTab === 'claims' && nextSub === 'submitted') {
        next.set('sub', 'submitted')
      } else {
        next.delete('sub')
      }
    }
    setSearchParams(next, { replace: true })
  }

  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState('')
  const [editWhatsapp, setEditWhatsapp] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const [claimConfirm, setClaimConfirm] = useState(null)
  const [selectedPost, setSelectedPost] = useState(null)

  const { data: myPosts = [], isLoading: loadingMine } = useMyPostsQuery(
    isOwnProfile && isAuthenticated
  )
  const { data: savedPosts = [], isLoading: loadingSaved } = useSavedPostsQuery(
    isOwnProfile && isAuthenticated
  )
  const { data: claimsData = { submitted: [], received: [] }, isLoading: loadingClaims } =
    useMyClaimsQuery(isOwnProfile && isAuthenticated)
  const { data: publicProfileData, isLoading: loadingOther } =
    useUserOpenPostsQuery(isOwnProfile ? null : userId)

  const respondClaim = useRespondClaimMutation()

  const otherUserPosts = publicProfileData?.posts || []
  const activeUser = isOwnProfile
    ? user || fallbackDummyUser
    : publicProfileData?.user ||
      location.state?.author || {
        id: userId,
        name: 'Pengguna Kampus',
        avatar: '',
      }

  const missingPhone =
    isOwnProfile && isAuthenticated && !String(activeUser.whatsapp || '').trim()

  // Laporan aktif ditaruh di atas laporan selesai agar tidak perlu scroll jauh
  const sortedMyPosts = useMemo(
    () =>
      [...myPosts].sort(
        (a, b) => Number(a.status === 'selesai') - Number(b.status === 'selesai')
      ),
    [myPosts]
  )

  const activeModalPost = useMemo(() => {
    if (!selectedPost) return null
    const allCached = [...myPosts, ...savedPosts, ...otherUserPosts]
    return (
      allCached.find((p) => String(p.id) === String(selectedPost.id)) || selectedPost
    )
  }, [selectedPost, myPosts, savedPosts, otherUserPosts])

  const handleOpenClaimPost = (postRef) => {
    const cached = [...myPosts, ...savedPosts].find(
      (p) => String(p.id) === String(postRef.id)
    )
    if (cached) {
      setSelectedPost(cached)
    } else if (postRef?.id) {
      navigate(`/posts/${postRef.id}`)
    }
  }

  const {
    pendingReceived,
    historyReceived,
    pendingSubmitted,
    historySubmitted,
    totalClaimsCount,
  } = useMemo(() => {
    const rec = (claimsData.received || []).map((c) => ({
      ...c,
      normalizedStatus: normalizeClaimStatus(c.status),
    }))
    const sub = (claimsData.submitted || []).map((c) => ({
      ...c,
      normalizedStatus: normalizeClaimStatus(c.status),
    }))
    return {
      pendingReceived: rec.filter((c) => c.normalizedStatus === 'pending'),
      historyReceived: rec.filter((c) => c.normalizedStatus !== 'pending'),
      pendingSubmitted: sub.filter((c) => c.normalizedStatus === 'pending'),
      historySubmitted: sub.filter((c) => c.normalizedStatus !== 'pending'),
      totalClaimsCount: rec.length + sub.length,
    }
  }, [claimsData])

  const isReceivedTab = claimSubTab === 'received'
  const activePendingGroups = useMemo(
    () => groupClaimsByPost(isReceivedTab ? pendingReceived : pendingSubmitted),
    [isReceivedTab, pendingReceived, pendingSubmitted]
  )
  const activeHistoryGroups = useMemo(
    () => groupClaimsByPost(isReceivedTab ? historyReceived : historySubmitted),
    [isReceivedTab, historyReceived, historySubmitted]
  )

  const TABS = isOwnProfile
    ? [
        { key: 'posts', label: 'Postingan', count: myPosts.length },
        { key: 'saved', label: 'Tersimpan', count: savedPosts.length },
        { key: 'claims', label: 'Klaim', count: totalClaimsCount },
      ]
    : [{ key: 'posts', label: 'Postingan Aktif', count: otherUserPosts.length }]

  const doneCount = isOwnProfile
    ? myPosts.filter((post) => post.status === 'selesai').length
    : 0

  const handleStartEdit = () => {
    setEditName(activeUser.name || '')
    setEditWhatsapp(activeUser.whatsapp || '')
    setIsEditing(true)
  }

  const handleSaveInline = async () => {
    const trimmedName = editName.trim()
    const trimmedWa = editWhatsapp.trim()

    if (!trimmedName) {
      toast.error('Nama lengkap tidak boleh kosong.')
      return
    }
    if (!trimmedWa) {
      toast.error('Nomor WhatsApp wajib diisi agar dapat dihubungi.')
      return
    }

    try {
      setIsSaving(true)
      const formData = new FormData()
      formData.append('name', trimmedName)
      formData.append('whatsapp', trimmedWa)
      const promise = updateProfile(formData)
      toast.promise(promise, {
        loading: 'Menyimpan perubahan profil...',
        success: 'Profil berhasil diperbarui!',
        error: (err) => err?.message || 'Gagal memperbarui profil.',
      })
      await promise
      setIsEditing(false)
    } catch {
      // Handled by toast.promise
    } finally {
      setIsSaving(false)
    }
  }

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Ukuran foto maksimal 5MB.')
      return
    }

    try {
      setIsUploadingAvatar(true)
      const formData = new FormData()
      formData.append('avatar', file)
      const promise = updateProfile(formData)
      toast.promise(promise, {
        loading: 'Mengunggah foto profil...',
        success: 'Foto profil berhasil diperbarui!',
        error: (err) => err?.message || 'Gagal mengganti foto profil.',
      })
      await promise
    } catch {
      // Handled by toast.promise
    } finally {
      setIsUploadingAvatar(false)
    }
  }

  const handleLogout = async () => {
    const promise = logout()
    toast.promise(promise, {
      loading: 'Keluar dari akun...',
      success: 'Berhasil keluar akun.',
      error: 'Gagal keluar akun.',
    })
    await promise
    queryClient.clear()
    navigate('/login')
  }

  const postList =
    activeTab === 'saved'
      ? savedPosts
      : isOwnProfile
        ? sortedMyPosts
        : otherUserPosts
  const loadingList =
    activeTab === 'saved'
      ? loadingSaved
      : isOwnProfile
        ? loadingMine
        : loadingOther

  return (
    <div className="mx-auto max-w-4xl px-4 pb-12 pt-5 sm:pt-7 lg:px-8">
      {!isOwnProfile && (
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-4 inline-flex items-center gap-2 text-xs font-semibold text-gray-600 transition hover:text-black"
        >
          <ArrowLeft size={16} />
          <span>Kembali</span>
        </button>
      )}

      {missingPhone && (
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-xs text-amber-900">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-amber-600" />
            <span>
              Lengkapi nomor WhatsApp agar pengguna dapat menghubungi Anda saat klaim diterima.
            </span>
          </div>
          {!isEditing && (
            <button
              type="button"
              onClick={handleStartEdit}
              className="rounded-lg bg-amber-600 px-3 py-1.5 font-semibold text-white transition hover:bg-amber-700"
            >
              Isi Sekarang
            </button>
          )}
        </div>
      )}

      {/* Header Profil Ringkas */}
      <section className="flex flex-row items-center gap-4 text-left sm:gap-6">
        <div className="group relative shrink-0">
          <Avatar
            src={activeUser.avatar_url || activeUser.avatar}
            name={activeUser.name}
            className="size-16 text-xl sm:size-24 sm:text-3xl"
          />

          {isOwnProfile && isEditing && (
            <label
              className={`absolute inset-0 flex cursor-pointer flex-col items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-[2px] transition-opacity ${
                isUploadingAvatar
                  ? 'pointer-events-none opacity-100'
                  : 'opacity-90 hover:opacity-100'
              }`}
            >
              {isUploadingAvatar ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <Camera className="h-5 w-5" />
                  <span className="mt-1 text-[10px] font-semibold">Foto</span>
                </>
              )}
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png"
                disabled={isUploadingAvatar}
                onChange={handleAvatarChange}
                className="hidden"
              />
            </label>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-col items-start gap-2.5 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0 flex-1">
              {isEditing ? (
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Nama Lengkap"
                  autoFocus
                  className="w-full max-w-sm border-b-2 border-black bg-transparent pb-0.5 text-lg font-bold outline-none sm:text-2xl"
                />
              ) : (
                <h1 className="truncate text-lg font-bold text-gray-900 sm:text-2xl">
                  {activeUser.name}
                </h1>
              )}

              {isOwnProfile ? (
                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-600 sm:text-sm">
                  {activeUser.email && (
                    <span className="break-all sm:break-normal">{activeUser.email}</span>
                  )}
                  {activeUser.email && <span className="hidden text-gray-300 sm:inline">•</span>}
                  {isEditing ? (
                    <label className="inline-flex items-center gap-1.5">
                      <span>WA:</span>
                      <input
                        type="tel"
                        value={editWhatsapp}
                        onChange={(e) => setEditWhatsapp(e.target.value)}
                        placeholder="081234567890"
                        className="w-36 border-b-2 border-black bg-transparent pb-0.5 font-medium text-gray-900 outline-none sm:w-44"
                      />
                    </label>
                  ) : (
                    <span>
                      WA:{' '}
                      <span
                        className={
                          activeUser.whatsapp
                            ? 'font-medium text-gray-800'
                            : 'italic text-amber-700'
                        }
                      >
                        {activeUser.whatsapp || 'Belum diisi'}
                      </span>
                    </span>
                  )}
                </div>
              ) : (
                <p className="mt-0.5 text-xs text-gray-500 sm:text-sm">
                  Profil Publik Kampus Widyatama
                </p>
              )}
            </div>

            {isOwnProfile && (
              <div className="flex shrink-0 items-center gap-2">
                {isEditing ? (
                  <>
                    <button
                      type="button"
                      disabled={isSaving}
                      onClick={handleSaveInline}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-black px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-neutral-800 disabled:opacity-60 sm:text-sm"
                    >
                      <Check size={14} />
                      {isSaving ? 'Menyimpan...' : 'Simpan'}
                    </button>
                    <button
                      type="button"
                      disabled={isSaving}
                      onClick={() => setIsEditing(false)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-50 sm:text-sm"
                    >
                      <X size={14} />
                      Batal
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={handleStartEdit}
                      className="rounded-lg border border-neutral-700 px-3.5 py-1.5 text-xs font-semibold transition hover:bg-white sm:px-4 sm:text-sm"
                    >
                      Edit Profil
                    </button>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="rounded-lg border border-red-300 bg-red-50 px-3.5 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-100 sm:text-sm"
                    >
                      Logout
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          <p className="mt-2 text-xs font-medium text-gray-600 tabular-nums sm:text-sm">
            {isOwnProfile ? (
              <>
                <span className="font-semibold text-gray-900">{myPosts.length}</span> postingan
                <span className="mx-2 text-gray-300">•</span>
                <span className="font-semibold text-gray-900">{doneCount}</span> selesai
              </>
            ) : (
              <>
                <span className="font-semibold text-gray-900">{otherUserPosts.length}</span>{' '}
                postingan aktif
              </>
            )}
          </p>
        </div>
      </section>

      {/* Tab Bar */}
      <div
        role="tablist"
        className="mt-5 flex gap-5 overflow-x-auto border-b border-gray-300 pt-1 sm:mt-6 sm:gap-8"
      >
        {TABS.map((tab) => {
          const isActive = tab.key === activeTab
          return (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setTabParams(tab.key)}
              className={`-mb-px shrink-0 border-b-2 pb-2.5 text-sm tabular-nums transition-colors sm:text-base ${
                isActive
                  ? 'border-black font-bold text-gray-900'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          )
        })}
      </div>

      {/* Konten Tab */}
      <div className="mt-5 space-y-4">
        {activeTab !== 'claims' ? (
          loadingList ? (
            <p className="py-10 text-center text-sm text-gray-500">Memuat daftar laporan...</p>
          ) : postList.length === 0 ? (
            <p className="rounded-xl border border-gray-200 bg-white px-4 py-10 text-center text-sm text-gray-500">
              {activeTab === 'saved'
                ? 'Belum ada laporan tersimpan.'
                : isOwnProfile
                  ? 'Belum ada postingan.'
                  : 'Belum ada laporan aktif dari pengguna ini.'}
            </p>
          ) : (
            postList.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                isOwner={isOwnProfile && activeTab === 'posts'}
                onSelect={(p) => setSelectedPost(p)}
              />
            ))
          )
        ) : loadingClaims ? (
          <p className="py-10 text-center text-sm text-gray-500">Memuat daftar klaim...</p>
        ) : (
          <div className="space-y-5">
            {/* Pill Switcher: Masuk | Diajukan */}
            <div
              role="tablist"
              aria-label="Kategori klaim"
              className="inline-flex items-center gap-1 rounded-xl border border-gray-200/80 bg-white p-1 shadow-sm"
            >
              <button
                type="button"
                role="tab"
                aria-selected={isReceivedTab}
                onClick={() => setTabParams('claims', 'received')}
                className={`rounded-lg px-4 py-1.5 text-xs font-semibold tabular-nums transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900/20 sm:text-sm ${
                  isReceivedTab
                    ? 'bg-[#2B2B2B] text-white'
                    : 'text-gray-800 hover:bg-gray-100'
                }`}
              >
                Masuk ({pendingReceived.length})
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={!isReceivedTab}
                onClick={() => setTabParams('claims', 'submitted')}
                className={`rounded-lg px-4 py-1.5 text-xs font-semibold tabular-nums transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900/20 sm:text-sm ${
                  !isReceivedTab
                    ? 'bg-[#2B2B2B] text-white'
                    : 'text-gray-800 hover:bg-gray-100'
                }`}
              >
                Diajukan ({pendingSubmitted.length})
              </button>
            </div>

            {activePendingGroups.length === 0 && activeHistoryGroups.length === 0 ? (
              <p className="rounded-xl border border-gray-200 bg-white px-4 py-10 text-center text-sm text-gray-500">
                {isReceivedTab
                  ? 'Belum ada klaim masuk pada laporan Anda.'
                  : 'Anda belum pernah mengajukan klaim pada laporan mana pun.'}
              </p>
            ) : (
              <div className="space-y-6">
                {/* MENUNGGU KONFIRMASI */}
                <div className="space-y-2.5">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                    Menunggu Konfirmasi
                  </h2>
                  {activePendingGroups.length === 0 ? (
                    <p className="rounded-xl border border-dashed border-gray-200 bg-white/70 px-4 py-3 text-xs text-gray-500">
                      {isReceivedTab
                        ? 'Tidak ada klaim masuk yang menunggu konfirmasi saat ini.'
                        : 'Tidak ada pengajuan Anda yang sedang menunggu konfirmasi.'}
                    </p>
                  ) : (
                    <div className="space-y-3.5">
                      {activePendingGroups.map((group) => (
                        <ClaimGroupCard
                          key={`pending-${claimSubTab}-${group.postId}`}
                          group={group}
                          isReceived={isReceivedTab}
                          isPending
                          respondDisabled={respondClaim.isPending}
                          onOpenPost={handleOpenClaimPost}
                          onRespond={(claim, post, status) =>
                            setClaimConfirm({
                              claim,
                              postTitle: post?.title,
                              postType: post?.type,
                              status,
                            })
                          }
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* RIWAYAT: otomatis terbuka jika tidak ada pending, ringkas (collapsible) jika sedang ada pending */}
                {activeHistoryGroups.length > 0 && (
                  <details
                    key={`history-details-${claimSubTab}-${activePendingGroups.length === 0}`}
                    open={activePendingGroups.length === 0}
                    className="group space-y-2.5"
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between py-1 text-xs font-bold uppercase tracking-wider text-gray-500 select-none hover:text-gray-800 [&::-webkit-details-marker]:hidden">
                      <span>
                        Riwayat (
                        {(isReceivedTab ? historyReceived : historySubmitted).length})
                      </span>
                      <ChevronDown
                        size={15}
                        className="transition-transform duration-150 group-open:rotate-180"
                      />
                    </summary>
                    <div className="space-y-3.5 pt-1">
                      {activeHistoryGroups.map((group) => (
                        <ClaimGroupCard
                          key={`history-${claimSubTab}-${group.postId}`}
                          group={group}
                          isReceived={isReceivedTab}
                          isPending={false}
                          respondDisabled={respondClaim.isPending}
                          onOpenPost={handleOpenClaimPost}
                          onRespond={() => {}}
                        />
                      ))}
                    </div>
                  </details>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {activeModalPost && (
        <PostDetailModal
          post={activeModalPost}
          onClose={() => setSelectedPost(null)}
        />
      )}

      <ConfirmDialog
        open={Boolean(claimConfirm)}
        variant={claimConfirm?.status === 'rejected' ? 'danger' : 'warning'}
        title={
          claimConfirm?.status === 'accepted'
            ? claimConfirm?.postType === 'kehilangan'
              ? 'Terima laporan penemuan?'
              : 'Terima pengajuan klaim?'
            : claimConfirm?.postType === 'kehilangan'
              ? 'Tolak laporan penemuan?'
              : 'Tolak pengajuan klaim?'
        }
        description={
          claimConfirm?.status === 'accepted' ? (
            <>
              Klaim dari{' '}
              <strong className="font-bold text-gray-900">
                {(claimConfirm.claim.claimer || claimConfirm.claim.claimant)?.name}
              </strong>{' '}
              untuk laporan{' '}
              <strong className="font-bold text-gray-900">
                &ldquo;{claimConfirm.postTitle}&rdquo;
              </strong>{' '}
              akan diterima, dan laporan ditandai selesai.
            </>
          ) : (
            <>
              Klaim dari{' '}
              <strong className="font-bold text-gray-900">
                {(claimConfirm?.claim?.claimer || claimConfirm?.claim?.claimant)?.name}
              </strong>{' '}
              untuk laporan{' '}
              <strong className="font-bold text-gray-900">
                &ldquo;{claimConfirm?.postTitle}&rdquo;
              </strong>{' '}
              akan ditolak.
            </>
          )
        }
        subDescription={
          claimConfirm?.status === 'accepted'
            ? 'Pengajuan lain pada laporan ini otomatis ditolak. Selanjutnya lakukan konfirmasi melalui WhatsApp.'
            : 'Pengguna tidak dapat mengakses kontak WhatsApp Anda setelah pengajuan ditolak.'
        }
        confirmLabel={claimConfirm?.status === 'accepted' ? 'Ya, Terima' : 'Ya, Tolak'}
        loading={respondClaim.isPending}
        onCancel={() => setClaimConfirm(null)}
        onConfirm={() => {
          if (!claimConfirm) return
          respondClaim.mutate(
            {
              claimId: claimConfirm.claim.id,
              status: claimConfirm.status,
            },
            {
              onSuccess: () => setClaimConfirm(null),
            }
          )
        }}
      />
    </div>
  )
}
