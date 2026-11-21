import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { Bell, Plus, Search, User, X, CheckCheck } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { resolveMediaUrl } from '../lib/formatters'
import {
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
  useNotificationsQuery,
} from '../hooks/useNotifications'

export default function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '')
  const [isNotifOpen, setIsNotifOpen] = useState(false)
  const notifRef = useRef(null)

  const { user, isAuthenticated } = useAuth()
  const { data: notifications = [] } = useNotificationsQuery()
  const markRead = useMarkNotificationReadMutation()
  const markAllRead = useMarkAllNotificationsReadMutation()

  const unreadCount = notifications.filter((n) => !n.isRead).length

  useEffect(() => {
    setSearchQuery(searchParams.get('q') || '')
  }, [searchParams])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setIsNotifOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const applySearch = (value) => {
    setSearchQuery(value)
    if (location.pathname !== '/') {
      navigate(value ? `/?q=${encodeURIComponent(value)}` : '/')
      return
    }
    const next = new URLSearchParams(searchParams)
    if (value.trim()) {
      next.set('q', value)
    } else {
      next.delete('q')
    }
    setSearchParams(next, { replace: true })
  }

  return (
    <header className="sticky top-4 z-50 mx-auto w-full max-w-7xl px-4">
      <div className="flex items-center justify-between gap-3 rounded-full bg-black/85 backdrop-blur-2xl px-3 py-3 text-white shadow-xl lg:px-4">
        {/* KIRI: Logo & Search Bar */}
        <div className="flex flex-1 items-center gap-3">
          <Link
            to="/"
            aria-label="Beranda Lost & Found"
            className="shrink-0 transition hover:opacity-90"
          >
            <img
              src="/solo.png"
              alt="Lost & Found"
              className="h-10 w-10 rounded-full object-cover"
            />
          </Link>

          <div className="flex w-full max-w-sm items-center rounded-full bg-white/15 px-3.5 py-2 text-sm text-white transition focus-within:bg-white/20 lg:max-w-md">
            <Search className="mr-2.5 h-4 w-4 shrink-0 text-gray-300" />
            <input
              type="search"
              aria-label="Cari barang hilang atau ditemukan"
              placeholder="Cari barang hilang atau ditemukan..."
              value={searchQuery}
              onChange={(e) => applySearch(e.target.value)}
              className="w-full bg-transparent text-sm text-white placeholder-gray-300 outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                aria-label="Hapus pencarian"
                onClick={() => applySearch('')}
                className="ml-1.5 rounded-full p-0.5 text-gray-300 transition hover:bg-white/15 hover:text-white"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* KANAN: Tombol Laporan, Notifikasi & Profil */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            to="/buat-laporan"
            className="inline-flex items-center gap-1.5 rounded-full bg-[#e0531c] px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-[#c84615] active:scale-95 sm:text-sm lg:px-4"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Buat Laporan</span>
            <span className="sm:hidden">Lapor</span>
          </Link>

          {/* Notifikasi */}
          <div className="relative" ref={notifRef}>
            <button
              type="button"
              aria-label="Notifikasi"
              aria-expanded={isNotifOpen}
              onClick={() => setIsNotifOpen((prev) => !prev)}
              className="relative rounded-full p-2 text-gray-300 transition hover:bg-white/10 hover:text-white"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[#e0531c]" />
              )}
            </button>

            {isNotifOpen && (
              <div className="absolute right-0 mt-3 w-80 overflow-hidden rounded-2xl border border-gray-200 bg-white text-gray-900 shadow-xl">
                <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
                  <span className="text-sm font-semibold">Notifikasi</span>
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={() => markAllRead.mutate()}
                      className="inline-flex items-center gap-1 text-xs font-medium text-[#e0531c] hover:underline"
                    >
                      <CheckCheck className="h-3.5 w-3.5" />
                      Tandai dibaca
                    </button>
                  )}
                </div>
                <div className="max-h-72 divide-y divide-gray-100 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="px-4 py-8 text-center text-xs text-gray-500">
                      Belum ada notifikasi.
                    </p>
                  ) : (
                    notifications.map((notif) => (
                      <button
                        key={notif.id}
                        type="button"
                        onClick={() => {
                          if (!notif.isRead) markRead.mutate(notif.id)
                          setIsNotifOpen(false)
                          navigate('/')
                        }}
                        className={`w-full px-4 py-3 text-left transition hover:bg-gray-50 ${
                          notif.isRead ? 'bg-white' : 'bg-orange-50/50'
                        }`}
                      >
                        <p className="text-xs leading-relaxed text-gray-800">
                          {notif.message}
                        </p>
                        <span className="mt-1 block text-[11px] text-gray-400">
                          {notif.timeAgo}
                        </span>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Profil / Login */}
          <Link
            to={isAuthenticated ? '/profile' : '/login'}
            aria-label={isAuthenticated ? 'Profil saya' : 'Masuk akun'}
            className="flex items-center gap-2 rounded-full p-1 text-gray-300 transition hover:bg-white/10 hover:text-white"
          >
            {isAuthenticated && (user?.avatar_url || user?.avatar) ? (
              <img
                src={resolveMediaUrl(user.avatar_url || user.avatar)}
                alt={user.name}
                className="h-8 w-8 rounded-full border border-white/25 object-cover"
              />
            ) : (
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10">
                <User className="h-4 w-4" />
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  )
}
