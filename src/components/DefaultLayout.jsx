import { useEffect } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { toast } from 'sonner'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useAuth } from '../context/AuthContext'

export default function DefaultLayout({ children }) {
  const location = useLocation()
  const { user, isAuthenticated } = useAuth()
  const needsPhone =
    isAuthenticated && Boolean(user) && !String(user.whatsapp || '').trim()
  const shouldRedirectToProfile = needsPhone && location.pathname !== '/profile'

  useEffect(() => {
    if (shouldRedirectToProfile) {
      toast.info('Silakan lengkapi nomor WhatsApp Anda terlebih dahulu.', {
        id: 'missing-phone-redirect',
      })
    }
  }, [shouldRedirectToProfile])

  if (shouldRedirectToProfile) {
    return <Navigate to="/profile" replace />
  }

  return (
    <div className="flex min-h-screen w-full flex-col justify-between bg-[#f8f9fa] text-gray-800">
      <div className="w-full">
        <Navbar />
        <main>{children}</main>
      </div>

      <Footer />
    </div>
  )
}
