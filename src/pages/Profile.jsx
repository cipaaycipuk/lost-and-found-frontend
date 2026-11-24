import { useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import {
  AlertCircle,
  ArrowLeft,
  Camera,
  Check,
  Loader2,
  Mail,
  Phone,
  X,
} from 'lucide-react'
import { toast } from 'sonner'
import Avatar from '../components/Avatar'
import ConfirmDialog from '../components/ConfirmDialog'
import PostCard from '../components/PostCard'
import { useAuth } from '../context/AuthContext'
import {
  useMyPostsQuery,
  useSavedPostsQuery,
  useUserOpenPostsQuery,
} from '../hooks/usePosts'
import { useMyClaimsQuery, useRespondClaimMutation } from '../hooks/useClaims'
import { currentUser as fallbackDummyUser } from '../lib/dummyData'
import { formatTimeAgo, formatWhatsAppUrl, resolveMediaUrl } from '../lib/formatters'

export default function Profile() {
  const { userId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user, isAuthenticated, updateProfile, logout } = useAuth()

  const isOwnProfile =
    !userId || (isAuthenticated && user && String(user.id) === String(userId))

  const [activeTab, setActiveTab] = useState('posts')
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState('')
  const [editWhatsapp, setEditWhatsapp] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const [claimConfirm, setClaimConfirm] = useState(null) // { claim, postTitle, status: 'accepted' | 'rejected' }

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

  const pendingReceivedClaims = (claimsData.received || []).filter(
    (c) => c.status === 'pending'
  )
  const historyClaims = [
    ...(claimsData.received || []).filter((c) => c.status !== 'pending'),
    ...(claimsData.submitted || []),
  ]

  const groupClaimsByPost = (list) => {
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

  const groupedPending = groupClaimsByPost(pendingReceivedClaims)
  const groupedHistory = groupClaimsByPost(historyClaims)

  const TABS = isOwnProfile
    ? [
        { key: 'posts', label: 'Postingan', count: myPosts.length },
        { key: 'saved', label: 'Tersimpan', count: savedPosts.length },
        { key: 'claims', label: 'Pengajuan', count: pendingReceivedClaims.length },
      ]
    : [
        {
          key: 'posts',
          label: 'Postingan Aktif',
          count: otherUserPosts.length,
        },
      ]

  const doneCount = isOwnProfile
    ? myPosts.filter((post) => post.status === 'selesai').length
    : 0

  const handleStartEdit = () => {
    setEditName(activeUser.name || '')
    setEditWhatsapp(activeUser.whatsapp || '')
    setIsEditing(true)
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
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

  return (
    <div className="mx-auto mt-6 max-w-4xl px-4 pb-12 pt-6 sm:mt-8 sm:pt-10 lg:px-8">
      {!isOwnProfile && (
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-6 inline-flex items-center gap-2 text-xs font-semibold text-gray-600 transition hover:text-black"
        >
          <ArrowLeft size={16} />
          <span>Kembali</span>
        </button>
      )}

      {missingPhone && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-900">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="h-4 w-4 shrink-0 text-amber-600" />
            <span>
              Nomor WhatsApp Anda masih kosong. Lengkapi nomor WhatsApp agar pengguna dapat menghubungi Anda setelah klaim diterima.
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

      {/* Header profil: Horizontal ringkas di mobile sesuai gambar, besar di sm+ */}
      <section className="mb-6 flex flex-row items-start gap-4 text-left sm:mb-10 sm:gap-10">
        {/* Avatar: overlay ganti foto hanya muncul saat mode Edit Profil aktif */}
        <div className="group relative shrink-0">
          <Avatar
            src={activeUser.avatar_url || activeUser.avatar}
            name={activeUser.name}
            className="size-20 text-2xl sm:size-[160px] sm:text-6xl"
          />

          {isOwnProfile && isEditing && (
            <label
              className={`absolute inset-0 flex cursor-pointer flex-col items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-[2px] transition-opacity duration-200 ${
                isUploadingAvatar
                  ? 'pointer-events-none opacity-100'
                  : 'opacity-90 hover:opacity-100'
              }`}
            >
              {isUploadingAvatar ? (
                <>
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span className="mt-1.5 text-xs font-medium">Mengunggah...</span>
                </>
              ) : (
                <>
                  <Camera className="h-6 w-6" />
                  <span className="mt-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold">
                    Ganti Foto
                  </span>
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

        <div className="w-full min-w-0 flex-1">
          <div className="flex flex-col items-start gap-3 sm:flex-row sm:justify-between sm:gap-4">
            <div className="w-full min-w-0 flex-1">
              {isEditing ? (
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Nama Lengkap"
                  autoFocus
                  className="w-full border-b-2 border-black bg-transparent pb-1 text-left text-xl font-bold outline-none sm:text-4xl"
                />
              ) : (
                <h1 className="text-lg font-bold sm:text-4xl">{activeUser.name}</h1>
              )}

              {/* Email & WhatsApp HANYA ditampilkan di profil diri sendiri */}
              {isOwnProfile && (
                <>
                  {activeUser.email && (
                    <p className="mt-0.5 break-all text-xs text-gray-600 sm:mt-1 sm:break-normal sm:text-lg">
                      {activeUser.email}
                    </p>
                  )}

                  {isEditing ? (
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-xs font-medium text-gray-600 sm:text-lg">
                        Whatsapp:
                      </span>
                      <input
                        type="tel"
                        value={editWhatsapp}
                        onChange={(e) => setEditWhatsapp(e.target.value)}
                        placeholder="Contoh: 081234567890"
                        className="w-40 border-b-2 border-black bg-transparent pb-0.5 text-xs font-medium outline-none sm:w-52 sm:text-lg"
                      />
                    </div>
                  ) : (
                    <p className="mt-0.5 text-xs sm:mt-1 sm:text-lg">
                      Whatsapp:{' '}
                      <span className={activeUser.whatsapp ? '' : 'italic text-amber-600'}>
                        {activeUser.whatsapp || 'Belum diisi'}
                      </span>
                    </p>
                  )}

                  {activeUser.auth_provider && (
                    <div className="mt-2.5 hidden flex-wrap items-center gap-1.5 sm:flex">
                      {String(activeUser.auth_provider)
                        .split(',')
                        .map((prov) => (
                          <span
                            key={prov}
                            className="inline-flex items-center rounded-full border border-gray-200 bg-white px-2.5 py-0.5 text-xs font-medium capitalize text-gray-700"
                          >
                            Terhubung: {prov.trim()}
                          </span>
                        ))}
                    </div>
                  )}
                </>
              )}

              {!isOwnProfile && (
                <p className="mt-1 text-xs text-gray-500 sm:text-sm">
                  Profil Publik Kampus Widyatama
                </p>
              )}
            </div>

            {/* Tombol Aksi Header */}
            {isOwnProfile && (
              <div className="flex shrink-0 flex-wrap items-center gap-2">
                {isEditing ? (
                  <>
                    <button
                      type="button"
                      disabled={isSaving}
                      onClick={handleSaveInline}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:opacity-60"
                    >
                      <Check size={15} />
                      {isSaving ? 'Menyimpan...' : 'Simpan'}
                    </button>
                    <button
                      type="button"
                      disabled={isSaving}
                      onClick={handleCancelEdit}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                    >
                      <X size={15} />
                      Batal
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={handleStartEdit}
                      className="rounded-lg border border-neutral-700 px-5 py-2 text-sm font-semibold transition hover:bg-white"
                    >
                      Edit Profil
                    </button>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="rounded-lg border border-red-300 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100"
                    >
                      Logout
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          <p className="mt-6 text-base sm:mt-8 sm:text-lg">
            {isOwnProfile ? (
              <>
                {myPosts.length} postingan <span className="mx-2">•</span> {doneCount} selesai
              </>
            ) : (
              <>{otherUserPosts.length} postingan aktif</>
            )}
          </p>
        </div>
      </section>

      {/* Tab */}
      <div
        role="tablist"
        className="mt-10 flex gap-5 overflow-x-auto border-b-2 border-gray-300 sm:gap-8"
      >
        {TABS.map((tab) => {
          const isActive = tab.key === activeTab
          return (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveTab(tab.key)}
              className={`-mb-0.5 shrink-0 border-b-2 pb-3 text-base sm:text-lg ${
                isActive ? 'border-black font-bold' : 'border-transparent text-gray-700'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          )
        })}
      </div>

      {/* Konten Tab */}
      <div className="mt-6 space-y-6">
        {activeTab === 'posts' && (
          (isOwnProfile ? loadingMine : loadingOther) ? (
            <p className="py-12 text-center text-gray-400">Memuat postingan...</p>
          ) : (isOwnProfile ? myPosts : otherUserPosts).length === 0 ? (
            <p className="py-12 text-center text-gray-400">
              {isOwnProfile
                ? 'Belum ada postingan.'
                : 'Belum ada laporan aktif dari pengguna ini.'}
            </p>
          ) : (
            (isOwnProfile ? myPosts : otherUserPosts).map((post) => (
              <PostCard key={post.id} post={post} isOwner={isOwnProfile} />
            ))
          )
        )}

        {isOwnProfile && activeTab === 'saved' && (
          loadingSaved ? (
            <p className="py-12 text-center text-gray-400">Memuat tersimpan...</p>
          ) : savedPosts.length === 0 ? (
            <p className="py-12 text-center text-gray-400">Belum ada tersimpan.</p>
          ) : (
            savedPosts.map((post) => <PostCard key={post.id} post={post} />)
          )
        )}

        {isOwnProfile && activeTab === 'claims' && (
          loadingClaims ? (
            <p className="py-12 text-center text-gray-400">Memuat daftar pengajuan...</p>
          ) : (
            <div className="space-y-8">
              {/* MENUNGGU KONFIRMASI */}
              <div className="space-y-3">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Menunggu Konfirmasi
                </h2>
                {groupedPending.length === 0 ? (
                  <p className="rounded-xl border border-gray-200 bg-white px-4 py-8 text-center text-sm text-gray-400">
                    Belum ada pengajuan klaim yang menunggu konfirmasi.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {groupedPending.map((group) => {
                      const isKehilangan = group.post?.type !== 'ditemukan'
                      const thumbUrl = resolveMediaUrl(
                        group.post?.image || group.post?.images?.[0]
                      )
                      return (
                        <div
                          key={group.postId}
                          style={{
                            borderLeftWidth: '5px',
                            borderLeftColor: isKehilangan ? '#F05A00' : '#0026FF',
                          }}
                          className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
                        >
                          <div className="flex items-center justify-between gap-3 border-b border-gray-200 px-4 py-3.5 sm:px-5">
                            <div className="flex min-w-0 items-center gap-3">
                              {thumbUrl && (
                                <img
                                  src={thumbUrl}
                                  alt={group.post?.title}
                                  className="h-11 w-11 shrink-0 rounded-lg object-cover"
                                />
                              )}
                              <div className="flex min-w-0 flex-wrap items-center gap-2">
                                <h3 className="truncate text-sm font-bold text-gray-900 sm:text-base">
                                  {group.post?.title}
                                </h3>
                                <span
                                  className={`rounded-full px-3 py-0.5 text-xs font-bold ${
                                    isKehilangan
                                      ? 'bg-[#FCEEE3] text-[#F05A00]'
                                      : 'bg-[#E2E6FF] text-[#0026FF]'
                                  }`}
                                >
                                  {isKehilangan ? 'Kehilangan' : 'Ditemukan'}
                                </span>
                              </div>
                            </div>
                            <span className="shrink-0 text-xs text-gray-400">
                              {group.claims.length} pengajuan menunggu
                            </span>
                          </div>

                          <div className="divide-y divide-gray-200">
                            {group.claims.map((claim) => {
                              const actor = claim.claimer || claim.claimant
                              return (
                                <div
                                  key={claim.id}
                                  className="flex flex-col justify-between gap-3 px-4 py-3.5 sm:flex-row sm:items-center sm:px-5"
                                >
                                  <div className="flex min-w-0 items-start gap-3">
                                    <Avatar
                                      src={actor?.avatar_url || actor?.avatar}
                                      name={actor?.name}
                                      className="h-9 w-9 shrink-0 text-xs"
                                    />
                                    <div className="min-w-0">
                                      <p className="text-xs text-gray-600 sm:text-sm">
                                        <strong className="font-bold text-gray-900">
                                          {actor?.name}
                                        </strong>{' '}
                                        {isKehilangan
                                          ? 'melaporkan telah menemukan barang ini'
                                          : 'mengajukan klaim kepemilikan barang ini'}
                                      </p>
                                      <p className="mt-0.5 text-[11px] text-gray-400">
                                        {formatTimeAgo(claim.created_at || claim.createdAt)} • Lanjut di verifikasi via Whatsapp
                                      </p>
                                      {claim.message && (
                                        <p className="mt-1 text-xs text-gray-600">
                                          &ldquo;{claim.message}&rdquo;
                                        </p>
                                      )}
                                    </div>
                                  </div>

                                  <div className="flex shrink-0 items-center gap-2 self-end sm:self-center">
                                    <button
                                      type="button"
                                      disabled={respondClaim.isPending}
                                      onClick={() =>
                                        setClaimConfirm({
                                          claim,
                                          postTitle: group.post?.title,
                                          postType: group.post?.type,
                                          status: 'rejected',
                                        })
                                      }
                                      className="rounded-full border border-gray-300 bg-white px-4 py-1.5 text-xs font-semibold text-gray-800 transition hover:bg-gray-50 disabled:opacity-50"
                                    >
                                      Tolak
                                    </button>
                                    <button
                                      type="button"
                                      disabled={respondClaim.isPending}
                                      onClick={() =>
                                        setClaimConfirm({
                                          claim,
                                          postTitle: group.post?.title,
                                          postType: group.post?.type,
                                          status: 'accepted',
                                        })
                                      }
                                      className="rounded-full bg-[#1C1C1C] px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-neutral-800 disabled:opacity-50"
                                    >
                                      Terima
                                    </button>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* RIWAYAT */}
              <div className="space-y-3">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Riwayat
                </h2>
                {groupedHistory.length === 0 ? (
                  <p className="rounded-xl border border-gray-200 bg-white px-4 py-8 text-center text-sm text-gray-400">
                    Belum ada riwayat pengajuan klaim.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {groupedHistory.map((group) => {
                      const isKehilangan = group.post?.type !== 'ditemukan'
                      const thumbUrl = resolveMediaUrl(
                        group.post?.image || group.post?.images?.[0]
                      )
                      return (
                        <div
                          key={`history-${group.postId}`}
                          style={{
                            borderLeftWidth: '5px',
                            borderLeftColor: isKehilangan ? '#F05A00' : '#0026FF',
                          }}
                          className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
                        >
                          <div className="flex items-center justify-between gap-3 border-b border-gray-200 px-4 py-3.5 sm:px-5">
                            <div className="flex min-w-0 items-center gap-3">
                              {thumbUrl && (
                                <img
                                  src={thumbUrl}
                                  alt={group.post?.title}
                                  className="h-11 w-11 shrink-0 rounded-lg object-cover"
                                />
                              )}
                              <div className="flex min-w-0 flex-wrap items-center gap-2">
                                <h3 className="truncate text-sm font-bold text-gray-900 sm:text-base">
                                  {group.post?.title}
                                </h3>
                                <span
                                  className={`rounded-full px-3 py-0.5 text-xs font-bold ${
                                    isKehilangan
                                      ? 'bg-[#FCEEE3] text-[#F05A00]'
                                      : 'bg-[#E2E6FF] text-[#0026FF]'
                                  }`}
                                >
                                  {isKehilangan ? 'Kehilangan' : 'Ditemukan'}
                                </span>
                              </div>
                            </div>
                            <span className="shrink-0 text-xs text-gray-400">
                              Selesai
                            </span>
                          </div>

                          <div className="divide-y divide-gray-200">
                            {group.claims.map((claim) => {
                              const person = claim.claimer || claim.owner
                              const targetWa =
                                claim.status === 'accepted'
                                  ? formatWhatsAppUrl(
                                      person?.whatsapp || claim.contact_whatsapp,
                                      `Halo ${person?.name || ''}, terkait klaim laporan "${group.post?.title || ''}" di Lost & Found.`
                                    )
                                  : null
                              const targetEmail = person?.email
                              const mailUrl =
                                claim.status === 'accepted' && !targetWa && targetEmail
                                  ? `mailto:${targetEmail}?subject=${encodeURIComponent(`Klaim Lost & Found: ${group.post?.title || ''}`)}`
                                  : null
                              return (
                                <div
                                  key={claim.id}
                                  className="flex flex-col justify-between gap-3 px-4 py-3.5 sm:flex-row sm:items-center sm:px-5"
                                >
                                  <div className="flex min-w-0 items-center gap-3">
                                    <Avatar
                                      src={person?.avatar_url || person?.avatar}
                                      name={person?.name}
                                      className="h-9 w-9 shrink-0 text-xs"
                                    />
                                    <div className="min-w-0">
                                      <p className="text-xs font-bold text-gray-900 sm:text-sm">
                                        {person?.name}
                                      </p>
                                      <p className="text-[11px] text-gray-400">
                                        {claim.status === 'accepted'
                                          ? 'Diterima'
                                          : claim.status === 'rejected'
                                            ? 'Ditolak'
                                            : 'Menunggu'}{' '}
                                        • {formatTimeAgo(claim.created_at || claim.createdAt)}
                                      </p>
                                    </div>
                                  </div>

                                  {targetWa ? (
                                    <a
                                      href={targetWa}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="inline-flex w-fit items-center gap-1.5 rounded-full bg-[#1C1C1C] px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-neutral-800"
                                    >
                                      <Phone size={13} />
                                      Hubungi WhatsApp
                                    </a>
                                  ) : (
                                    mailUrl && (
                                      <a
                                        href={mailUrl}
                                        className="inline-flex w-fit items-center gap-1.5 rounded-full border border-gray-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-gray-800 transition hover:bg-gray-50"
                                      >
                                        <Mail size={13} />
                                        Hubungi Email
                                      </a>
                                    )
                                  )}
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          )
        )}
      </div>

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
            ? 'Pengajuan lain pada laporan ini otomatis ditolak. Selanjutkan lakukan konfirmasi melalui WhatsApp'
            : 'Pengguna tidak dapat mengakses kontak WhatsApp Anda setelah pengajuan ditolak.'
        }
        confirmLabel={
          claimConfirm?.status === 'accepted' ? 'Ya, Terima' : 'Ya, Tolak'
        }
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
