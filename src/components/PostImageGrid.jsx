import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'

export default function PostImageGrid({ images = [], fallbackImage = null, title = '' }) {
  const list =
    Array.isArray(images) && images.length > 0
      ? images.filter(Boolean)
      : fallbackImage
        ? [fallbackImage]
        : []

  const [activeIndex, setActiveIndex] = useState(null)
  const isOpen = activeIndex !== null && list[activeIndex]

  useEffect(() => {
    if (!isOpen) return
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setActiveIndex(null)
      if (e.key === 'ArrowRight') {
        setActiveIndex((prev) => (prev + 1) % list.length)
      }
      if (e.key === 'ArrowLeft') {
        setActiveIndex((prev) => (prev - 1 + list.length) % list.length)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isOpen, list.length])

  if (list.length === 0) return null

  const openAt = (e, idx) => {
    e.stopPropagation()
    setActiveIndex(idx)
  }

  const renderTile = (src, idx, className = '', extraOverlay = null) => (
    <div
      key={`${src}-${idx}`}
      onClick={(e) => openAt(e, idx)}
      className={`group/img relative cursor-zoom-in overflow-hidden bg-gray-100 ${className}`}
    >
      <img
        src={src}
        alt={`${title} - foto ${idx + 1}`}
        loading="lazy"
        className="h-full w-full object-cover object-center transition duration-300 group-hover/img:scale-[1.03]"
      />
      {extraOverlay}
    </div>
  )

  return (
    <>
      {/* 1 Foto */}
      {list.length === 1 && (
        <div className="aspect-[16/10] w-full overflow-hidden rounded-xl">
          {renderTile(list[0], 0, 'h-full w-full')}
        </div>
      )}

      {/* 2 Foto: Split asimetris */}
      {list.length === 2 && (
        <div className="grid aspect-[16/10] w-full grid-cols-12 gap-1.5 overflow-hidden rounded-xl">
          {renderTile(list[0], 0, 'col-span-7 h-full')}
          {renderTile(list[1], 1, 'col-span-5 h-full')}
        </div>
      )}

      {/* 3 Foto: 1 besar kiri + 2 tumpuk kanan */}
      {list.length === 3 && (
        <div className="grid aspect-[16/10] w-full grid-cols-12 grid-rows-2 gap-1.5 overflow-hidden rounded-xl">
          {renderTile(list[0], 0, 'col-span-7 row-span-2 h-full')}
          {renderTile(list[1], 1, 'col-span-5 row-span-1 h-full')}
          {renderTile(list[2], 2, 'col-span-5 row-span-1 h-full')}
        </div>
      )}

      {/* 4 Foto: Bento mozaik asimetris (7-5 atas, 5-7 bawah) */}
      {list.length === 4 && (
        <div className="grid aspect-[16/11] w-full grid-cols-12 grid-rows-2 gap-1.5 overflow-hidden rounded-xl">
          {renderTile(list[0], 0, 'col-span-7 row-span-1 h-full')}
          {renderTile(list[1], 1, 'col-span-5 row-span-1 h-full')}
          {renderTile(list[2], 2, 'col-span-5 row-span-1 h-full')}
          {renderTile(list[3], 3, 'col-span-7 row-span-1 h-full')}
        </div>
      )}

      {/* 5+ Foto: Bento collage (2 atas asimetris + 3 bawah) */}
      {list.length >= 5 && (
        <div className="grid aspect-[16/11] w-full grid-cols-12 grid-rows-2 gap-1.5 overflow-hidden rounded-xl">
          {renderTile(list[0], 0, 'col-span-7 row-span-1 h-full')}
          {renderTile(list[1], 1, 'col-span-5 row-span-1 h-full')}
          {renderTile(list[2], 2, 'col-span-4 row-span-1 h-full')}
          {renderTile(list[3], 3, 'col-span-4 row-span-1 h-full')}
          {renderTile(
            list[4],
            4,
            'col-span-4 row-span-1 h-full',
            list.length > 5 ? (
              <div className="absolute inset-0 flex items-center justify-center bg-black/55 text-lg font-bold text-white backdrop-blur-[1px]">
                +{list.length - 5}
              </div>
            ) : null
          )}
        </div>
      )}

      {/* Lightbox Carousel Fullscreen */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[999] flex flex-col items-center justify-center bg-black/92 p-4"
          onClick={(e) => {
            e.stopPropagation()
            setActiveIndex(null)
          }}
        >
          <div className="absolute left-5 top-5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white tabular-nums">
            {activeIndex + 1} / {list.length}
          </div>

          <button
            type="button"
            aria-label="Tutup pratinjau gambar"
            onClick={(e) => {
              e.stopPropagation()
              setActiveIndex(null)
            }}
            className="absolute right-5 top-5 rounded-full bg-white/10 p-2 text-white transition hover:bg-white/20"
          >
            <X size={24} />
          </button>

          {list.length > 1 && (
            <>
              <button
                type="button"
                aria-label="Foto sebelumnya"
                onClick={(e) => {
                  e.stopPropagation()
                  setActiveIndex((prev) => (prev - 1 + list.length) % list.length)
                }}
                className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/15 p-2.5 text-white transition hover:bg-white/25 sm:left-6"
              >
                <ChevronLeft size={24} />
              </button>

              <button
                type="button"
                aria-label="Foto berikutnya"
                onClick={(e) => {
                  e.stopPropagation()
                  setActiveIndex((prev) => (prev + 1) % list.length)
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/15 p-2.5 text-white transition hover:bg-white/25 sm:right-6"
              >
                <ChevronRight size={24} />
              </button>
            </>
          )}

          <img
            src={list[activeIndex]}
            alt={`${title} - foto ${activeIndex + 1}`}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[82vh] max-w-[92vw] rounded-lg object-contain"
          />

          {list.length > 1 && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="mt-4 flex max-w-full gap-2 overflow-x-auto px-2 py-1"
            >
              {list.map((thumb, idx) => (
                <button
                  key={`${thumb}-${idx}`}
                  type="button"
                  onClick={() => setActiveIndex(idx)}
                  className={`h-12 w-12 shrink-0 overflow-hidden rounded-md border-2 transition ${
                    idx === activeIndex
                      ? 'border-[#e0531c] opacity-100'
                      : 'border-transparent opacity-50 hover:opacity-80'
                  }`}
                >
                  <img
                    src={thumb}
                    alt={`Thumbnail ${idx + 1}`}
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  )
}
