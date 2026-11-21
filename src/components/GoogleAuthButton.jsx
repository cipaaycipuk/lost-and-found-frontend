import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { GoogleLogin, useGoogleLogin } from '@react-oauth/google'
import { toast } from 'sonner'
import { useAuth } from '../context/AuthContext'
import { authService } from '../services/authService'
import { USE_MOCK } from '../lib/axios'
import { EMAIL_DOMAIN } from '../lib/validators'
import { INITIAL_POSTS, currentUser } from '../lib/dummyData'

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || ''

const DUMMY_GOOGLE_ACCOUNTS = [
  {
    name: currentUser.name,
    email: currentUser.email,
    avatar: currentUser.avatar,
    google_id: 'google-1001-syifa',
  },
  ...INITIAL_POSTS.filter((p) => p.author.email !== currentUser.email).map((p) => ({
    name: p.author.name,
    email: p.author.email,
    avatar: p.author.avatar,
    google_id: `google-100${p.author.id}-${p.author.name.split(' ')[0].toLowerCase()}`,
  })),
  {
    name: 'Agatha Chelsea',
    email: 'agatha.chelsea@widyatama.ac.id',
    avatar: '/users/emily.jpg',
    google_id: 'google-1004-agatha',
  },
]

export default function GoogleAuthButton({ label = 'Continue with Google' }) {
  const navigate = useNavigate()
  const { loginWithGoogle } = useAuth()
  const [loading, setLoading] = useState(false)
  const [showMockPicker, setShowMockPicker] = useState(false)

  // Hook resmi dari @react-oauth/google untuk mendapatkan access_token OAuth 2.0
  const triggerGoogleOAuth = useGoogleLogin({
    hosted_domain: 'widyatama.ac.id',
    onSuccess: async (tokenResponse) => {
      try {
        setLoading(true)
        // Verifikasi domain email sebelum dikirim ke backend
        try {
          const infoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
          })
          if (infoRes.ok) {
            const profile = await infoRes.json()
            if (!String(profile?.email || '').toLowerCase().endsWith(EMAIL_DOMAIN)) {
              toast.error(`Login ditolak. Hanya email ${EMAIL_DOMAIN} yang diperbolehkan.`)
              setLoading(false)
              return
            }
          }
        } catch {
          // Jika fetch userinfo gagal, biarkan backend memvalidasi access_token
        }

        const data = await loginWithGoogle({
          access_token: tokenResponse.access_token,
        })
        toast.success('Login dengan Google berhasil!')
        if (!String(data?.user?.whatsapp || '').trim()) {
          toast.info('Lengkapi nomor WhatsApp Anda terlebih dahulu.')
          navigate('/profile')
        } else {
          navigate('/')
        }
      } catch (err) {
        toast.error(err.message || 'Gagal verifikasi token Google di server.')
      } finally {
        setLoading(false)
      }
    },
    onError: () => {
      toast.error('Login Google dibatalkan atau gagal.')
      setLoading(false)
    },
  })

  // Handler untuk komponen <GoogleLogin /> resmi (@react-oauth/google) yang menghasilkan JWT credential / id_token
  const handleCredentialSuccess = async (credentialResponse) => {
    if (!credentialResponse?.credential) return
    try {
      setLoading(true)
      try {
        const payload = JSON.parse(atob(credentialResponse.credential.split('.')[1]))
        if (payload?.email && !String(payload.email).toLowerCase().endsWith(EMAIL_DOMAIN)) {
          toast.error(`Login ditolak. Hanya email ${EMAIL_DOMAIN} yang diperbolehkan.`)
          setLoading(false)
          return
        }
      } catch {
        // Abaikan error decode, biarkan backend memvalidasi JWT
      }

      const data = await loginWithGoogle({
        credential: credentialResponse.credential,
        id_token: credentialResponse.credential,
      })
      toast.success('Login dengan Google berhasil!')
      if (!String(data?.user?.whatsapp || '').trim()) {
        toast.info('Lengkapi nomor WhatsApp Anda terlebih dahulu.')
        navigate('/profile')
      } else {
        navigate('/')
      }
    } catch (err) {
      toast.error(err.message || 'Gagal verifikasi Google Credential di server.')
    } finally {
      setLoading(false)
    }
  }

  const handleButtonClick = async () => {
    if (USE_MOCK) {
      setShowMockPicker(true)
      return
    }

    if (GOOGLE_CLIENT_ID) {
      setLoading(true)
      triggerGoogleOAuth()
      return
    }

    // Jika VITE_GOOGLE_CLIENT_ID belum diset di frontend, gunakan endpoint Laravel Socialite Redirect
    try {
      setLoading(true)
      await authService.redirectToGoogleOAuth()
    } catch (err) {
      toast.error(err.message || 'Gagal mengarahkan ke halaman Google Login.')
      setLoading(false)
    }
  }

  const handleSelectMockAccount = async (account) => {
    try {
      setLoading(true)
      const data = await loginWithGoogle(account)
      toast.success(`Masuk dengan Google (${account.email})`)
      setShowMockPicker(false)
      if (!String(data?.user?.whatsapp || '').trim()) {
        toast.info('Lengkapi nomor WhatsApp Anda terlebih dahulu.')
        navigate('/profile')
      } else {
        navigate('/')
      }
    } catch (err) {
      toast.error(err.message || 'Gagal login mock Google.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-2">
      {/* Tombol utama menggunakan useGoogleLogin (@react-oauth/google) atau Socialite Redirect */}
      <button
        type="button"
        disabled={loading}
        onClick={handleButtonClick}
        className="flex h-11 w-full items-center justify-center gap-2.5 rounded-lg border border-gray-300 bg-white px-4 text-sm font-semibold text-gray-800 transition hover:bg-gray-50 active:scale-[0.99] disabled:opacity-60"
      >
        <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
          <path
            fill="#4285F4"
            d="M23.745 12.27c0-.79-.07-1.54-.19-2.27h-11.3v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82Z"
          />
          <path
            fill="#34A853"
            d="M12.255 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96h-3.98v3.09C3.515 21.3 7.565 24 12.255 24Z"
          />
          <path
            fill="#FBBC05"
            d="M5.525 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62h-3.98a11.86 11.86 0 0 0 0 10.76l3.98-3.09Z"
          />
          <path
            fill="#EA4335"
            d="M12.255 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C18.205 1.19 15.495 0 12.255 0c-4.69 0-8.74 2.7-10.71 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96Z"
          />
        </svg>
        <span>{loading ? 'Menghubungkan Google...' : label}</span>
      </button>

      {/* Jika VITE_GOOGLE_CLIENT_ID tersedia, render juga GoogleLogin GIS credential jika origin sudah didaftarkan */}
      {GOOGLE_CLIENT_ID && !USE_MOCK && (
        <div className="hidden">
          <GoogleLogin
            onSuccess={handleCredentialSuccess}
            onError={() => {}}
            useOneTap={false}
          />
        </div>
      )}

      {/* Popup khusus saat VITE_USE_MOCK=true */}
      {showMockPicker && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => !loading && setShowMockPicker(false)}
        >
          <div
            className="w-full max-w-md overflow-hidden rounded-2xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-bold text-gray-900">
              Pilih Akun Dummy Google (Mode Mock)
            </h3>
            <p className="mt-0.5 text-xs text-gray-500">
              Email yang sama dengan akun manual akan otomatis ditautkan
            </p>
            <div className="mt-3 divide-y divide-gray-100">
              {DUMMY_GOOGLE_ACCOUNTS.map((acc) => (
                <button
                  key={acc.email}
                  type="button"
                  disabled={loading}
                  onClick={() => handleSelectMockAccount(acc)}
                  className="flex w-full items-center gap-3 rounded-lg px-2 py-2.5 text-left transition hover:bg-gray-50"
                >
                  <img
                    src={acc.avatar}
                    alt={acc.name}
                    className="h-9 w-9 rounded-full object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-gray-900">
                      {acc.name}
                    </p>
                    <p className="truncate text-xs text-gray-500">{acc.email}</p>
                  </div>
                </button>
              ))}
            </div>
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setShowMockPicker(false)}
                className="rounded-lg px-3 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-100"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
