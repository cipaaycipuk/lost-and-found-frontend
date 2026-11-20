import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import AuthLayout from '../components/AuthLayout'
import GoogleAuthButton from '../components/GoogleAuthButton'
import TextField from '../components/TextField'
import { useAuth } from '../context/AuthContext'
import {
  validateEmail,
  validateName,
  validatePassword,
  validatePhone,
} from '../lib/validators'

export default function Register() {
  const navigate = useNavigate()
  const { register } = useAuth()
  const [values, setValues] = useState({ name: '', email: '', password: '', contact: '' })
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setValues((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const nextErrors = {
      name: validateName(values.name),
      email: validateEmail(values.email),
      password: validatePassword(values.password),
      contact: validatePhone(values.contact),
    }
    setErrors(nextErrors)
    if (Object.values(nextErrors).some(Boolean)) return

    try {
      setIsSubmitting(true)
      await register(values)
      toast.success('Registrasi berhasil!')
      navigate('/')
    } catch (err) {
      if (err.errors) {
        setErrors((prev) => ({
          ...prev,
          name: err.errors.name?.[0] || prev.name,
          email: err.errors.email?.[0] || prev.email,
          password: err.errors.password?.[0] || prev.password,
          contact: err.errors.whatsapp?.[0] || err.errors.contact?.[0] || prev.contact,
        }))
      }
      toast.error(err.message || 'Gagal mendaftar akun.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthLayout
      title="Register new account"
      subtitle="Join us in making lost things find their way home."
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <TextField
          label="Name"
          name="name"
          autoComplete="name"
          placeholder="What should we call you?"
          value={values.name}
          onChange={handleChange}
          error={errors.name}
        />
        <TextField
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="Make sure you enter your widyatama email here"
          value={values.email}
          onChange={handleChange}
          error={errors.email}
        />
        <TextField
          label="Password"
          name="password"
          type="password"
          autoComplete="new-password"
          placeholder="We recommend to combine symbol and angka"
          value={values.password}
          onChange={handleChange}
          error={errors.password}
        />
        <TextField
          label="Contact"
          name="contact"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="Add your phone number (Whatsapp recommend)"
          value={values.contact}
          onChange={handleChange}
          error={errors.contact}
        />

        <button
          type="submit"
          disabled={isSubmitting}
          className="h-11 w-full rounded-lg bg-black text-sm font-semibold text-white transition hover:bg-neutral-800 active:scale-[0.99] disabled:opacity-60"
        >
          {isSubmitting ? 'Memproses...' : 'Register'}
        </button>

        <div className="relative flex items-center py-1">
          <div className="flex-grow border-t border-gray-200" />
          <span className="mx-3 shrink-0 text-xs text-gray-400">atau</span>
          <div className="flex-grow border-t border-gray-200" />
        </div>

        <GoogleAuthButton label="Continue with Google" />

        <p className="text-sm">
          Already have an account?{' '}
          <Link to="/login" className="underline underline-offset-4">
            login here
          </Link>
        </p>
      </form>
    </AuthLayout>
  )
}