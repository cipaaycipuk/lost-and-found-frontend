import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/jpg", "image/png"];

function Thumb({ file, onRemove, onClick }) {
  const [url, setUrl] = useState(() => (typeof file === "string" ? file : null));

  useEffect(() => {
    if (typeof file === "string") {
      setUrl(file);
      return undefined;
    }
    const objectUrl = URL.createObjectURL(file);
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  const label = typeof file === "string" ? "Foto laporan" : file.name;

  return (
    <li
      onClick={() => onClick(file)}
      className="group relative aspect-square min-h-0 min-w-0 cursor-zoom-in overflow-hidden rounded-lg border border-gray-200 bg-gray-100 shadow-xs"
    >
      {url && (
        <img
          src={url}
          alt={label}
          className="block h-full w-full object-cover object-center transition duration-300 group-hover:scale-[1.04]"
        />
      )}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        aria-label={`Hapus ${label}`}
        className="absolute right-1.5 top-1.5 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-black/65 text-white transition hover:bg-black/85"
      >
        <X size={14} />
      </button>
    </li>
  );
}

const kunci = (f) =>
  typeof f === "string" ? f : `${f.name}-${f.size}-${f.lastModified}`;

export default function FileUploader({
  value = [],
  onChange,
  maxFiles = 3,
  maxSizeMB = 2,
  accent = "#F05A00",
}) {
  const [dragging, setDragging] = useState(false);
  const [currentFoto, setCurrentFoto] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [error, setError] = useState("");
  const inputRef = useRef(null);
  const dragCounter = useRef(0);

  // Kelola Object URL preview agar tidak bocor memori pada setiap render
  useEffect(() => {
    if (!currentFoto) {
      setPreviewUrl(null);
      return undefined;
    }
    if (typeof currentFoto === "string") {
      setPreviewUrl(currentFoto);
      return undefined;
    }
    const objectUrl = URL.createObjectURL(currentFoto);
    setPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [currentFoto]);

  useEffect(() => {
    if (!currentFoto) return undefined;
    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        e.stopImmediatePropagation();
        setCurrentFoto(null);
      }
    };
    window.addEventListener("keydown", onKeyDown, true);
    return () => window.removeEventListener("keydown", onKeyDown, true);
  }, [currentFoto]);

  const tambahFile = (fileList) => {
    const baru = Array.from(fileList);
    if (baru.length === 0) return;

    const pesan = [];
    const ada = new Set(value.map(kunci));
    const diterima = [];

    for (const f of baru) {
      if (!ALLOWED_MIME_TYPES.includes(f.type)) {
        pesan.push(`${f.name}: hanya format JPG/JPEG/PNG yang diperbolehkan`);
      } else if (f.size > maxSizeMB * 1024 * 1024) {
        pesan.push(`${f.name}: ukuran melebihi ${maxSizeMB}MB`);
      } else if (ada.has(kunci(f))) {
        pesan.push(`${f.name}: sudah ditambahkan`);
      } else {
        ada.add(kunci(f));
        diterima.push(f);
      }
    }

    const sisa = maxFiles - value.length;
    if (diterima.length > sisa) {
      pesan.push(`Maksimal ${maxFiles} foto`);
    }

    setError(pesan.join(". "));
    if (diterima.length > 0) {
      onChange([...value, ...diterima.slice(0, Math.max(sisa, 0))]);
    }
  };

  const hapus = (index) => {
    setError("");
    onChange(value.filter((_, i) => i !== index));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    dragCounter.current = 0;
    setDragging(false);
    tambahFile(e.dataTransfer.files);
  };

  const handleDragOver = (e) => e.preventDefault();

  const handleDragEnter = (e) => {
    e.preventDefault();
    dragCounter.current += 1;
    setDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    dragCounter.current -= 1;
    if (dragCounter.current <= 0) {
      dragCounter.current = 0;
      setDragging(false);
    }
  };

  const handleInput = (e) => {
    tambahFile(e.target.files);
    e.target.value = "";
  };

  const penuh = value.length >= maxFiles;

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png"
        multiple
        onChange={handleInput}
        className="hidden"
      />

      <div
        role="button"
        tabIndex={0}
        aria-disabled={penuh}
        onClick={() => !penuh && inputRef.current?.click()}
        onKeyDown={(e) => {
          if ((e.key === "Enter" || e.key === " ") && !penuh) {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        style={dragging ? { borderColor: accent, color: accent } : undefined}
        className={`flex h-32 w-full select-none flex-col items-center justify-center rounded-lg border-2 border-dashed px-4 text-center text-gray-500 outline-none focus-visible:ring-2 focus-visible:ring-gray-400 ${
          dragging ? "bg-white" : "border-gray-300 bg-[#ebebeb]"
        } ${penuh ? "cursor-not-allowed opacity-60" : "cursor-pointer hover:bg-gray-200"}`}
      >
        <span className="text-4xl font-extralight leading-none">+</span>
        <span className="mt-2 text-xs font-medium">
          {penuh
            ? `Maksimal ${maxFiles} foto tercapai`
            : dragging
              ? "Lepaskan foto di sini"
              : "Unggah foto barang"}
        </span>
        {!penuh && !dragging && (
          <span className="mt-0.5 text-[11px]">
            Seret &amp; lepas, atau klik (JPG/PNG, maks. {maxFiles} foto @ {maxSizeMB}MB)
          </span>
        )}
      </div>

      {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}

      {value.length > 0 && (
        <>
          <p className="mt-2.5 text-xs text-gray-500 tabular-nums">
            {value.length}/{maxFiles} foto terunggah
          </p>
          <ul className="mt-2 grid grid-cols-3 gap-2.5 sm:grid-cols-4">
            {value.map((file, i) => (
              <Thumb
                key={kunci(file)}
                file={file}
                onRemove={() => hapus(i)}
                onClick={setCurrentFoto}
              />
            ))}
          </ul>
        </>
      )}

      {currentFoto &&
        previewUrl &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Pratinjau foto unggahan"
            className="fixed inset-0 z-[100] flex flex-col justify-between bg-black/92 p-3 sm:p-5"
            onClick={() => setCurrentFoto(null)}
          >
            <div className="flex shrink-0 items-center justify-between gap-3">
              <span className="truncate text-xs font-medium text-white/80">
                {typeof currentFoto === "string" ? "Foto laporan" : currentFoto.name}
              </span>
              <button
                type="button"
                aria-label="Tutup pratinjau"
                onClick={() => setCurrentFoto(null)}
                className="rounded-full bg-white/15 p-2 text-white transition hover:bg-white/25"
              >
                <X size={22} />
              </button>
            </div>

            <div className="my-2 flex min-h-0 flex-1 items-center justify-center">
              <img
                src={previewUrl}
                alt={typeof currentFoto === "string" ? "Foto laporan" : currentFoto.name}
                onClick={(e) => e.stopPropagation()}
                className="max-h-full max-w-full rounded-lg object-contain select-none"
              />
            </div>

            <div className="h-2 shrink-0" />
          </div>,
          document.body
        )}
    </div>
  );
}
