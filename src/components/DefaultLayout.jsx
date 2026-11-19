import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

export default function DefaultLayout({ children }) {
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
