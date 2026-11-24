import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { Bell, Menu, Plus, Search, ShieldCheck, User, X, CheckCheck } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { useAuth } from '../context/AuthContext'
import { resolveMediaUrl } from '../lib/formatters'
import {
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
  useNotificationsQuery,
} from '../hooks/useNotifications'
import { resolveNotificationUrl } from '../services/notificationService'

export default function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const urlQuery = searchParams.get('q') || ''
  const [searchQuery, setSearchQuery] = useState(urlQuery)
  const [notifOpen, setNotifOpen] = useState(false)
  const isTypingRef = useRef(false)
  const debounceTimerRef = useRef(null)

  const { user, isAuthenticated } = useAuth()
  const { data: notifications = [] } = useNotificationsQuery()
  const markRead = useMarkNotificationReadMutation()
  const markAllRead = useMarkAllNotificationsReadMutation()

  const unreadCount = notifications.filter((n) => !n.isRead).length

  useEffect(() => {
    if (!isTypingRef.current) {
      setSearchQuery(urlQuery)
    }
  }, [urlQuery])

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [])

  const syncSearchToUrl = (value) => {
    const trimmed = value.trim()
    if (location.pathname !== '/') {
      if (trimmed) {
        navigate(`/?q=${encodeURIComponent(trimmed)}`)
      }
      return
    }
    const next = new URLSearchParams(searchParams)
    if (trimmed) {
      next.set('q', trimmed)
    } else {
      next.delete('q')
    }
    setSearchParams(next, { replace: true })
  }

  const handleSearchChange = (value) => {
    isTypingRef.current = true
    setSearchQuery(value)

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    debounceTimerRef.current = setTimeout(() => {
      syncSearchToUrl(value)
      isTypingRef.current = false
    }, 300)
  }

  const handleClearSearch = () => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }
    isTypingRef.current = false
    setSearchQuery('')
    syncSearchToUrl('')
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }
    isTypingRef.current = false
    syncSearchToUrl(searchQuery)
  }

  return (
    <header className="sticky top-3 z-40 mx-auto w-full max-w-7xl px-3 sm:top-4 sm:px-4">
      <div className="rounded-full bg-black/90 px-2.5 py-2 text-white shadow-xl backdrop-blur-2xl sm:px-3 sm:py-3 lg:px-4">
        <div className="flex items-center justify-between gap-2 sm:gap-3">
          {/* KIRI: Logo & Search Bar (Selalu tampil di mobile & desktop sesuai desain) */}
          <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
            <Link
              to="/"
              aria-label="Beranda Lost & Found"
              className="shrink-0 transition hover:opacity-90"
            >
              <img
                src="/solo.png"
                alt="Lost & Found"
                className="h-9 w-9 rounded-full object-cover sm:h-10 sm:w-10"
              />
            </Link>

            <form
              onSubmit={handleSearchSubmit}
              className="flex min-w-0 flex-1 items-center rounded-full bg-white/15 px-3 py-1 text-sm text-white transition focus-within:bg-white/25 sm:max-w-sm lg:max-w-md"
            >
              <Search className="mr-2 h-4 w-4 shrink-0 text-gray-300" />
              <Input
                type="text"
                aria-label="Cari barang hilang atau ditemukan"
                placeholder="Cari barang..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="h-7 w-full border-0 bg-transparent px-0 text-xs text-white shadow-none placeholder:text-gray-300 focus:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 sm:h-8 sm:text-sm"
              />
              {searchQuery && (
                <button
                  type="button"
                  aria-label="Hapus pencarian"
                  onClick={handleClearSearch}
                  className="ml-1.5 rounded-full p-0.5 text-gray-300 transition hover:bg-white/20 hover:text-white"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </form>
          </div>

          {/* KANAN: Desktop actions + Mobile Bell & Hamburger */}
          <div className="flex shrink-0 items-center gap-1 sm:gap-2.5">
            <Link
              to="/buat-laporan"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-[#e0531c] px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-[#c84615] active:scale-95 lg:px-4"
            >
              <Plus className="h-4 w-4" />
              <span>Buat Laporan</span>
            </Link>

            {isAuthenticated && user?.role === 'admin' && (
              <Link
                to="/admin"
                aria-label="Dashboard Admin"
                title="Dashboard Admin"
                className={`hidden sm:inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold transition ${
                  location.pathname.startsWith('/admin')
                    ? 'bg-white text-black'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                <ShieldCheck className="h-4 w-4" />
                <span className="hidden md:inline">Admin</span>
              </Link>
            )}

            {/* Notifikasi */}
            <DropdownMenu open={notifOpen} onOpenChange={setNotifOpen}>
              <DropdownMenuTrigger
                aria-label="Notifikasi"
                className="relative rounded-full p-2 text-gray-300 outline-none transition hover:bg-white/10 hover:text-white"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[#e0531c]" />
                )}
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="end"
                sideOffset={12}
                className="w-[calc(100vw-1.5rem)] overflow-hidden rounded-2xl border border-gray-200 bg-white p-0 text-gray-900 shadow-xl sm:w-80"
              >
                <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
                  <span className="text-sm font-semibold">Notifikasi</span>
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      disabled={markAllRead.isPending}
                      onPointerDown={(e) => e.stopPropagation()}
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        markAllRead.mutate()
                      }}
                      className="inline-flex cursor-pointer items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold text-[#e0531c] transition hover:bg-orange-50 disabled:opacity-50"
                    >
                      <CheckCheck className="h-3.5 w-3.5" />
                      {markAllRead.isPending ? 'Memproses...' : 'Tandai dibaca'}
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
                      <DropdownMenuItem
                        key={notif.id}
                        onClick={() => {
                          if (!notif.isRead) markRead.mutate(notif.id)
                          setNotifOpen(false)
                          navigate(resolveNotificationUrl(notif))
                        }}
                        className={`block w-full cursor-pointer rounded-none px-4 py-3 text-left transition ${
                          notif.isRead ? 'bg-white' : 'bg-orange-50/50'
                        }`}
                      >
                        <p className="text-xs leading-relaxed text-gray-800">
                          {notif.message}
                        </p>
                        <span className="mt-1 block text-[11px] text-gray-500">
                          {notif.timeAgo}
                        </span>
                      </DropdownMenuItem>
                    ))
                  )}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Desktop: Profil / Login */}
            <Link
              to={isAuthenticated ? '/profile' : '/login'}
              aria-label={isAuthenticated ? 'Profil saya' : 'Masuk akun'}
              className="hidden sm:flex items-center gap-2 rounded-full p-1 text-gray-300 transition hover:bg-white/10 hover:text-white"
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

            {/* Mobile: Hamburger Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger
                aria-label="Menu navigasi"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full text-gray-200 outline-none transition hover:bg-white/10 sm:hidden"
              >
                <Menu className="h-5 w-5" />
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                sideOffset={12}
                className="w-48 rounded-2xl border border-gray-200 bg-white p-1.5 text-gray-900 shadow-xl"
              >
                <DropdownMenuItem
                  onClick={() => navigate(isAuthenticated ? '/profile' : '/login')}
                  className="cursor-pointer rounded-xl px-3 py-2.5 text-sm font-medium"
                >
                  <User className="mr-2 h-4 w-4" />
                  {isAuthenticated ? 'Profil Saya' : 'Masuk Akun'}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => navigate('/buat-laporan')}
                  className="cursor-pointer rounded-xl px-3 py-2.5 text-sm font-medium text-[#e0531c]"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Buat Laporan
                </DropdownMenuItem>
                {isAuthenticated && user?.role === 'admin' && (
                  <DropdownMenuItem
                    onClick={() => navigate('/admin')}
                    className="cursor-pointer rounded-xl px-3 py-2.5 text-sm font-medium"
                  >
                    <ShieldCheck className="mr-2 h-4 w-4" />
                    Dashboard Admin
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Mobile Floating Action Button (+) */}
      {location.pathname !== '/buat-laporan' && (
        <Link
          to="/buat-laporan"
          aria-label="Buat Laporan Baru"
          className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#e0531c] text-white shadow-xl transition hover:bg-[#c84615] active:scale-95 sm:hidden"
        >
          <Plus className="h-7 w-7" />
        </Link>
      )}
    </header>
  )
}
