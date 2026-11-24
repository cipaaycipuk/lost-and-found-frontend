import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { CalendarDays, Check, ChevronDown } from "lucide-react";
import FileUploader from "../components/FileUploader";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { formatDateId } from "../lib/formatters";
import {
  useCreatePostMutation,
  usePostDetailQuery,
  useUpdatePostMutation,
} from "../hooks/usePosts";

const KATEGORI = [
  "Dompet & Tas",
  "Elektronik",
  "Kunci",
  "Dokumen & Kartu",
  "Pakaian & Aksesoris",
  "Buku & Alat Tulis",
  "Lainnya",
];

const LOKASI = [
  "Foodcourt / Kantin",
  "Gedung A",
  "Gedung B",
  "Perpustakaan",
  "Area Parkir",
  "Lainnya",
];

const TIPE = {
  kehilangan: {
    label: "Kehilangan",
    labelLokasi: "Lokasi terakhir terlihat",
    labelTanggal: "Kapan hilang?",
    placeholderDeskripsi:
      "Ciri-ciri barang dan detail tempat hilang.\nContoh: tertinggal di meja dekat jendela gedung b lantai 2",
    warna: "#F05A00",
    indikator: "bg-[#F05A00]",
    tombol: "bg-[#F05A00] hover:bg-[#d95200]",
    ring: "focus:ring-[#F05A00]/40 focus:border-[#F05A00]",
  },
  ditemukan: {
    label: "Ditemukan",
    labelLokasi: "Lokasi ditemukan",
    labelTanggal: "Kapan ditemukan?",
    placeholderDeskripsi:
      "Ciri-ciri barang dan detail tempat ditemukan.\nContoh: ditemukan di meja dekat jendela gedung b lantai 2",
    warna: "#001C99",
    indikator: "bg-[#001C99]",
    tombol: "bg-[#001C99] hover:bg-[#001680]",
    ring: "focus:ring-[#001C99]/40 focus:border-[#001C99]",
  },
};

const formAwal = {
  namaBarang: "",
  kategori: "",
  lokasi: "",
  tanggal: "",
  deskripsi: "",
};

function ComboField({
  id,
  value,
  onChange,
  options,
  placeholder,
  className,
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onPointerDown = (e) => {
      if (!containerRef.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  const q = value.trim().toLowerCase();
  const isExactPreset = options.some((opt) => opt.toLowerCase() === q);
  const filtered =
    !q || isExactPreset
      ? options
      : options.filter((opt) => opt.toLowerCase().includes(q));

  return (
    <div ref={containerRef} className="relative">
      <Input
        id={id}
        type="text"
        role="combobox"
        aria-expanded={open}
        aria-autocomplete="list"
        autoComplete="off"
        value={value}
        placeholder={placeholder}
        onFocus={() => setOpen(true)}
        onChange={(e) => {
          onChange(e.target.value);
          if (!open) setOpen(true);
        }}
        onKeyDown={(e) => {
          if (e.key === "Escape") setOpen(false);
        }}
        className={`h-11 pr-9 ${className}`}
      />
      <button
        type="button"
        tabIndex={-1}
        aria-label={`Tampilkan pilihan ${placeholder}`}
        onClick={() => setOpen((prev) => !prev)}
        className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1 text-gray-500 transition hover:text-gray-900"
      >
        <ChevronDown
          size={16}
          className={`transition-transform duration-150 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <ul
          role="listbox"
          className="no-scrollbar absolute left-0 right-0 top-full z-30 mt-1.5 max-h-64 overflow-y-auto rounded-xl border border-gray-200/90 bg-white p-1.5 shadow-xl ring-1 ring-black/5"
        >
          {filtered.length > 0 ? (
            filtered.map((opt) => {
              const selected = opt === value;
              return (
                <li key={opt}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={selected}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      onChange(opt);
                      setOpen(false);
                    }}
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                      selected
                        ? "bg-gray-100 font-semibold text-gray-950"
                        : "text-gray-800 hover:bg-gray-100"
                    }`}
                  >
                    <span>{opt}</span>
                    {selected && <Check size={14} className="text-gray-700" />}
                  </button>
                </li>
              );
            })
          ) : (
            <li className="px-3 py-2 text-xs text-gray-500">
              Menggunakan input kustom:{" "}
              <strong className="font-semibold text-gray-900">&ldquo;{value.trim()}&rdquo;</strong>
            </li>
          )}
        </ul>
      )}
    </div>
  );
}

