import { useLocation, useNavigate, useParams } from 'react-router-dom'
import PostDetailModal from '../components/PostDetailModal'
import { usePostDetailQuery } from '../hooks/usePosts'
import ErrorPage from './ErrorPage'

function DetailModalSkeleton({ onClose }) {
  return (
    <div
      className="no-scrollbar fixed inset-0 z-50 overflow-y-auto bg-black/70 px-3 py-6 backdrop-blur-[2px] sm:px-6 sm:py-10"
      onClick={onClose}
    >
      <div
        style={{ borderLeftWidth: '5px', borderLeftColor: '#E5E7EB' }}
        className="mx-auto max-w-2xl animate-pulse space-y-5 rounded-xl border border-gray-200 bg-white p-5 shadow-2xl sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="h-4 w-24 rounded bg-gray-200" />
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-full bg-gray-200" />
          <div className="space-y-1.5">
            <div className="h-3.5 w-32 rounded bg-gray-200" />
            <div className="h-2.5 w-20 rounded bg-gray-100" />
          </div>
        </div>
        <div className="aspect-[16/10] w-full rounded-lg bg-gray-200" />
        <div className="h-6 w-2/3 rounded bg-gray-200" />
        <div className="space-y-2">
          <div className="h-3.5 w-full rounded bg-gray-100" />
          <div className="h-3.5 w-5/6 rounded bg-gray-100" />
        </div>
      </div>
    </div>
  )
}

export default function PostDetailPage() {
  const { postId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const initialPost = location.state?.post || null

  const {
    data: fetchedPost,
    isLoading,
    isError,
  } = usePostDetailQuery(postId, initialPost)

  const post = fetchedPost || initialPost

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1)
    } else {
      navigate('/')
    }
  }

  if (isLoading && !post) {
    return <DetailModalSkeleton onClose={handleBack} />
  }

  if ((isError && !post) || (!isLoading && !post)) {
    return (
      <ErrorPage
        code={404}
        headline="Laporan tidak ditemukan"
        title="Laporan tidak tersedia"
        description="Laporan yang kamu cari mungkin sudah dihapus oleh pemiliknya atau tautan tidak valid."
      />
    )
  }

  return <PostDetailModal post={post} onClose={handleBack} />
}
