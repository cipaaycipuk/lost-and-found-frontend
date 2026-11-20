/**
 * Format nomor WhatsApp lokal (08xx / +62) menjadi link wa.me/62...
 */
export function formatWhatsAppUrl(phone, message = '') {
  if (!phone) return null
  const digits = String(phone).replace(/\D/g, '')
  if (!digits) return null
  const normalized = digits.startsWith('0')
    ? `62${digits.slice(1)}`
    : digits.startsWith('62')
      ? digits
      : `62${digits}`

  const textParam = message ? `?text=${encodeURIComponent(message)}` : ''
  return `https://wa.me/${normalized}${textParam}`
}

/**
 * Format tanggal ISO / YYYY-MM-DD ke bahasa Indonesia yang mudah dibaca
 */
export function formatDateId(dateValue) {
  if (!dateValue) return '-'
  const date = new Date(dateValue)
  if (Number.isNaN(date.getTime())) return String(dateValue)
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

/**
 * Hitung waktu relatif sederhana (e.g. "21 detik yang lalu", "2 jam yang lalu")
 */
export function formatTimeAgo(dateValue) {
  if (!dateValue) return 'Baru saja'
  const date = new Date(dateValue)
  if (Number.isNaN(date.getTime())) return String(dateValue)

  const diffSec = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000))
  if (diffSec < 60) return `${diffSec} detik yang lalu`
  const diffMin = Math.floor(diffSec / 60)
  if (diffMin < 60) return `${diffMin} menit yang lalu`
  const diffHour = Math.floor(diffMin / 60)
  if (diffHour < 24) return `${diffHour} jam yang lalu`
  const diffDay = Math.floor(diffHour / 24)
  if (diffDay < 30) return `${diffDay} hari yang lalu`
  return formatDateId(dateValue)
}

/**
 * Normalisasi objek post dari backend maupun mock ke bentuk yang konsisten di UI
 */
export function normalizePost(raw) {
  if (!raw) return null
  const rawType = String(raw.type || raw.tipe || 'kehilangan').toLowerCase()
  const type = rawType === 'ditemukan' ? 'ditemukan' : 'kehilangan'

  const images = Array.isArray(raw.images)
    ? raw.images
    : raw.image
      ? [raw.image]
      : []

  return {
    id: raw.id,
    type,
    typeLabel: type === 'kehilangan' ? 'Kehilangan' : 'Ditemukan',
    status: raw.status === 'selesai' || raw.status === 'resolved' ? 'selesai' : 'open',
    title: raw.title || raw.nama_barang || 'Tanpa judul',
    category: raw.category || raw.kategori || 'Lainnya',
    location: raw.location || raw.lokasi || '-',
    date: raw.incident_date
      ? formatDateId(raw.incident_date)
      : raw.date || '-',
    rawDate: raw.incident_date || raw.created_at || '',
    description: raw.description || raw.deskripsi || '',
    images,
    image: images[0] || null,
    commentsCount: raw.comments_count ?? raw.commentsCount ?? raw.commentCount ?? 0,
    isSaved: Boolean(raw.is_saved ?? raw.isSaved ?? false),
    createdAt: raw.created_at || new Date().toISOString(),
    timeAgo: raw.timeAgo || formatTimeAgo(raw.created_at),
    author: {
      id: raw.author?.id ?? 1,
      name: raw.author?.name || 'Pengguna',
      email: raw.author?.email || '',
      whatsapp: raw.author?.whatsapp || '',
      avatar: raw.author?.avatar_url || raw.author?.avatar || '',
    },
  }
}
