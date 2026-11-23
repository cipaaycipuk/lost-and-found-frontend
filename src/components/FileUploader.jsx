import { X } from "lucide-react";
import { useState, useRef, useEffect } from "react";

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/jpg", "image/png"];

// Satu thumbnail. Mendukung objek File baru maupun string URL gambar lama (saat Edit Laporan).
function Thumb({ file, onRemove, onClick }) {
  const [url, setUrl] = useState(() => (typeof file === "string" ? file : null));

  useEffect(() => {
    if (typeof file === "string") {
      setUrl(file);
      return undefined;
    }
    const u = URL.createObjectURL(file);
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [file]);

  const label = typeof file === "string" ? "Foto laporan" : file.name;

  return (
    <li
      className="group relative aspect-square cursor-pointer overflow-hidden rounded-md bg-gray-200 shadow-sm transition-all duration-300 hover:scale-105"
      onClick={() => onClick(file)}
    >
      {url && (
        <img src={url} alt={label} className="h-full w-full object-cover" />
      )}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        aria-label={`Hapus ${label}`}
        className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-sm leading-none text-white hover:bg-black/80"
      >
        X
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
  const [error, setError] = useState("");
  const inputRef = useRef(null);
  const dragCounter = useRef(0);

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

  const handleClick = (foto) => {
    setCurrentFoto(foto);
  };

  const handleCloseModal = () => {
    setCurrentFoto(null);
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

      {/* Area drop */}
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
        className={`flex h-32 w-full select-none flex-col items-center justify-center rounded-md border-2 border-dashed text-gray-500 outline-none focus-visible:ring-2 focus-visible:ring-gray-400 ${
          dragging ? "bg-white" : "border-gray-300 bg-[#ebebeb]"
        } ${penuh ? "cursor-not-allowed opacity-60" : "cursor-pointer hover:bg-gray-200"}`}
      >
        <span className="text-4xl font-extralight leading-none">+</span>
        <span className="mt-2 text-xs">
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
          <p className="mt-2 text-xs text-gray-500">
            {value.length}/{maxFiles} foto
          </p>
          <ul className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-4">
            {value.map((file, i) => (
              <Thumb key={kunci(file)} file={file} onRemove={() => hapus(i)} onClick={handleClick} />
            ))}
          </ul>
        </>
      )}

      {currentFoto && (
        <div
          className="fixed inset-0 z-100 flex items-center justify-center bg-black/90 p-4"
          onClick={handleCloseModal}
        >
          <button
            type="button"
            onClick={handleCloseModal}
            className="absolute right-5 top-5 rounded-full bg-white/10 p-2 text-white transition hover:bg-white/20 cursor-pointer"
          >
            <X size={28} />
          </button>

          <img
            src={
              typeof currentFoto === "string"
                ? currentFoto
                : URL.createObjectURL(currentFoto)
            }
            alt={typeof currentFoto === "string" ? "Foto laporan" : currentFoto.name}
            className="max-h-[90vh] max-w-[95vw] rounded-md object-contain"
          />
        </div>
      )}
    </div>
  );
}
