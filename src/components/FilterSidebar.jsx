import { useState } from 'react'
import {
  TriangleAlert,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  SlidersHorizontal,
} from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

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
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false)

  const activeFilterCount =
    (activeTab !== 'Semua' ? 1 : 0) +
    (category !== 'Semua kategori' ? 1 : 0) +
    (location !== 'Semua' ? 1 : 0) +
    (sortBy !== 'Terbaru' ? 1 : 0)

  const hasActiveFilters = activeFilterCount > 0

  return (
    <aside className="space-y-4 lg:sticky lg:top-24 lg:col-span-4 lg:space-y-5">
      {/* Toggle Filter Mobile-First */}
      <div className="flex items-center justify-between gap-2 lg:hidden">
        <button
          type="button"
          onClick={() => setIsMobileFilterOpen((prev) => !prev)}
          aria-expanded={isMobileFilterOpen}
          className="inline-flex flex-1 items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3 text-xs font-semibold text-gray-800 shadow-sm transition hover:bg-gray-50"
        >
          <span className="inline-flex items-center gap-2">
            <SlidersHorizontal size={15} />
            Filter &amp; Urutkan
            {activeFilterCount > 0 && (
              <span className="rounded-full bg-[#e0531c] px-2 py-0.5 text-[11px] font-bold text-white tabular-nums">
                {activeFilterCount}
              </span>
            )}
          </span>
          {isMobileFilterOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={onReset}
            className="rounded-xl border border-gray-200 bg-white px-3.5 py-3 text-xs font-semibold text-gray-600 shadow-sm transition hover:text-black"
          >
            Reset
          </button>
        )}
      </div>

      {/* Box Filter */}
      <div
        className={`${
          isMobileFilterOpen ? 'block' : 'hidden'
        } space-y-4 rounded-xl border border-gray-200/80 bg-white p-4 shadow-sm sm:p-5 lg:block`}
      >
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
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger
              id="filter-category"
              className="h-9 w-full rounded-lg border-0 bg-[#EFEFEF] text-xs text-gray-800"
            >
              <SelectValue placeholder="Pilih kategori" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((item) => (
                <SelectItem key={item} value={item} className="text-xs">
                  {item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label
            htmlFor="filter-location"
            className="mb-1.5 block text-xs font-semibold text-gray-600"
          >
            Lokasi
          </label>
          <Select value={location} onValueChange={setLocation}>
            <SelectTrigger
              id="filter-location"
              className="h-9 w-full rounded-lg border-0 bg-[#EFEFEF] text-xs text-gray-800"
            >
              <SelectValue placeholder="Pilih lokasi" />
            </SelectTrigger>
            <SelectContent>
              {LOCATIONS.map((loc) => (
                <SelectItem key={loc} value={loc} className="text-xs">
                  {loc}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label
            htmlFor="filter-sort"
            className="mb-1.5 block text-xs font-semibold text-gray-600"
          >
            Urutkan berdasarkan
          </label>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger
              id="filter-sort"
              className="h-9 w-full rounded-lg border-0 bg-[#EFEFEF] text-xs text-gray-800"
            >
              <SelectValue placeholder="Urutkan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Terbaru" className="text-xs">
                Terbaru
              </SelectItem>
              <SelectItem value="Terlama" className="text-xs">
                Terlama
              </SelectItem>
            </SelectContent>
          </Select>
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

      {/* Panduan Keamanan (sembunyikan di mobile kecuali filter dibuka agar feed langsung terlihat) */}
      <div
        className={`${
          isMobileFilterOpen ? 'block' : 'hidden'
        } space-y-3 rounded-xl border border-gray-200/80 bg-white p-4 shadow-sm sm:p-5 lg:block`}
      >
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
