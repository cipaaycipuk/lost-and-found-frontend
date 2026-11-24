import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'

export default function PostImageGrid({ images = [], fallbackImage = null, title = '' }) {
  const list =
    Array.isArray(images) && images.length > 0
      ? images.filter(Boolean)
      : fallbackImage
        ? [fallbackImage]
        : []

  const [activeIndex, setActiveIndex] = useState(null)
  const isOpen = activeIndex !== null && Boolean(list[activeIndex])

  useEffect(() => {
    if (!isOpen) return undefined

    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        e.stopImmediatePropagation()
        setActiveIndex(null)
      } else if (e.key === 'ArrowRight' && list.length > 1) {
        setActiveIndex((prev) => (prev + 1) % list.length)
      } else if (e.key === 'ArrowLeft' && list.length > 1) {
        setActiveIndex((prev) => (prev - 1 + list.length) % list.length)
      }
    }

    window.addEventListener('keydown', onKeyDown, true)
    return () => window.removeEventListener('keydown', onKeyDown, true)
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
      className={`group/img relative min-h-0 min-w-0 cursor-zoom-in overflow-hidden bg-gray-100 ${className}`}
    >
      <img
        src={src}
        alt={`${title || ' Barang'} - foto ${idx + 1}`}
        loading="lazy"
        className="block h-full w-full object-cover object-center transition duration-300 group-hover/img:scale-[1.03]"
      />
      {extraOverlay}
    </div>
  )

  return (
    <>
      {list.length === 1 && (
        <div className="aspect-[4/3] w-full overflow-hidden rounded-xl sm:aspect-[16/10]">
          {renderTile(list[0], 0, 'h-full w-full')}
        </div>
      )}

      {list.length === 2 && (
        <div className="grid aspect-[4/3] w-full grid-cols-12 grid-rows-[minmax(0,1fr)] gap-1.5 overflow-hidden rounded-xl sm:aspect-[16/10]">
          {renderTile(list[0], 0, 'col-span-7 h-full')}
          {renderTile(list[1], 1, 'col-span-5 h-full')}
        </div>
      )}

      {list.length === 3 && (
        <div className="grid aspect-[4/3] w-full grid-cols-12 grid-rows-[repeat(2,minmax(0,1fr))] gap-1.5 overflow-hidden rounded-xl sm:aspect-[16/10]">
          {renderTile(list[0], 0, 'col-span-7 row-span-2 h-full')}
          {renderTile(list[1], 1, 'col-span-5 row-span-1 h-full')}
          {renderTile(list[2], 2, 'col-span-5 row-span-1 h-full')}
        </div>
      )}

      {list.length === 4 && (
        <div className="grid aspect-[4/3] w-full grid-cols-12 grid-rows-[repeat(2,minmax(0,1fr))] gap-1.5 overflow-hidden rounded-xl sm:aspect-[16/11]">
          {renderTile(list[0], 0, 'col-span-7 row-span-1 h-full')}
          {renderTile(list[1], 1, 'col-span-5 row-span-1 h-full')}
          {renderTile(list[2], 2, 'col-span-5 row-span-1 h-full')}
          {renderTile(list[3], 3, 'col-span-7 row-span-1 h-full')}
        </div>
      )}

      {list.length >= 5 && (
        <div className="grid aspect-[4/3] w-full grid-cols-12 grid-rows-[repeat(2,minmax(0,1fr))] gap-1.5 overflow-hidden rounded-xl sm:aspect-[16/11]">
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

      {isOpen &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Pratinjau foto barang"
            className="fixed inset-0 z-[100] flex flex-col justify-between bg-black/92 p-3 sm:p-5"
            onClick={(e) => {
              e.stopPropagation()
              setActiveIndex(null)
            }}
          >
            {/* Header Bar: tidak akan pernah bertumpuk dengan gambar utama */}
            <div
              onClick={(e) => e.stopPropagation()}
              className="flex shrink-0 items-center justify-between gap-3"
            >
              <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white tabular-nums">
                {activeIndex + 1} / {list.length}
              </span>

              <button
                type="button"
                aria-label="Tutup pratinjau gambar"
                onClick={() => setActiveIndex(null)}
                className="rounded-full bg-white/15 p-2 text-white transition hover:bg-white/25"
              >
                <X size={22} />
              </button>
            </div>

            {/* Area Gambar Utama: fleksibel mengikuti tinggi sisa layar */}
            <div className="relative my-2 flex min-h-0 flex-1 items-center justify-center">
              {list.length > 1 && (
                <button
                  type="button"
                  aria-label="Foto sebelumnya"
                  onClick={(e) => {
                    e.stopPropagation()
                    setActiveIndex((prev) => (prev - 1 + list.length) % list.length)
                  }}
                  className="absolute left-1 z-10 rounded-full bg-black/55 p-2 text-white ring-1 ring-white/20 transition hover:bg-black/80 sm:left-3 sm:p-2.5"
                >
                  <ChevronLeft size={22} />
                </button>
              )}

              <img
                src={list[activeIndex]}
                alt={`${title || 'Barang'} - foto ${activeIndex + 1}`}
                onClick={(e) => e.stopPropagation()}
                className="max-h-full max-w-full rounded-lg object-contain select-none"
              />

              {list.length > 1 && (
                <button
                  type="button"
                  aria-label="Foto berikutnya"
                  onClick={(e) => {
                    e.stopPropagation()
                    setActiveIndex((prev) => (prev + 1) % list.length)
                  }}
                  className="absolute right-1 z-10 rounded-full bg-black/55 p-2 text-white ring-1 ring-white/20 transition hover:bg-black/80 sm:right-3 sm:p-2.5"
                >
                  <ChevronRight size={22} />
                </button>
              )}
            </div>

            {/* Strip Thumbnail Bawah */}
            {list.length > 1 ? (
              <div
                onClick={(e) => e.stopPropagation()}
                className="mx-auto flex max-w-full shrink-0 gap-2 overflow-x-auto px-2 py-1"
              >
                {list.map((thumb, idx) => (
                  <button
                    key={`${thumb}-${idx}`}
                    type="button"
                    onClick={() => setActiveIndex(idx)}
                    className={`h-12 w-12 shrink-0 overflow-hidden rounded-md border-2 transition ${
                      idx === activeIndex
                        ? 'border-[#e0531c] opacity-100'
                        : 'border-transparent opacity-50 hover:opacity-85'
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
            ) : (
              <div className="h-2 shrink-0" />
            )}
          </div>,
          document.body
        )}
    </>
  )
}
