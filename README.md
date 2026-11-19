# Lost & Found Frontend (`lost-found`)

Aplikasi web Lost & Found berbasis kampus untuk melaporkan, mencari, dan mencocokkan barang hilang maupun ditemukan menggunakan pencocokan semantik berbasis AI.

## Tech Stack & Dependensi

- **Framework & Build Tool**: React 19 (`react`, `react-dom`), Vite 8 (`vite`, `@vitejs/plugin-react`)
- **Styling & Ikon**: Tailwind CSS v4 (`tailwindcss`, `@tailwindcss/vite`), `lucide-react`
- **Routing**: `react-router-dom` v7
- **Data Fetching & State Server**: `@tanstack/react-query` v5
- **HTTP Client**: `axios`
- **Notifikasi Toast**: `sonner`

### Dependensi yang Baru Ditambahkan

Tiga package berikut ditambahkan ke `package.json` karena digunakan oleh layer integrasi API dan notifikasi UI:

1. **`@tanstack/react-query` (`^5.108.1`)**
   - Mengelola *server state*, *caching*, dan *invalidation* untuk data postingan, komentar, serta notifikasi melalui custom hooks di `src/hooks/` (`usePosts.js`, `useComments.js`, `useNotifications.js`).
   - `QueryClientProvider` dikonfigurasi di `src/main.jsx` dengan `staleTime: 30_000`, `retry: 1`, dan `refetchOnWindowFocus: false`.
2. **`axios` (`^1.21.1`)**
   - Dikonfigurasi sebagai `apiClient` di `src/lib/axios.js` dengan `baseURL` dari `VITE_API_BASE_URL` dan `timeout: 15000`.
   - **Request interceptor**: otomatis menyisipkan header `Authorization: Bearer <token>` dari `localStorage.getItem('auth_token')`.
   - **Response interceptor**: membuka `response.data`, menormalisasi pesan error dari server, serta membersihkan sesi (`auth_token`, `auth_user`) dan memicu event `auth:unauthorized` saat menerima status `401`.
3. **`sonner` (`^2.0.8`)**
   - Menampilkan notifikasi toast di pojok kanan bawah (`<Toaster position="bottom-right" richColors closeButton />` pada `src/main.jsx`).
   - Digunakan oleh hooks mutasi (misalnya pada `useComments.js` untuk umpan balik sukses/gagal saat mengirim komentar).

## Konfigurasi Environment

Salin `.env.example` menjadi `.env` dan sesuaikan nilainya:

```env
VITE_API_BASE_URL=http://localhost:8000/api
VITE_USE_MOCK=true
```

- `VITE_API_BASE_URL`: URL dasar endpoint backend API.
- `VITE_USE_MOCK`: Jika bernilai `true`, service akan menggunakan data mock lokal (`src/lib/dummyData.js`) tanpa memanggil backend sungguhan.

## Menjalankan Proyek

Pastikan Node.js dan npm sudah terpasang serta ruang disk mencukupi (jika drive `C:` penuh, arahkan cache npm ke drive lain terlebih dahulu, misalnya `npm config set cache "D:\npm-cache" --global`).

```bash
# 1. Instal seluruh dependensi
npm install

# 2. Jalankan development server (http://localhost:5173)
npm run dev

# 3. Build untuk produksi (output ke folder dist/)
npm run build

# 4. Preview hasil build produksi
npm run preview

# 5. Jalankan linter ESLint
npm run lint
```

## Struktur Direktori

```text
src/
├── components/   # Komponen UI & layout (Navbar, Footer, PostCard, PostDetail, FilterSidebar, dll.)
├── context/      # AuthContext untuk state autentikasi pengguna
├── hooks/        # Custom hooks React Query (usePosts, useComments, useNotifications)
├── lib/          # Konfigurasi axios (axios.js), dummyData, formatters, dan validators
├── pages/        # Halaman utama aplikasi
├── services/     # Layer pemanggilan API (authService, postService, commentService, notificationService)
├── App.jsx       # Definisi route aplikasi
└── main.jsx      # Entry point, QueryClientProvider, AuthProvider, BrowserRouter, dan Toaster
```

Dokumen spesifikasi API backend tersedia di `BACKEND_SPEC.md`.

## Daftar Rute (`src/App.jsx`)

| Path | Halaman | Keterangan |
| :--- | :--- | :--- |
| `/` | `Home` | Beranda daftar laporan barang hilang & ditemukan (dengan `DefaultLayout`) |
| `/login` | `Login` | Halaman masuk akun |
| `/register` | `Register` | Halaman pendaftaran akun baru |
| `/profile` | `Profile` | Halaman profil & aktivitas pengguna (dengan `DefaultLayout`) |
| `/buat-laporan` | `FormLaporan` | Formulir pembuatan laporan baru (dengan `DefaultLayout`) |
| `*` | Redirect | Dialihkan ke `/` |
