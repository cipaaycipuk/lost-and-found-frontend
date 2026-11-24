
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { TriangleAlert, ArrowRight, ChevronDown, Filter } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const CATEGORIES = [
  "Semua kategori",
  "Elektronik",
  "Dompet & Tas",
  "Kunci",
  "Dokumen & Kartu",
  "Pakaian & Aksesoris",
  "Buku & Alat Tulis",
  "Lainnya",
];

const LOCATIONS = [
  "Semua",
  "Foodcourt / Kantin",
  "Gedung A",
  "Gedung B",
  "Perpustakaan",
  "Area Parkir",
];

function FilterSelectFields({
  idPrefix,
  category,
  setCategory,
  location,
  setLocation,
  sortBy,
  setSortBy,
  sortLabel = "Urutkan",
  labelClassName = "mb-1.5 block text-xs font-medium text-gray-600",
  triggerClassName = "h-10 w-full rounded-lg border border-gray-200/80 bg-white text-xs font-medium text-gray-900 shadow-xs hover:bg-gray-50",
}) {
  return (
    <>
      <div>
        <label htmlFor={`${idPrefix}-category`} className={labelClassName}>
          Kategori
        </label>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger id={`${idPrefix}-category`} className={triggerClassName}>
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
        <label htmlFor={`${idPrefix}-location`} className={labelClassName}>
          Lokasi
        </label>
        <Select value={location} onValueChange={setLocation}>
          <SelectTrigger id={`${idPrefix}-location`} className={triggerClassName}>
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
        <label htmlFor={`${idPrefix}-sort`} className={labelClassName}>
          {sortLabel}
        </label>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger id={`${idPrefix}-sort`} className={triggerClassName}>
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
    </>
  );
}

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
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const navigate = useNavigate();

  const activeFilterCount =
    (category !== "Semua kategori" ? 1 : 0) +
    (location !== "Semua" ? 1 : 0) +
    (sortBy !== "Terbaru" ? 1 : 0);

  return (
    <aside className="space-y-3 lg:sticky lg:top-24 lg:col-span-4 lg:space-y-5">
      {/* === MOBILE (< lg) === */}
      <div className="space-y-3 lg:hidden">
        {/* 1. Panduan Singkat Keamanan */}
        <div className="rounded-xl border border-gray-200/80 bg-white shadow-xs">
          <button
            type="button"
            onClick={() => navigate("/panduan")}
            className="flex w-full items-center justify-between px-4 py-3 text-left"
          >
            <span className="flex items-center gap-2 text-xs font-semibold text-gray-900">
              <TriangleAlert size={16} className="shrink-0 text-[#F05A00]" />
              Panduan Singkat Keamanan
            </span>
            <ArrowRight size={15} className="text-gray-500" />
          </button>
        </div>

        {/* 2. Tabs Horizontal Underline: Semua | Kehilangan | Ditemukan */}
        <div className="grid grid-cols-3 border-b border-gray-200">
          {["Semua", "Kehilangan", "Ditemukan"].map((tab) => {
            const isActive = activeTab === tab;

            return (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`-mb-px border-b-2 pb-2.5 text-center text-xs font-semibold transition ${
                  isActive
                    ? "border-black text-black"
                    : "border-transparent text-gray-400 hover:text-gray-700"
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {/* 3. Bar Filter & Sort Mobile */}
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => setIsMobileFilterOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-800 shadow-xs transition hover:bg-gray-50"
          >
            <Filter size={13} />
            <span>Filter</span>

            {activeFilterCount > 0 && (
              <span className="rounded-full bg-[#e0531c] px-1.5 py-0.5 text-[10px] font-bold text-white tabular-nums">
                {activeFilterCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() =>
              setSortBy((prev) =>
                prev === "Terbaru" ? "Terlama" : "Terbaru"
              )
            }
            className="inline-flex items-center gap-1 text-xs font-medium text-gray-700"
          >
            <span>{sortBy}</span>
            <ChevronDown size={13} />
          </button>
        </div>
      </div>

      {/* === MOBILE FILTER MODAL / SHEET === */}
      {isMobileFilterOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Filter laporan"
          className="fixed inset-0 z-[60] flex items-end justify-center bg-black/55 p-0 backdrop-blur-[2px] sm:items-center sm:p-4 lg:hidden"
          onClick={() => setIsMobileFilterOpen(false)}
        >
          <div
            className="w-full max-w-md space-y-4 rounded-t-2xl bg-white p-5 shadow-2xl sm:rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-gray-900">Filter</h3>

              <button
                type="button"
                onClick={onReset}
                className="text-xs font-medium text-gray-500 underline underline-offset-4 hover:text-black"
              >
                Reset
              </button>
            </div>

            <div className="space-y-3">
              <FilterSelectFields
                idPrefix="mobile-filter"
                category={category}
                setCategory={setCategory}
                location={location}
                setLocation={setLocation}
                sortBy={sortBy}
                setSortBy={setSortBy}
              />
            </div>

            <button
              type="button"
              onClick={() => setIsMobileFilterOpen(false)}
              className="mt-2 w-full rounded-lg bg-[#1C1C1C] py-2.5 text-xs font-semibold text-white transition hover:bg-neutral-800"
            >
              Tampilkan hasil
            </button>
          </div>
        </div>
      )}

      {/* === DESKTOP (lg+) === */}
      <div className="hidden space-y-4 rounded-xl border border-gray-200/80 bg-white p-5 shadow-sm lg:block">
        <div>
          <label className="mb-2 block text-xs font-medium text-gray-500">
            Jenis Laporan
          </label>

          <div className="flex gap-1 rounded-xl border border-gray-200/80 bg-gray-100/70 p-1">
            {["Semua", "Kehilangan", "Ditemukan"].map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition ${
                  activeTab === tab
                    ? "bg-[#1C1C1C] text-white shadow-xs"
                    : "text-gray-700 hover:text-black"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <FilterSelectFields
          idPrefix="filter"
          category={category}
          setCategory={setCategory}
          location={location}
          setLocation={setLocation}
          sortBy={sortBy}
          setSortBy={setSortBy}
          sortLabel="Urutkan berdasarkan"
          labelClassName="mb-1.5 block text-xs font-medium text-gray-500"
        />

        <button
          type="button"
          onClick={onReset}
          className="inline-block pt-1 text-xs font-medium text-gray-700 underline underline-offset-4 transition hover:text-black"
        >
          Reset filter
        </button>
      </div>

      {/* Panduan Keamanan Desktop */}
      <div className="hidden space-y-3 rounded-xl border border-gray-200/80 bg-white p-5 shadow-sm lg:block">
        <div className="flex items-center gap-2 text-sm font-bold leading-tight text-gray-900">
          <TriangleAlert size={17} className="shrink-0 text-[#F05A00]" />
          <span>Panduan Singkat Keamanan</span>
        </div>

        <ul className="list-disc space-y-1.5 pl-4 text-xs leading-relaxed text-gray-700">
          <li>Jangan tulis info pribadi (PIN, nomor KTM) di deskripsi.</li>
          <li>Minta pemilik menyebut ciri barang sebelum menyerahkan.</li>
          <li>Bertemu di tempat ramai di area kampus.</li>
        </ul>

        <button
          type="button"
          onClick={() => navigate("/panduan")}
          className="inline-flex items-center gap-1 pt-1 text-xs font-semibold text-[#0026FF] hover:underline"
        >
          <span>Selengkapnya →</span>
        </button>
      </div>
    </aside>
  );
}
