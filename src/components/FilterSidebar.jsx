import { useState } from 'react'
import { TriangleAlert, ChevronDown, ChevronUp, RotateCcw } from 'lucide-react'

const CATEGORIES = [
  'Semua kategori',
  'Elektronik',
  'Dompet & Tas',
  'Kunci',
  'Dokumen & Kartu',
  'Pakaian & Aksesoris',
  'Buku & Alat Tulis',
  'Lainnya',
]

const LOCATIONS = [
  'Semua',
  'Foodcourt / Kantin',
  'Gedung A',
  'Gedung B',
  'Perpustakaan',
  'Area Parkir',
]

export default function FilterSidebar({
  activeTab,
  setActiveTab,
  category,
  setCategory,
  location,
  setLocation,
  sortBy,
  setSortBy,
  onReset,
}) {
  const [showMoreGuide, setShowMoreGuide] = useState(false)

  const hasActiveFilters =
    activeTab !== 'Semua' ||
    category !== 'Semua kategori' ||
    location !== 'Semua' ||
    sortBy !== 'Terbaru'

  return (
    <aside className="space-y-5 lg:sticky lg:top-24 lg:col-span-4">
      {/* Box Filter */}
      <div className="space-y-4 rounded-xl border border-gray-200/80 bg-white p-5 shadow-sm">
        <div>
          <label className="mb-2 block text-xs font-semibold text-gray-600">
            Jenis Laporan
          </label>

          <div className="flex gap-1 rounded-lg bg-gray-100 p-1">
            {['Semua', 'Kehilangan', 'Ditemukan'].map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`flex-1 rounded-md py-1.5 text-xs font-medium transition ${
                  activeTab === tab
                    ? 'bg-black text-white shadow-sm'
                    : 'text-gray-600 hover:text-black'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label
            htmlFor="filter-category"
            className="mb-1.5 block text-xs font-semibold text-gray-600"
          >
            Kategori
          </label>
          <select
            id="filter-category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-gray-50/50 px-3 py-2 text-xs text-gray-800 outline-none transition focus:border-black focus:bg-white"
          >
            {CATEGORIES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="filter-location"
            className="mb-1.5 block text-xs font-semibold text-gray-600"
          >
            Lokasi
          </label>
          <select
            id="filter-location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-gray-50/50 px-3 py-2 text-xs text-gray-800 outline-none transition focus:border-black focus:bg-white"
          >
            {LOCATIONS.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="filter-sort"
            className="mb-1.5 block text-xs font-semibold text-gray-600"
          >
            Urutkan berdasarkan
          </label>
          <select
            id="filter-sort"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-gray-50/50 px-3 py-2 text-xs text-gray-800 outline-none transition focus:border-black focus:bg-white"
          >
            <option value="Terbaru">Terbaru</option>
            <option value="Terlama">Terlama</option>
          </select>
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1.5 pt-1 text-xs font-medium text-gray-600 underline underline-offset-4 transition hover:text-black"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset filter
          </button>
        )}
      </div>

      {/* Panduan Keamanan */}
      <div className="space-y-3 rounded-xl border border-gray-200/80 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2 text-sm font-semibold leading-tight text-black">
          <TriangleAlert size={18} className="shrink-0 text-amber-600" />
          <span>Panduan Singkat Keamanan</span>
        </div>

        <ul className="list-disc space-y-1.5 pl-4 text-xs leading-relaxed text-gray-700">
          <li>Jangan tulis info pribadi (PIN, nomor KTM) di deskripsi.</li>
          <li>Minta pemilik menyebut ciri barang sebelum menyerahkan.</li>
          <li>Bertemu di tempat ramai di area kampus.</li>
          {showMoreGuide && (
            <>
              <li>
                Untuk barang berharga, titipkan di pos satpam atau bagian
                kemahasiswaan terdekat.
              </li>
              <li>
                Tandai laporan sebagai <strong>Selesai</strong> setelah barang
                berhasil dikembalikan.
              </li>
            </>
          )}
        </ul>

        <button
          type="button"
          onClick={() => setShowMoreGuide((prev) => !prev)}
          className="inline-flex items-center gap-1 pt-1 text-xs font-semibold text-[#001994] hover:underline"
        >
          <span>{showMoreGuide ? 'Tutup panduan' : 'Selengkapnya'}</span>
          {showMoreGuide ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        </button>
      </div>
    </aside>
  )
}
