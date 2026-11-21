import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import FileUploader from "../components/FileUploader";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
    if (!form.kategori) err.kategori = "Pilih kategori";
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
    data.append("category", form.kategori);
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

  const inputBase =
    "w-full rounded-md border border-transparent bg-[#ebebeb] px-3.5 py-3 text-sm text-gray-900 shadow-sm outline-none placeholder:text-gray-400 focus:bg-white focus:ring-2";

  const errorText = (name) =>
    errors[name] ? (
      <p className="mt-1 text-xs text-red-600">{errors[name]}</p>
    ) : null;

  return (
    <div className="mx-auto my-8 max-w-3xl bg-white p-5">
      <form onSubmit={handleSubmit} noValidate className="w-full">
        <h1 className="mb-3 text-xl font-semibold">
          {isEditMode ? "Edit Laporan" : "Buat Laporan"}
        </h1>

        <div
          role="tablist"
          className="relative mb-4 grid grid-cols-2 rounded-lg bg-[#ebebeb] p-1 shadow-sm"
        >
          <span
            aria-hidden="true"
            className={`absolute inset-y-1 left-1 w-[calc(50%-4px)] rounded-md shadow transition-all duration-300 ease-out ${
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
              className={`relative z-10 rounded-md py-2 text-sm font-medium transition-colors duration-300 ${
                tipe === key ? "text-white" : "text-gray-900"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Nama barang */}
        <div className="mb-4">
          <label htmlFor="namaBarang" className="mb-1.5 block text-sm font-medium">
            Nama Barang
          </label>
          <Input
            id="namaBarang"
            name="namaBarang"
            type="text"
            value={form.namaBarang}
            onChange={handleChange}
            placeholder="Contoh: Dompet hitam"
            className="h-11 rounded-md border-0 bg-[#ebebeb] px-3.5 text-sm text-gray-900"
          />
          {errorText("namaBarang")}
        </div>

        {/* Kategori */}
        <div className="mb-4">
          <label htmlFor="kategori" className="mb-1.5 block text-sm font-medium">
            Kategori
          </label>
          <Select
            value={form.kategori}
            onValueChange={(val) => {
              setForm((prev) => ({ ...prev, kategori: val }));
              if (errors.kategori)
                setErrors((prev) => ({ ...prev, kategori: undefined }));
            }}
          >
            <SelectTrigger
              id="kategori"
              className="h-11 w-full rounded-md border-0 bg-[#ebebeb] px-3.5 text-sm text-gray-900"
            >
              <SelectValue placeholder="Pilih kategori" />
            </SelectTrigger>
            <SelectContent>
              {KATEGORI.map((k) => (
                <SelectItem key={k} value={k}>
                  {k}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errorText("kategori")}
        </div>

        {/* Lokasi */}
        <div className="mb-4">
          <label htmlFor="lokasi" className="mb-1.5 block text-sm font-medium">
            {tema.labelLokasi}
          </label>
          <Select
            value={form.lokasi}
            onValueChange={(val) => {
              setForm((prev) => ({ ...prev, lokasi: val }));
              if (errors.lokasi)
                setErrors((prev) => ({ ...prev, lokasi: undefined }));
            }}
          >
            <SelectTrigger
              id="lokasi"
              className="h-11 w-full rounded-md border-0 bg-[#ebebeb] px-3.5 text-sm text-gray-900"
            >
              <SelectValue placeholder="Pilih lokasi kampus" />
            </SelectTrigger>
            <SelectContent>
              {LOKASI.map((loc) => (
                <SelectItem key={loc} value={loc}>
                  {loc}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errorText("lokasi")}
        </div>

        {/* Tanggal */}
        <div className="mb-4">
          <label htmlFor="tanggal" className="mb-1.5 block text-sm font-medium">
            {tema.labelTanggal}
          </label>
          <Input
            id="tanggal"
            name="tanggal"
            type="date"
            max={new Date().toISOString().split("T")[0]}
            value={form.tanggal}
            onChange={handleChange}
            className={`h-11 rounded-md border-0 bg-[#ebebeb] px-3.5 text-sm text-gray-900 ${
              form.tanggal ? "" : "text-gray-400"
            }`}
          />
          {errorText("tanggal")}
        </div>

        {/* Deskripsi */}
        <div className="mb-4">
          <label htmlFor="deskripsi" className="mb-1.5 block text-sm font-medium">
            Deskripsi
          </label>
          <Textarea
            id="deskripsi"
            name="deskripsi"
            rows={4}
            value={form.deskripsi}
            onChange={handleChange}
            placeholder={tema.placeholderDeskripsi}
            className="min-h-[110px] resize-none rounded-md border-0 bg-[#ebebeb] px-3.5 py-3 text-sm text-gray-900"
          />
          {errorText("deskripsi")}
        </div>

        {/* Foto */}
        <div className="mb-5">
          <span className="mb-1.5 block text-sm font-medium">Foto (opsional)</span>
          <FileUploader value={fotos} onChange={setFotos} accent={tema.warna} />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full rounded-md py-3 text-xs font-semibold text-white shadow disabled:opacity-60 ${tema.tombol}`}
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