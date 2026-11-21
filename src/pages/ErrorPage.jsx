import { useNavigate } from 'react-router-dom'
import GradientBlinds from '../components/GradientBlinds'

const ERROR_CONFIGS = {
  403: {
    headline: 'Halaman ini khusus admin',
    code: '403',
    title: 'Akses ditolak',
    description:
      'Kamu tidak memiliki izin untuk membuka halaman ini. Halaman ini hanya bisa diakses oleh admin. Jika kamu merasa ini keliru, hubungi admin kampus.',
  },
  404: {
    headline: 'Halaman tidak ditemukan',
    code: '404',
    title: 'Laporan atau halaman hilang',
    description:
      'Halaman yang kamu cari mungkin sudah dihapus, dipindahkan, atau alamat URL yang dimasukkan tidak tersedia.',
  },
  500: {
    headline: 'Terjadi gangguan pada server',
    code: '500',
    title: 'Kesalahan server',
    description:
      'Maaf, sistem sedang mengalami kendala teknis. Silakan coba muat ulang halaman atau kembali ke beranda.',
  },
}

export default function ErrorPage({
  code = 404,
  title,
  description,
  headline,
  onRetry,
}) {
  const navigate = useNavigate()
  const config = ERROR_CONFIGS[code] || ERROR_CONFIGS[404]

  return (
    <div className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-[#f8f9fa] px-4 py-8 sm:px-6 lg:px-10">
      <div className="grid w-full max-w-4xl grid-cols-1 items-center gap-8 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200/80 sm:p-8 lg:grid-cols-2 lg:gap-12 lg:p-10">
        {/* Panel Kiri: Visual GradientBlinds sesuai desain */}
        <div className="relative flex min-h-[220px] w-full flex-col justify-between overflow-hidden rounded-2xl bg-black p-6 sm:min-h-[280px] lg:min-h-[420px] lg:p-8">
          <div className="absolute inset-0">
            <GradientBlinds
              gradientColors={['#e0531c', '#001994', '#050505']}
              angle={10}
              noise={0.22}
              blindCount={12}
              blindMinWidth={56}
              spotlightRadius={0.6}
              spotlightSoftness={1.1}
              spotlightOpacity={0.95}
              distortAmount={0.1}
              mouseDampening={0.15}
              shineDirection="left"
            />
          </div>

          <h2 className="pointer-events-none relative z-10 max-w-xs text-2xl font-semibold leading-tight text-white sm:text-3xl lg:text-4xl">
            {headline || config.headline}
          </h2>
        </div>

        {/* Panel Kanan: Kode Error & Aksi */}
        <div className="flex flex-col items-start text-left">
          <span className="text-5xl font-extrabold tracking-tight text-[#e0531c] tabular-nums sm:text-6xl">
            {config.code}
          </span>

          <h1 className="mt-3 text-2xl font-bold text-gray-900 sm:text-3xl">
            {title || config.title}
          </h1>

          <p className="mt-3 text-sm leading-relaxed text-gray-600">
            {description || config.description}
          </p>

          <div className="mt-7 flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="w-full rounded-lg bg-[#e0531c] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#c84615] active:scale-[0.99] sm:w-auto"
            >
              Kembali ke Beranda
            </button>

            {onRetry ? (
              <button
                type="button"
                onClick={onRetry}
                className="w-full rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-800 transition hover:bg-gray-50 sm:w-auto"
              >
                Coba lagi
              </button>
            ) : (
              <button
                type="button"
                onClick={() => navigate('/profile')}
                className="w-full rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-800 transition hover:bg-gray-50 sm:w-auto"
              >
                Lihat laporan saya
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
