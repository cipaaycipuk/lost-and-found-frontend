import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import PostDetail from './PostDetail'

const EXIT_DURATION_MS = 200

export default function PostDetailModal({ post, onClose }) {
  const [isVisible, setIsVisible] = useState(false)
  const isClosingRef = useRef(false)
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose
  const closeTimerRef = useRef(null)

  const handleAnimatedClose = useCallback(() => {
    if (isClosingRef.current) return
    isClosingRef.current = true
    setIsVisible(false)
    closeTimerRef.current = setTimeout(() => {
      onCloseRef.current?.()
    }, EXIT_DURATION_MS)
  }, [])

  useEffect(() => {
    const rafId = requestAnimationFrame(() => {
      setIsVisible(true)
    })

    const onKeyDown = (e) => {
      if (e.key !== 'Escape') return
      // Jangan tutup modal detail jika sedang ada dialog konfirmasi atau dropdown terbuka di atasnya
      if (
        document.querySelector(
          '[data-slot="alert-dialog-content"], [data-slot="dropdown-menu-content"]'
        )
      ) {
        return
      }
      handleAnimatedClose()
    }
    window.addEventListener('keydown', onKeyDown)

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('keydown', onKeyDown)
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current)
    }
  }, [handleAnimatedClose])

  if (!post || typeof document === 'undefined') return null

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Detail laporan"
      onClick={handleAnimatedClose}
      className={`no-scrollbar fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto overscroll-contain px-3 py-6 backdrop-blur-[2px] transition-colors duration-200 sm:px-6 sm:py-10 ${
        isVisible ? 'bg-black/65' : 'bg-black/0'
      }`}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`my-auto w-full max-w-2xl origin-center transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isVisible
            ? 'opacity-100'
            : 'translate-y-4 scale-[0.95] opacity-0'
        }`}
      >
        <PostDetail post={post} onBack={handleAnimatedClose} />
      </div>
    </div>,
    document.body
  )
}
