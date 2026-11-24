import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { AlertCircle, PackageSearch, Plus, RefreshCw } from 'lucide-react'
import FilterSidebar from '../components/FilterSidebar'
import PostCard from '../components/PostCard'
import PostDetailModal from '../components/PostDetailModal'
import { usePostDetailQuery, usePostsQuery } from '../hooks/usePosts'

function PostSkeleton() {
  return (
    <div
      style={{ borderLeftWidth: '5px', borderLeftColor: '#E5E7EB' }}
      className="animate-pulse space-y-4 rounded-xl border border-gray-200 bg-white p-4 sm:p-5"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-full bg-gray-200" />
          <div className="space-y-1.5">
            <div className="h-3.5 w-28 rounded bg-gray-200" />
            <div className="h-2.5 w-20 rounded bg-gray-100" />
          </div>
        </div>
        <div className="h-6 w-20 rounded-full bg-gray-200" />
      </div>
      <div className="aspect-[16/10] w-full rounded-lg bg-gray-200" />
      <div className="space-y-2">
        <div className="h-5 w-2/3 rounded bg-gray-200" />
        <div className="h-3.5 w-full rounded bg-gray-100" />
        <div className="h-3.5 w-4/5 rounded bg-gray-100" />
      </div>
    </div>
  )
}

export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams()
  const searchQuery = searchParams.get('q') || ''
  const postParam = searchParams.get('post')

  const [activeTab, setActiveTab] = useState('Semua')
  const [category, setCategory] = useState('Semua kategori')
  const [location, setLocation] = useState('Semua')
  const [sortBy, setSortBy] = useState('Terbaru')
  const [selectedPost, setSelectedPost] = useState(null)

  const { data: notifPostDetail } = usePostDetailQuery(postParam)

  const handleCloseModal = () => {
    setSelectedPost(null)
    if (searchParams.has('post')) {
      const next = new URLSearchParams(searchParams)
      next.delete('post')
      setSearchParams(next, { replace: true })
    }
  }

  const filters = useMemo(
    () => ({
      type: activeTab,
      category,
      location,
      status: 'open',
      sort: sortBy === 'Terlama' ? 'oldest' : 'latest',
      search: searchQuery,
    }),
    [activeTab, category, location, sortBy, searchQuery]
  )

  const {
    data: rawPosts = [],
    isLoading,
    isError,
    error,
    refetch,
  } = usePostsQuery(filters)

  // Postingan dengan status selesai disembunyikan di beranda
  const posts = useMemo(
    () => rawPosts.filter((p) => p.status !== 'selesai'),
    [rawPosts]
  )

  const activeModalPost = useMemo(() => {
    if (selectedPost) {
      return (
        rawPosts.find((p) => String(p.id) === String(selectedPost.id)) ||
        selectedPost
      )
    }
    if (postParam) {
      return (
        rawPosts.find((p) => String(p.id) === String(postParam)) ||
        notifPostDetail ||
        null
      )
    }
    return null
  }, [selectedPost, postParam, rawPosts, notifPostDetail])

  const handleResetFilter = () => {
    setActiveTab('Semua')
    setCategory('Semua kategori')
    setLocation('Semua')
    setSortBy('Terbaru')
    if (searchQuery) {
      const next = new URLSearchParams(searchParams)
      next.delete('q')
      setSearchParams(next, { replace: true })
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 pb-12 pt-5 sm:pt-8 lg:px-8">
      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-12 lg:gap-6">
        {/* Sidebar Filter */}
        <FilterSidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          category={category}
          setCategory={setCategory}
          location={location}
          setLocation={setLocation}
          sortBy={sortBy}
          setSortBy={setSortBy}
          onReset={handleResetFilter}
        />

        {/* Feed Postingan */}
        <main className="space-y-4 lg:col-span-8">
          {isLoading ? (
            <div className="space-y-4">
              <PostSkeleton />
              <PostSkeleton />
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-red-200 bg-white px-6 py-12 text-center shadow-sm">
              <AlertCircle className="mb-3 h-10 w-10 text-red-500" />
              <h2 className="text-base font-bold text-gray-900">
                Gagal memuat laporan
              </h2>
              <p className="mt-1 max-w-md text-xs text-gray-600">
                {error?.message || 'Tidak dapat terhubung ke server.'}
              </p>
              <button
                type="button"
                onClick={() => refetch()}
                className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-black px-4 py-2 text-xs font-semibold text-white transition hover:bg-neutral-800"
              >
                <RefreshCw size={14} />
                Coba lagi
              </button>
            </div>
          ) : posts.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-white px-6 py-14 text-center shadow-sm">
              <PackageSearch className="mb-3 h-10 w-10 text-gray-400" />
              <h2 className="text-base font-bold text-gray-900">
                Belum ada laporan yang cocok
              </h2>
              <p className="mt-1 max-w-sm text-xs leading-relaxed text-gray-500">
                {searchQuery
                  ? `Tidak ditemukan laporan untuk kata kunci "${searchQuery}".`
                  : 'Coba ubah filter atau buat laporan baru agar teman kampus bisa membantu.'}
              </p>
              <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5">
                <button
                  type="button"
                  onClick={handleResetFilter}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-xs font-semibold text-gray-700 transition hover:bg-gray-50"
                >
                  Reset filter
                </button>
                <Link
                  to="/buat-laporan"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#e0531c] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#c84615]"
                >
                  <Plus size={14} />
                  Buat Laporan
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between px-1">
                <p className="text-xs font-medium text-gray-500">
                  Menampilkan{' '}
                  <span className="font-semibold text-gray-900 tabular-nums">
                    {posts.length}
                  </span>{' '}
                  laporan aktif
                  {searchQuery ? ` untuk "${searchQuery}"` : ''}
                </p>
              </div>

              <div className="space-y-4">
                {posts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    onSelect={(p) => setSelectedPost(p)}
                  />
                ))}
              </div>
            </>
          )}
        </main>
      </div>

      {/* Modal Detail Postingan */}
      {activeModalPost && (
        <PostDetailModal
          post={activeModalPost}
          onClose={handleCloseModal}
        />
      )}
    </div>
  )
}
