import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import Avatar from '../components/Avatar'
import PostCard from '../components/PostCard'
import { useAuth } from '../context/AuthContext'
import { useMyPostsQuery, useSavedPostsQuery } from '../hooks/usePosts'
import { currentUser as fallbackDummyUser } from '../lib/dummyData'

export default function Profile() {
  const navigate = useNavigate()
  const { user, updateProfile, logout } = useAuth()
  const activeUser = user || fallbackDummyUser

  const [activeTab, setActiveTab] = useState('posts')
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    name: activeUser.name || '',
    whatsapp: activeUser.whatsapp || '',
    avatarFile: null,
  })
  const [isSaving, setIsSaving] = useState(false)

  const { data: myPosts = [], isLoading: loadingMine } = useMyPostsQuery()
  const { data: savedPosts = [], isLoading: loadingSaved } = useSavedPostsQuery()

  const TABS = [
    { key: 'posts', label: 'Postingan', items: myPosts, loading: loadingMine },
    { key: 'saved', label: 'Tersimpan', items: savedPosts, loading: loadingSaved },
  ]

  const current = TABS.find((tab) => tab.key === activeTab)
  const doneCount = myPosts.filter((post) => post.status === 'selesai').length

  const handleOpenEdit = () => {
    setEditForm({
      name: activeUser.name || '',
      whatsapp: activeUser.whatsapp || '',
      avatarFile: null,
    })
    setIsEditing(true)
  }

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    try {
      setIsSaving(true)
      const formData = new FormData()
      formData.append('name', editForm.name.trim())
      formData.append('whatsapp', editForm.whatsapp.trim())
      if (editForm.avatarFile) {
        formData.append('avatar', editForm.avatarFile)
      }
      await updateProfile(formData)
      toast.success('Profil berhasil diperbarui!')
      setIsEditing(false)
    } catch (err) {
      toast.error(err.message || 'Gagal memperbarui profil.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    toast.success('Berhasil keluar akun.')
    navigate('/login')
  }

  return (
    <div className="mx-auto max-w-4xl px-4 pb-8 pt-10 lg:px-8 mt-8">
      {/* Header profil */}
      <section className="flex flex-col items-center gap-6 text-center sm:flex-row sm:items-start sm:gap-10 sm:text-left mb-10">
        <Avatar
          src={activeUser.avatar_url || activeUser.avatar}
          name={activeUser.name}
          className="size-36 shrink-0 text-4xl sm:size-[160px] sm:text-6xl"
        />

        <div className="w-full min-w-0 flex-1">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h1 className="text-3xl font-bold sm:text-4xl">{activeUser.name}</h1>
              <p className="mt-1 break-all text-lg sm:break-normal">{activeUser.email}</p>
              <p className="text-lg">Whatsapp: {activeUser.whatsapp || '-'}</p>
              {activeUser.auth_provider && (
                <div className="mt-2 flex flex-wrap items-center justify-center gap-1.5 sm:justify-start">
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
            <div className="flex shrink-0 flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleOpenEdit}
                className="rounded-lg border border-neutral-700 px-5 py-2 text-sm font-semibold hover:bg-white"
              >
                Edit Profil
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-lg border border-red-300 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-100"
              >
                Logout
              </button>
            </div>
          </div>

          <p className="mt-6 text-lg sm:mt-8">
            {myPosts.length} postingan <span className="mx-2">•</span> {doneCount} selesai
          </p>

          {isEditing && (
            <form
              onSubmit={handleSaveProfile}
              className="mt-6 space-y-4 rounded-xl border border-gray-200 bg-white p-5 text-left shadow-sm"
            >
              <h2 className="text-base font-bold text-gray-900">Edit Profil</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-600">
                    Nama Lengkap
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.name}
                    onChange={(e) =>
                      setEditForm((prev) => ({ ...prev, name: e.target.value }))
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-600">
                    Nomor WhatsApp
                  </label>
                  <input
                    type="tel"
                    value={editForm.whatsapp}
                    onChange={(e) =>
                      setEditForm((prev) => ({ ...prev, whatsapp: e.target.value }))
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-black"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-600">
                  Foto Profil (Opsional, maks. 5MB)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      avatarFile: e.target.files?.[0] || null,
                    }))
                  }
                  className="w-full text-xs text-gray-600"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="rounded-lg bg-black px-4 py-2 text-xs font-semibold text-white hover:bg-neutral-800 disabled:opacity-60"
                >
                  {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          )}
        </div>
      </section>

      {/* Tab */}
      <div role="tablist" className="mt-10 flex gap-8 border-b-2 border-gray-300">
        {TABS.map((tab) => {
          const isActive = tab.key === activeTab
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
          <p className="py-12 text-center text-gray-400">Memuat {current.label.toLowerCase()}...</p>
        ) : current.items.length === 0 ? (
          <p className="py-12 text-center text-gray-400">Belum ada {current.label.toLowerCase()}.</p>
        ) : (
          current.items.map((post) => (
            <PostCard key={post.id} post={post} isOwner={activeTab === 'posts'} />
          ))
        )}
      </div>
    </div>
  )
}