export default function FormLaporan() {
  const { postId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const createPost = useCreatePostMutation();
  const updatePost = useUpdatePostMutation();

  const isEditMode = Boolean(postId);
  const { data: fetchedPost } = usePostDetailQuery(postId);
  const editPost = location.state?.editPost || fetchedPost || null;

  const [tipe, setTipe] = useState(editPost?.type || "kehilangan");
  const [form, setForm] = useState({
    namaBarang: editPost?.title || "",
    kategori: editPost?.category || "",
    lokasi: editPost?.location || "",
    tanggal: editPost?.rawDate ? String(editPost.rawDate).slice(0, 10) : "",
    deskripsi: editPost?.description || "",
  });
  const [fotos, setFotos] = useState(() => {
    if (Array.isArray(editPost?.images) && editPost.images.length > 0) {
      return editPost.images;
    }
    return editPost?.image ? [editPost.image] : [];
  });
  const [errors, setErrors] = useState({});
  const [isDateOpen, setIsDateOpen] = useState(false);

  useEffect(() => {
    if (!editPost) return;
    setTipe(editPost.type || "kehilangan");
    setForm({
      namaBarang: editPost.title || "",
      kategori: editPost.category || "",
      lokasi: editPost.location || "",
      tanggal: editPost.rawDate ? String(editPost.rawDate).slice(0, 10) : "",
      deskripsi: editPost.description || "",
    });
    const existingImgs =
      Array.isArray(editPost.images) && editPost.images.length > 0
        ? editPost.images
        : editPost.image
          ? [editPost.image]
          : [];
    setFotos(existingImgs);
  }, [editPost]);

  const tema = TIPE[tipe];
  const loading = createPost.isPending || updatePost.isPending;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const validate = () => {
    const err = {};
    if (!form.namaBarang.trim()) err.namaBarang = "Nama barang wajib diisi";
    if (!form.kategori.trim()) err.kategori = "Kategori wajib diisi";
    if (!form.lokasi.trim()) err.lokasi = "Lokasi wajib diisi";
    if (!form.tanggal) err.tanggal = "Pilih tanggal";
    if (!form.deskripsi.trim()) err.deskripsi = "Deskripsi wajib diisi";
    return err;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    setErrors(err);
    if (Object.keys(err).length > 0) return;

    const data = new FormData();
    data.append("type", tipe);
    data.append("title", form.namaBarang.trim());
    data.append("category", form.kategori.trim());
    data.append("location", form.lokasi.trim());
    data.append("incident_date", form.tanggal);
    data.append("description", form.deskripsi.trim());
    fotos.forEach((f) => {
      if (f instanceof File) {
        data.append("images[]", f);
      } else if (typeof f === "string") {
        data.append("existing_images[]", f);
      }
    });

    if (isEditMode) {
      data.append("sync_images", "1");
      updatePost.mutate(
        { id: postId, payload: data },
        {
          onSuccess: () => {
            navigate(`/posts/${postId}`, { replace: true });
          },
        }
      );
      return;
    }

    createPost.mutate(data, {
      onSuccess: () => {
        setForm(formAwal);
        setFotos([]);
        navigate("/");
      },
    });
  };

  const fieldClass = (hasError) =>
    `rounded-lg border px-3.5 text-sm text-gray-900 shadow-none transition-colors outline-none placeholder:text-gray-500 ${
      hasError
        ? "border-red-400 bg-red-50/40 focus:border-red-500 focus:bg-white"
        : "border-gray-200/80 bg-gray-100/90 hover:bg-gray-100 focus:border-gray-900 focus:bg-white focus-visible:border-gray-900 focus-visible:bg-white focus-visible:ring-0"
    }`;

  const errorText = (name) =>
    errors[name] ? (
      <p className="mt-1.5 text-xs font-medium text-red-600">{errors[name]}</p>
    ) : null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:py-8">
      <form
        onSubmit={handleSubmit}
        noValidate
        className="w-full rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm sm:p-7"
      >
        <div className="mb-5">
          <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">
            {isEditMode ? "Edit Laporan" : "Buat Laporan"}
          </h1>
          <p className="mt-1 text-xs text-gray-500 sm:text-sm">
            Lengkapi detail barang agar lebih mudah dikenali dan diverifikasi.
          </p>
        </div>

        <div
          role="tablist"
          className="relative mb-5 grid grid-cols-2 rounded-xl bg-gray-100 p-1.5"
        >
          <span
            aria-hidden="true"
            className={`absolute inset-y-1.5 left-1.5 w-[calc(50%-6px)] rounded-lg shadow-xs transition-all duration-300 ease-out ${
              tipe === "ditemukan" ? "translate-x-full" : "translate-x-0"
            } ${tema.indikator}`}
          />
          {Object.entries(TIPE).map(([key, t]) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={tipe === key}
              onClick={() => setTipe(key)}
              className={`relative z-10 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors duration-300 ${
                tipe === key ? "text-white" : "text-gray-800"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Nama barang */}
        <div className="mb-4">
          <label
            htmlFor="namaBarang"
            className="mb-1.5 block text-xs font-semibold text-gray-800 sm:text-sm"
          >
            Nama Barang
          </label>
          <Input
            id="namaBarang"
            name="namaBarang"
            type="text"
            value={form.namaBarang}
            onChange={handleChange}
            placeholder="Contoh: Dompet hitam"
            className={`h-11 ${fieldClass(errors.namaBarang)}`}
          />
          {errorText("namaBarang")}
        </div>

        {/* Kategori & Lokasi (Combobox: pilih preset atau ketik langsung) */}
        <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="kategori"
              className="mb-1.5 block text-xs font-semibold text-gray-800 sm:text-sm"
            >
              Kategori
            </label>
            <ComboField
              id="kategori"
              value={form.kategori}
              options={KATEGORI.filter((k) => k !== "Lainnya")}
              placeholder="Pilih atau ketik kategori..."
              className={fieldClass(errors.kategori)}
              onChange={(val) => {
                setForm((prev) => ({ ...prev, kategori: val }));
                if (errors.kategori)
                  setErrors((prev) => ({ ...prev, kategori: undefined }));
              }}
            />
            {errorText("kategori")}
          </div>

          <div>
            <label
              htmlFor="lokasi"
              className="mb-1.5 block text-xs font-semibold text-gray-800 sm:text-sm"
            >
              {tema.labelLokasi}
            </label>
            <ComboField
              id="lokasi"
              value={form.lokasi}
              options={LOKASI.filter((l) => l !== "Lainnya")}
              placeholder="Pilih atau ketik lokasi..."
              className={fieldClass(errors.lokasi)}
              onChange={(val) => {
                setForm((prev) => ({ ...prev, lokasi: val }));
                if (errors.lokasi)
                  setErrors((prev) => ({ ...prev, lokasi: undefined }));
              }}
            />
            {errorText("lokasi")}
          </div>
        </div>

        {/* Tanggal (shadcn Calendar + Popover Date Picker) */}
        <div className="mb-4">
          <label
            htmlFor="tanggal"
            className="mb-1.5 block text-xs font-semibold text-gray-800 sm:text-sm"
          >
            {tema.labelTanggal}
          </label>
          <Popover open={isDateOpen} onOpenChange={setIsDateOpen}>
            <PopoverTrigger
              id="tanggal"
              className={`flex h-11 w-full items-center justify-between text-left ${fieldClass(errors.tanggal)} ${
                form.tanggal ? "text-gray-900" : "text-gray-500"
              }`}
            >
              <span>
                {form.tanggal ? formatDateId(form.tanggal) : "Pilih tanggal"}
              </span>
              <CalendarDays className="h-4 w-4 text-gray-500" />
            </PopoverTrigger>
            <PopoverContent
              align="start"
              sideOffset={6}
              className="w-auto rounded-xl border border-gray-200 bg-white p-0 shadow-xl"
            >
              <Calendar
                mode="single"
                selected={
                  form.tanggal ? new Date(`${form.tanggal}T00:00:00`) : undefined
                }
                onSelect={(date) => {
                  if (!date) return;
                  const yyyy = date.getFullYear();
                  const mm = String(date.getMonth() + 1).padStart(2, "0");
                  const dd = String(date.getDate()).padStart(2, "0");
                  setForm((prev) => ({ ...prev, tanggal: `${yyyy}-${mm}-${dd}` }));
                  if (errors.tanggal)
                    setErrors((prev) => ({ ...prev, tanggal: undefined }));
                  setIsDateOpen(false);
                }}
                disabled={{ after: new Date() }}
              />
            </PopoverContent>
          </Popover>
          {errorText("tanggal")}
        </div>

        {/* Deskripsi */}
        <div className="mb-4">
          <label
            htmlFor="deskripsi"
            className="mb-1.5 block text-xs font-semibold text-gray-800 sm:text-sm"
          >
            Deskripsi
          </label>
          <Textarea
            id="deskripsi"
            name="deskripsi"
            rows={4}
            value={form.deskripsi}
            onChange={handleChange}
            placeholder={tema.placeholderDeskripsi}
            className={`min-h-[110px] resize-none py-3 ${fieldClass(errors.deskripsi)}`}
          />
          {errorText("deskripsi")}
        </div>

        {/* Foto */}
        <div className="mb-6">
          <span className="mb-1.5 block text-xs font-semibold text-gray-800 sm:text-sm">
            Foto (opsional)
          </span>
          <FileUploader value={fotos} onChange={setFotos} accent={tema.warna} />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full rounded-xl py-3 text-sm font-semibold text-white shadow-sm transition disabled:opacity-60 ${tema.tombol}`}
        >
          {loading
            ? "Menyimpan..."
            : isEditMode
              ? "Simpan perubahan"
              : "Kirim laporan"}
        </button>
      </form>
    </div>
  );
}