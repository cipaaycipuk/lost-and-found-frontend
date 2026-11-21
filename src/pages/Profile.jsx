import { useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { AlertCircle, ArrowLeft, Camera, Check, Loader2, Phone, X } from 'lucide-react'
import { toast } from 'sonner'
import Avatar from '../components/Avatar'
import PostCard from '../components/PostCard'
import { useAuth } from '../context/AuthContext'
import {
  useMyPostsQuery,
  useSavedPostsQuery,
  useUserOpenPostsQuery,
} from '../hooks/usePosts'
import { currentUser as fallbackDummyUser } from '../lib/dummyData'
import { formatWhatsAppUrl } from '../lib/formatters'

export default function Profile() {
  const { userId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { user, isAuthenticated, updateProfile, logout } = useAuth()

  const isOwnProfile =
    !userId || (isAuthenticated && user && String(user.id) === String(userId))

  const [activeTab, setActiveTab] = useState('posts')
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState('')
  const [editWhatsapp, setEditWhatsapp] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)

  const { data: myPosts = [], isLoading: loadingMine } = useMyPostsQuery()
  const { data: savedPosts = [], isLoading: loadingSaved } = useSavedPostsQuery()
  const { data: otherUserPosts = [], isLoading: loadingOther } = useUserOpenPostsQuery(
    isOwnProfile ? null : userId
  )

  const activeUser = isOwnProfile
    ? user || fallbackDummyUser
    : location.state?.author ||
      otherUserPosts[0]?.author || {
        id: userId,
        name: 'Pengguna Kampus',
        email: '',
        whatsapp: '',
        avatar: '',
      }

  const missingPhone =
    isOwnProfile && isAuthenticated && !String(activeUser.whatsapp || '').trim()

  const TABS = isOwnProfile
    ? [
        { key: 'posts', label: 'Postingan', items: myPosts, loading: loadingMine },
        { key: 'saved', label: 'Tersimpan', items: savedPosts, loading: loadingSaved },
      ]
    : [
        {
          key: 'posts',
          label: 'Postingan Aktif',
          items: otherUserPosts,
          loading: loadingOther,
        },
      ]

  const current = TABS.find((tab) => tab.key === activeTab) || TABS[0]
  const doneCount = isOwnProfile
    ? myPosts.filter((post) => post.status === 'selesai').length
    : 0

  const waUrl = formatWhatsAppUrl(
    activeUser.whatsapp,
    `Halo ${activeUser.name || ''}, saya menghubungi Anda melalui Lost & Found Widyatama.`
  )

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
      await updateProfile(formData)
      toast.success('Profil berhasil diperbarui!')
      setIsEditing(false)
    } catch (err) {
      toast.error(err.message || 'Gagal memperbarui profil.')
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
      await updateProfile(formData)
      toast.success('Foto profil berhasil diperbarui!')
    } catch (err) {
      toast.error(err.message || 'Gagal mengganti foto profil.')
    } finally {
      setIsUploadingAvatar(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    toast.success('Berhasil keluar akun.')
    navigate('/login')
  }

  return (
    <div className="mx-auto mt-8 max-w-4xl px-4 pb-8 pt-10 lg:px-8">
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
              Nomor WhatsApp Anda masih kosong. Lengkapi nomor WhatsApp agar pengguna lain dapat menghubungi Anda.
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

      {/* Header profil */}
      <section className="mb-10 flex flex-col items-center gap-6 text-center sm:flex-row sm:items-start sm:gap-10 sm:text-left">
        {/* Avatar + Hover Modal Ganti Foto */}
        <div className="group relative shrink-0">
          <Avatar
            src={activeUser.avatar_url || activeUser.avatar}
            name={activeUser.name}
            className="size-36 text-4xl sm:size-[160px] sm:text-6xl"
          />

          {isOwnProfile && (
            <label
              className={`absolute inset-0 flex cursor-pointer flex-col items-center justify-center rounded-full bg-black/60 text-white opacity-0 backdrop-blur-[2px] transition-opacity duration-200 group-hover:opacity-100 ${
                isUploadingAvatar ? 'pointer-events-none opacity-100' : ''
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
                accept="image/*"
                disabled={isUploadingAvatar}
                onChange={handleAvatarChange}
                className="hidden"
              />
            </label>
          )}
        </div>

        <div className="w-full min-w-0 flex-1">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="w-full min-w-0 flex-1">
              {/* Inline Edit Nama */}
              {isEditing ? (
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Nama Lengkap"
                  autoFocus
                  className="w-full border-b-2 border-black bg-transparent pb-1 text-center text-3xl font-bold outline-none sm:text-left sm:text-4xl"
                />
              ) : (
                <h1 className="text-3xl font-bold sm:text-4xl">{activeUser.name}</h1>
              )}

              {activeUser.email && (
                <p className="mt-1 break-all text-lg text-gray-600 sm:break-normal">
                  {activeUser.email}
                </p>
              )}

              {/* Inline Edit WhatsApp */}
              {isEditing ? (
                <div className="mt-2 flex items-center justify-center gap-2 sm:justify-start">
                  <span className="text-lg font-medium text-gray-600">Whatsapp:</span>
                  <input
                    type="tel"
                    value={editWhatsapp}
                    onChange={(e) => setEditWhatsapp(e.target.value)}
                    placeholder="Contoh: 081234567890"
                    className="w-52 border-b-2 border-black bg-transparent pb-0.5 text-lg font-medium outline-none"
                  />
                </div>
              ) : (
                <p className="mt-1 text-lg">
                  Whatsapp:{' '}
                  <span className={activeUser.whatsapp ? '' : 'italic text-amber-600'}>
                    {activeUser.whatsapp || 'Belum diisi'}
                  </span>
                </p>
              )}

              {isOwnProfile && activeUser.auth_provider && (
                <div className="mt-2.5 flex flex-wrap items-center justify-center gap-1.5 sm:justify-start">
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
            </div>

            {/* Tombol Aksi Header */}
            <div className="flex shrink-0 flex-wrap items-center gap-2">
              {isOwnProfile ? (
                isEditing ? (
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
                )
              ) : (
                waUrl && (
                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-full bg-black px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-neutral-800"
                  >
                    <Phone size={15} />
                    Hubungi WhatsApp
                  </a>
                )
              )}
            </div>
          </div>

          <p className="mt-6 text-lg sm:mt-8">
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
      <div role="tablist" className="mt-10 flex gap-8 border-b-2 border-gray-300">
        {TABS.map((tab) => {
          const isActive = tab.key === current.key
          return (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveTab(tab.key)}
              className={`-mb-0.5 border-b-2 pb-3 text-lg ${
                isActive ? 'border-black font-bold' : 'border-transparent text-gray-700'
              }`}
            >
              {tab.label} ({tab.items.length})
            </button>
          )
        })}
      </div>

      {/* Daftar kartu: satu kartu per baris */}
      <div className="mt-6 space-y-6">
        {current.loading ? (
          <p className="py-12 text-center text-gray-400">
            Memuat {current.label.toLowerCase()}...
          </p>
        ) : current.items.length === 0 ? (
          <p className="py-12 text-center text-gray-400">
            {isOwnProfile
              ? `Belum ada ${current.label.toLowerCase()}.`
              : 'Belum ada laporan aktif dari pengguna ini.'}
          </p>
        ) : (
          current.items.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              isOwner={isOwnProfile && current.key === 'posts'}
            />
          ))
        )}
      </div>
    </div>
  )
}
