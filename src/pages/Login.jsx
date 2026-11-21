import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import AuthLayout from '../components/AuthLayout'
import GoogleAuthButton from '../components/GoogleAuthButton'
import TextField from '../components/TextField'
import { useAuth } from '../context/AuthContext'
import { validateEmail, validatePassword } from '../lib/validators'

export default function Login() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { login, persistSession, refreshUser } = useAuth()
  const [values, setValues] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Tangani callback jika menggunakan redirect OAuth (?token=... atau ?error=...)
  useEffect(() => {
    const errorFromUrl = searchParams.get('error')
    if (errorFromUrl) {
      toast.error(errorFromUrl)
      return
    }

    const tokenFromUrl = searchParams.get('token')
    if (tokenFromUrl) {
      persistSession(tokenFromUrl, null)
      refreshUser()
        .then((u) => {
          if (u?.email && !u.email.toLowerCase().endsWith('@widyatama.ac.id')) {
            localStorage.removeItem('auth_token')
            localStorage.removeItem('auth_user')
            toast.error('Hanya email @widyatama.ac.id yang diperbolehkan untuk login.')
            return
          }
          toast.success('Login Google berhasil!')
          if (!String(u?.whatsapp || '').trim()) {
            toast.info('Lengkapi nomor WhatsApp Anda terlebih dahulu.')
            navigate('/profile', { replace: true })
          } else {
            navigate('/', { replace: true })
          }
        })
        .catch(() => {})
    }
  }, [searchParams, persistSession, refreshUser, navigate])

  const handleChange = (e) => {
    const { name, value } = e.target
    setValues((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const nextErrors = {
      email: validateEmail(values.email),
      password: validatePassword(values.password),
    }
    setErrors(nextErrors)
    if (Object.values(nextErrors).some(Boolean)) return

    try {
      setIsSubmitting(true)
      const data = await login(values)
      toast.success('Login berhasil!')
      if (!String(data?.user?.whatsapp || '').trim()) {
        toast.info('Lengkapi nomor WhatsApp Anda terlebih dahulu.')
        navigate('/profile')
      } else {
        navigate('/')
      }
    } catch (err) {
      if (err.errors) {
        setErrors((prev) => ({
          ...prev,
          email: err.errors.email?.[0] || prev.email,
          password: err.errors.password?.[0] || prev.password,
        }))
      }
      toast.error(err.message || 'Gagal masuk. Periksa kembali email dan password.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthLayout
      title="Login to your account"
      subtitle="Welcome back. Let's help you find what you've lost."
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <TextField
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="nama@widyatama.ac.id"
          value={values.email}
          onChange={handleChange}
          error={errors.email}
        />
        <TextField
          label="Password"
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="Enter your password here"
          value={values.password}
          onChange={handleChange}
          error={errors.password}
        />

        <button
          type="submit"
          disabled={isSubmitting}
          className="h-11 w-full rounded-lg bg-black text-sm font-semibold text-white transition hover:bg-neutral-800 active:scale-[0.99] disabled:opacity-60"
        >
          {isSubmitting ? 'Memproses...' : 'Login'}
        </button>

        <div className="relative flex items-center py-1">
          <div className="flex-grow border-t border-gray-200" />
          <span className="mx-3 shrink-0 text-xs text-gray-400">atau</span>
          <div className="flex-grow border-t border-gray-200" />
        </div>

        <GoogleAuthButton label="Continue with Google" />
      </form>
    </AuthLayout>
  )
}