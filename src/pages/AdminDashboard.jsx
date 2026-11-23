import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Navigate } from 'react-router-dom'
import {
  CheckCircle2,
  ClipboardList,
  FileText,
  RotateCcw,
  ShieldCheck,
  Trash2,
  Users,
  XCircle,
} from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '../context/AuthContext'
import { adminService } from '../services/adminService'
import ConfirmDialog from '../components/ConfirmDialog'
import Avatar from '../components/Avatar'
import { formatDateId } from '../lib/formatters'

const TABS = [
  { key: 'posts', label: 'Posts', icon: FileText },
  { key: 'users', label: 'Users', icon: Users },
  { key: 'claims', label: 'Claims', icon: ClipboardList },
]

export default function AdminDashboard() {
  const { user, isAuthenticated } = useAuth()
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState('posts')
  const [postToDelete, setPostToDelete] = useState(null)

  const isAdmin = isAuthenticated && user?.role === 'admin'

  const { data: stats } = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: () => adminService.getStats(),
    enabled: isAdmin,
  })

  const { data: posts = [], isLoading: loadingPosts } = useQuery({
    queryKey: ['admin', 'posts'],
    queryFn: () => adminService.getPosts(),
    enabled: isAdmin && activeTab === 'posts',
  })

  const { data: users = [], isLoading: loadingUsers } = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: () => adminService.getUsers(),
    enabled: isAdmin && activeTab === 'users',
  })

  const { data: claims = [], isLoading: loadingClaims } = useQuery({
    queryKey: ['admin', 'claims'],
    queryFn: () => adminService.getClaims(),
    enabled: isAdmin && activeTab === 'claims',
  })

  const deletePostMutation = useMutation({
    mutationFn: (id) => adminService.deletePost(id),
    onSuccess: () => {
      toast.success('Laporan dipindahkan ke sampah.')
      setPostToDelete(null)
      queryClient.invalidateQueries({ queryKey: ['admin'] })
      queryClient.invalidateQueries({ queryKey: ['posts'] })
    },
    onError: (err) => toast.error(err?.message || 'Gagal menghapus laporan.'),
  })

  const restorePostMutation = useMutation({
    mutationFn: (id) => adminService.restorePost(id),
    onSuccess: () => {
      toast.success('Laporan berhasil dipulihkan.')
      queryClient.invalidateQueries({ queryKey: ['admin'] })
      queryClient.invalidateQueries({ queryKey: ['posts'] })
    },
    onError: (err) => toast.error(err?.message || 'Gagal memulihkan laporan.'),
  })

  const roleMutation = useMutation({
    mutationFn: ({ userId, role }) => adminService.updateUserRole(userId, role),
    onSuccess: () => {
      toast.success('Role pengguna diperbarui.')
      queryClient.invalidateQueries({ queryKey: ['admin'] })
    },
    onError: (err) => toast.error(err?.message || 'Gagal memperbarui role.'),
  })

  const respondClaimMutation = useMutation({
    mutationFn: ({ claimId, status }) =>
      adminService.respondClaim(claimId, { status }),
    onSuccess: (_, vars) => {
      toast.success(
        vars.status === 'accepted' ? 'Klaim diterima.' : 'Klaim ditolak.'
      )
      queryClient.invalidateQueries({ queryKey: ['admin'] })
      queryClient.invalidateQueries({ queryKey: ['posts'] })
    },
    onError: (err) => toast.error(err?.message || 'Gagal memproses klaim.'),
  })

  if (!isAdmin) {
    return <Navigate to="/403" replace />
  }

  return (
    <div className="mx-auto max-w-7xl px-4 pb-12 pt-8 lg:px-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-black text-white">
            <ShieldCheck size={22} />
          </span>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Dashboard Admin
            </h1>
            <p className="text-xs text-gray-500">
              Kelola laporan barang, pengguna kampus, dan pengajuan klaim.
            </p>
          </div>
        </div>
      </div>

      {/* Ringkasan Statistik */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-gray-500">Total Laporan</p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-gray-900">
            {stats?.posts_total ?? 0}
          </p>
          <p className="mt-1 text-[11px] text-gray-500">
            {stats?.posts_open ?? 0} aktif • {stats?.posts_trashed ?? 0} sampah
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-gray-500">Laporan Selesai</p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-emerald-700">
            {stats?.posts_resolved ?? 0}
          </p>
          <p className="mt-1 text-[11px] text-gray-500">Barang kembali / selesai</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-gray-500">Total Pengguna</p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-gray-900">
            {stats?.users_total ?? 0}
          </p>
          <p className="mt-1 text-[11px] text-gray-500">
            {stats?.users_admin ?? 0} admin terdaftar
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-gray-500">Pengajuan Klaim</p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-[#e0531c]">
            {stats?.claims_total ?? 0}
          </p>
          <p className="mt-1 text-[11px] text-gray-500">
            {stats?.claims_pending ?? 0} menunggu konfirmasi
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-5 flex gap-2 border-b border-gray-200">
        {TABS.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.key
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`-mb-px inline-flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-semibold transition ${
                isActive
                  ? 'border-black text-black'
                  : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* Tab Content */}
      {activeTab === 'posts' && (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          {loadingPosts ? (
            <p className="p-8 text-center text-sm text-gray-500">
              Memuat daftar laporan...
            </p>
          ) : posts.length === 0 ? (
            <p className="p-8 text-center text-sm text-gray-500">
              Belum ada laporan.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase text-gray-500">
                  <tr>
                    <th className="px-4 py-3">Laporan</th>
                    <th className="px-4 py-3">Tipe</th>
                    <th className="px-4 py-3">Pelapor</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {posts.map((p) => (
                    <tr key={p.id} className={p.deleted_at ? 'bg-red-50/40' : ''}>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-gray-900">{p.title}</p>
                        <p className="text-xs text-gray-500">
                          {p.location} • {formatDateId(p.incident_date)}
                        </p>
                      </td>
                      <td className="px-4 py-3 capitalize">{p.type}</td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-800">
                          {p.author?.name || '-'}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        {p.deleted_at ? (
                          <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-700">
                            Terhapus
                          </span>
                        ) : p.status === 'selesai' || p.status === 'resolved' ? (
                          <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                            Selesai
                          </span>
                        ) : (
                          <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
                            Open
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {p.deleted_at ? (
                          <button
                            type="button"
                            disabled={restorePostMutation.isPending}
                            onClick={() => restorePostMutation.mutate(p.id)}
                            className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-700"
                          >
                            <RotateCcw size={13} />
                            Pulihkan
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setPostToDelete(p)}
                            className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-100"
                          >
                            <Trash2 size={13} />
                            Hapus
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'users' && (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          {loadingUsers ? (
            <p className="p-8 text-center text-sm text-gray-500">
              Memuat daftar pengguna...
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase text-gray-500">
                  <tr>
                    <th className="px-4 py-3">Pengguna</th>
                    <th className="px-4 py-3">Email & WA</th>
                    <th className="px-4 py-3">Aktivitas</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <Avatar
                            src={u.avatar_url || u.avatar}
                            name={u.name}
                            className="h-8 w-8 text-xs"
                          />
                          <span className="font-semibold text-gray-900">
                            {u.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-gray-800">{u.email}</p>
                        <p className="text-xs text-gray-500">
                          {u.whatsapp || '-'}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-600">
                        {u.posts_count} postingan • {u.claims_count} klaim
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${
                            u.role === 'admin'
                              ? 'bg-black text-white'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {u.id !== user?.id && (
                          <button
                            type="button"
                            disabled={roleMutation.isPending}
                            onClick={() =>
                              roleMutation.mutate({
                                userId: u.id,
                                role: u.role === 'admin' ? 'user' : 'admin',
                              })
                            }
                            className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-50"
                          >
                            {u.role === 'admin'
                              ? 'Jadikan User'
                              : 'Jadikan Admin'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'claims' && (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          {loadingClaims ? (
            <p className="p-8 text-center text-sm text-gray-500">
              Memuat daftar klaim...
            </p>
          ) : claims.length === 0 ? (
            <p className="p-8 text-center text-sm text-gray-500">
              Belum ada pengajuan klaim.
            </p>
          ) : (
            <div className="divide-y divide-gray-100">
              {claims.map((claim) => (
                <div
                  key={claim.id}
                  className="flex flex-col justify-between gap-3 p-4 sm:flex-row sm:items-center"
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-bold text-gray-900">
                        {claim.post?.title || `Laporan #${claim.post_id}`}
                      </span>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize ${
                          claim.status === 'accepted'
                            ? 'bg-emerald-100 text-emerald-700'
                            : claim.status === 'rejected'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {claim.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600">
                      Pengaju: <strong>{claim.claimer?.name}</strong> • Pemilik:{' '}
                      <strong>{claim.owner?.name}</strong>
                    </p>
                    <p className="text-xs text-gray-700">"{claim.message}"</p>
                  </div>

                  {claim.status === 'pending' && (
                    <div className="flex shrink-0 items-center gap-2">
                      <button
                        type="button"
                        disabled={respondClaimMutation.isPending}
                        onClick={() =>
                          respondClaimMutation.mutate({
                            claimId: claim.id,
                            status: 'accepted',
                          })
                        }
                        className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-700"
                      >
                        <CheckCircle2 size={14} />
                        Terima
                      </button>
                      <button
                        type="button"
                        disabled={respondClaimMutation.isPending}
                        onClick={() =>
                          respondClaimMutation.mutate({
                            claimId: claim.id,
                            status: 'rejected',
                          })
                        }
                        className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-100"
                      >
                        <XCircle size={14} />
                        Tolak
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <ConfirmDialog
        open={Boolean(postToDelete)}
        title="Hapus Laporan?"
        description={`Laporan "${postToDelete?.title || ''}" akan dipindahkan ke sampah (soft delete) dan masih bisa dipulihkan kembali.`}
        confirmLabel="Ya, Hapus"
        loading={deletePostMutation.isPending}
        onConfirm={() => deletePostMutation.mutate(postToDelete.id)}
        onCancel={() => setPostToDelete(null)}
      />
    </div>
  )
}
