import { useState } from "react";
import { useNavigate } from "react-router-dom";
import FileUploader from "../components/FileUploader";
import { useCreatePostMutation } from "../hooks/usePosts";

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
  const navigate = useNavigate();
  const createPost = useCreatePostMutation();

  const [tipe, setTipe] = useState("kehilangan");
  const [form, setForm] = useState(formAwal);
  const [fotos, setFotos] = useState([]);
  const [errors, setErrors] = useState({});

  const tema = TIPE[tipe];
  const loading = createPost.isPending;

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
      data.append("images[]", f);
    });

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
        <h1 className="mb-3 text-xl font-semibold">Buat Laporan</h1>

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
          <input
            id="namaBarang"
            name="namaBarang"
            type="text"
            value={form.namaBarang}
            onChange={handleChange}
            placeholder="Contoh: Dompet hitam"
            className={`${inputBase} ${tema.ring}`}
          />
          {errorText("namaBarang")}
        </div>

        {/* Kategori */}
        <div className="mb-4">
          <label htmlFor="kategori" className="mb-1.5 block text-sm font-medium">
            Kategori
          </label>
          <div className="relative">
            <select
              id="kategori"
              name="kategori"
              value={form.kategori}
              onChange={handleChange}
              className={`${inputBase} ${tema.ring} appearance-none pr-9 ${
                form.kategori ? "" : "text-gray-400"
              }`}
            >
              <option value="" disabled>
                Pilih kategori
              </option>
              {KATEGORI.map((k) => (
                <option key={k} value={k} className="text-gray-900">
                  {k}
                </option>
              ))}
            </select>
            <svg
              className="pointer-events-none absolute right-3 top-1/2 h-3 w-3 -translate-y-1/2 text-gray-900"
              viewBox="0 0 10 6"
              fill="currentColor"
            >
              <path d="M0 0l5 6 5-6z" />
            </svg>
          </div>
          {errorText("kategori")}
        </div>

        {/* Lokasi */}
        <div className="mb-4">
          <label htmlFor="lokasi" className="mb-1.5 block text-sm font-medium">
            {tema.labelLokasi}
          </label>
          <div className="relative">
            <select
              id="lokasi"
              name="lokasi"
              value={form.lokasi}
              onChange={handleChange}
              className={`${inputBase} ${tema.ring} appearance-none pr-9 ${
                form.lokasi ? "" : "text-gray-400"
              }`}
            >
              <option value="" disabled>
                Pilih lokasi kampus
              </option>
              {LOKASI.map((loc) => (
                <option key={loc} value={loc} className="text-gray-900">
                  {loc}
                </option>
              ))}
            </select>
            <svg
              className="pointer-events-none absolute right-3 top-1/2 h-3 w-3 -translate-y-1/2 text-gray-900"
              viewBox="0 0 10 6"
              fill="currentColor"
            >
              <path d="M0 0l5 6 5-6z" />
            </svg>
          </div>
          {errorText("lokasi")}
        </div>

        {/* Tanggal */}
        <div className="mb-4">
          <label htmlFor="tanggal" className="mb-1.5 block text-sm font-medium">
            {tema.labelTanggal}
          </label>
          <input
            id="tanggal"
            name="tanggal"
            type="date"
            max={new Date().toISOString().split("T")[0]}
            value={form.tanggal}
            onChange={handleChange}
            className={`${inputBase} ${tema.ring} ${
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
          <textarea
            id="deskripsi"
            name="deskripsi"
            rows={4}
            value={form.deskripsi}
            onChange={handleChange}
            placeholder={tema.placeholderDeskripsi}
            className={`${inputBase} ${tema.ring} resize-none`}
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
          {loading ? "Mengirim..." : "Kirim laporan"}
        </button>
      </form>
    </div>
  );
}