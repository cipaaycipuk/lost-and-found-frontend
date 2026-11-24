import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useLocation } from 'react-router-dom'

const CURTAIN_DURATION_MS = 1000
const INTERACTION_LOCK_MS = 650

function getRouteLabel(pathname) {
  if (pathname === '/') return 'Beranda'
  if (pathname.startsWith('/admin/dashboard')) return 'Dashboard Admin'
  if (pathname.startsWith('/admin/posts')) return 'Postingan Admin'
  if (pathname.startsWith('/admin/users')) return 'Pengguna Admin'
  if (pathname.startsWith('/admin/claims')) return 'Pengajuan Klaim'
  if (pathname.startsWith('/admin')) return 'Admin'
  if (pathname.startsWith('/profile')) return 'Profil Pengguna'
  if (pathname.startsWith('/buat-laporan')) return 'Buat Laporan'
  if (pathname.startsWith('/edit-laporan')) return 'Edit Laporan'
  if (pathname.startsWith('/posts')) return 'Detail Laporan'
  return 'Lost & Found'
}

export default function PageTransitionCurtain() {
  const { pathname } = useLocation()
  const prevPathRef = useRef(pathname)
  const [transitionKey, setTransitionKey] = useState(0)
  const [showCurtain, setShowCurtain] = useState(false)
  const [lockPointer, setLockPointer] = useState(false)

  useEffect(() => {
    if (pathname === '/admin') return undefined
    const prev = prevPathRef.current
    if (prev === pathname) return undefined
    prevPathRef.current = pathname

    // Jangan tampilkan curtain saat berpindah antar halaman di dalam /admin
    const isStayingInAdmin = prev.startsWith('/admin') && pathname.startsWith('/admin')
    if (
      isStayingInAdmin ||
      ['/login', '/register', '/403', '/500'].includes(pathname)
    ) {
      setShowCurtain(false)
      setLockPointer(false)
      return undefined
    }

    setTransitionKey((k) => k + 1)
    setShowCurtain(true)
    setLockPointer(true)

    const unlockTimer = setTimeout(() => {
      setLockPointer(false)
    }, INTERACTION_LOCK_MS)

    const hideTimer = setTimeout(() => {
      setShowCurtain(false)
    }, CURTAIN_DURATION_MS)

    return () => {
      clearTimeout(unlockTimer)
      clearTimeout(hideTimer)
    }
  }, [pathname])

  if (!showCurtain || typeof document === 'undefined') return null

  return createPortal(
    <div
      key={transitionKey}
      aria-hidden="true"
      className={`animate-page-curtain fixed inset-0 z-[95] flex flex-col items-center justify-center bg-[#171717] text-white ${
        lockPointer ? 'pointer-events-auto' : 'pointer-events-none'
      }`}
    >
      <div className="animate-page-curtain-brand flex flex-col items-center gap-3">
        <img
          src="/solo.png"
          alt=""
          className="h-14 w-14 rounded-full object-cover shadow-xl ring-2 ring-white/15"
        />
        <span className="text-xs font-semibold tracking-widest uppercase text-white/85">
          {getRouteLabel(pathname)}
        </span>
        <div className="h-0.5 w-24 overflow-hidden rounded-full bg-white/15">
          <div className="animate-page-curtain-bar h-full w-full bg-[#F05A00]" />
        </div>
      </div>
    </div>,
    document.body
  )
}
