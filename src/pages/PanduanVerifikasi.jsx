import Navbar from "@/components/Navbar";

const STEPS = [
  {
    number: 1,
    variant: "default",
    title: "Jika kamu merasa pemilik barang",
    points: [
      "Siapkan ciri yang hanya diketahui pemilik, misalnya isi tas, goresan, atau nomor seri.",
      "Sebutkan ciri khasnya lebih dulu sebelum penemu memberi tahu, ini yang membuktikan kamu pemilik aslinya.",
      "Siap menunjukkan bukti kepemilikan, seperti foto lama barang atau struk pembelian.",
    ],
  },
  {
    number: 2,
    variant: "default",
    title: "Jika kamu menemukan barang",
    points: [
      "Jangan menuliskan semua ciri khusus di postingan. Simpan satu atau dua ciri untuk verifikasi.",
      "Minta pengklaim menyebutkan ciri barang sebelum kamu menunjukkan atau menyerahkan barangnya.",
      "Jika ada identitas di dalam barang, cocokkan namanya dengan orang yang datang.",
    ],
  },
  {
    number: 3,
    variant: "default",
    title: "Saat bertemu",
    points: [
      "Pilih area kampus yang ramai pada siang hari, misalnya kantin atau lobi gedung.",
      "Bawa kartu mahasiswa dan, jika perlu, ajak teman.",
    ],
  },
  {
    number: 4,
    variant: "danger",
    title: "Hindari",
    points: [
      'Transfer uang, termasuk permintaan "biaya tebusan" atau "ongkos kirim".',
      "Mengirim kode OTP, tautan mencurigakan, atau data pribadi lewat chat.",
      "Bertemu di tempat sepi atau di luar area kampus.",
    ],
  },
  {
    number: 5,
    variant: "default",
    title: "Setelah barang kembali",
    points: [
      "Pelapor menandai laporan sebagai selesai lewat menu titik tiga di postingannya, atau menghapusnya.",
    ],
  },
];

function StepNumber({ number, variant }) {
  const isDanger = variant === "danger";
  return (
    <span
      className={[
        "flex h-6 w-6 shrink-0 items-center justify-center rounded-full",
        "text-xs font-bold text-white",
        isDanger ? "bg-red-600" : "bg-gray-900",
      ].join(" ")}
    >
      {number}
    </span>
  );
}

function WarningIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-5 w-5 shrink-0 text-orange-600"
      aria-hidden="true"
    >
      <path
        d="M12 3.5 2.5 20h19L12 3.5Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M12 9.5v4.25"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <circle cx="12" cy="16.75" r="1" fill="currentColor" />
    </svg>
  );
}

export default function PanduanVerifikasi() {
  return (
    <main className="min-h-screen bg-[#F5F5F4] px-8">
      <Navbar />
      <div className="mx-auto max-w-4xl my-10">
        {/* Header */}
        <h1 className="text-3xl font-extrabold text-gray-900">
          Panduan Verifikasi
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-500">
          Klaim barang diselesaikan lewat WhatsApp antara pelapor dan pemilik.
          Ikuti langkah berikut agar barang sampai ke orang yang tepat dan
          prosesnya tetap aman.
        </p>

        {/* Warning banner */}
        <div className="mt-5 flex items-start gap-2 rounded-lg bg-orange-50 px-4 py-3">
          <WarningIcon />
          <p className="text-sm leading-relaxed text-gray-700">
            Jangan pernah mengirim uang, kode OTP, atau data pribadi kepada
            siapa pun yang mengaku pemilik atau penemu barang.
          </p>
        </div>

        {/* Steps card */}
        <div className="mt-6 overflow-hidden rounded-2xl border border-gray-200 bg-white">
          {STEPS.map((step, idx) => (
            <section
              key={step.number}
              className={[
                "px-6 py-5",
                idx !== STEPS.length - 1 ? "border-b border-gray-200" : "",
              ].join(" ")}
            >
              <div className="flex items-center gap-2.5">
                <StepNumber number={step.number} variant={step.variant} />
                <h2 className="text-md font-bold text-gray-900">
                  {step.title}
                </h2>
              </div>

              <ul className="mt-2.5 space-y-1.5 pl-[34px] text-md leading-relaxed text-gray-600">
                {step.points.map((point, i) => (
                  <li key={i} className="list-disc marker:text-gray-400">
                    {point}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        {/* Footer link */}
        <p className="mt-5 text-[13px] text-gray-600">
          Menemukan postingan yang mencurigakan atau tidak pantas?{" "}
          <a
            href="/kontak-admin"
            className="font-semibold text-orange-600 hover:underline"
          >
            Hubungi admin
          </a>
        </p>
      </div>
    </main>
  );
}
