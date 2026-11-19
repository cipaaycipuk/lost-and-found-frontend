# Lost & Found Kampus — Backend API & Database Specification

Dokumen ini berisi spesifikasi lengkap untuk membangun backend **Lost & Found** (REST API + Skema Database) agar langsung kompatibel dengan setup frontend (`src/lib/axios.js` & `src/services/*`).

---

## 1. Arsitektur & Konvensi Umum

- **Base URL:** `http://localhost:8000/api` (dapat dikonfigurasi via `VITE_API_BASE_URL`)
- **Format Request/Response:** `application/json` (kecuali upload gambar menggunakan `multipart/form-data`)
- **Autentikasi:** JWT Bearer Token (`Authorization: Bearer <token>`)
- **Format Tanggal:** ISO 8601 (`YYYY-MM-DDTHH:mm:ssZ` atau `YYYY-MM-DD` untuk tanggal kejadian)

### Format Standar Response Sukses
```json
{
  "success": true,
  "message": "Berhasil mengambil data",
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 42,
    "total_pages": 5
  }
}
```

### Format Standar Response Error
```json
{
  "success": false,
  "message": "Validasi gagal",
  "errors": {
    "email": ["Email wajib menggunakan domain kampus"],
    "password": ["Password minimal 6 karakter"]
  }
}
```

---

## 2. Entity Relationship Diagram (ERD)

```text
users (1) ────────< (N) posts
users (1) ────────< (N) comments
users (1) ────────< (N) saved_posts >──────── (N) posts
users (1) ────────< (N) notifications
posts (1) ────────< (N) post_images
posts (1) ────────< (N) comments (self-referencing via parent_id)
```

---

## 3. Skema Database Lengkap (Tabel & Relasi)

Skema berikut menggunakan sintaks **PostgreSQL** (mudah disesuaikan ke MySQL/MariaDB jika menggunakan Laravel/Express).

### 3.1. Tabel `users`
Menyimpan data akun mahasiswa/pengguna.

| Kolom | Tipe Data | Constraint | Keterangan |
|---|---|---|---|
| `id` | `BIGSERIAL` / `UUID` | `PRIMARY KEY` | ID unik pengguna |
| `name` | `VARCHAR(100)` | `NOT NULL` | Nama lengkap pengguna |
| `email` | `VARCHAR(150)` | `NOT NULL, UNIQUE` | Email kampus (e.g. `@widyatama.ac.id`) |
| `password_hash` | `VARCHAR(255)` | `NOT NULL` | Password yang di-hash (bcrypt/argon2) |
| `whatsapp` | `VARCHAR(25)` | `NOT NULL` | Nomor WhatsApp aktif (contoh: `081312123476`) |
| `avatar_url` | `TEXT` | `NULL` | URL foto profil |
| `role` | `VARCHAR(20)` | `NOT NULL, DEFAULT 'user'` | `'user'` atau `'admin'` |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL, DEFAULT NOW()` | Waktu dibuat |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL, DEFAULT NOW()` | Waktu terakhir diubah |

### 3.2. Tabel `posts`
Menyimpan laporan barang hilang (`kehilangan`) atau ditemukan (`ditemukan`).

| Kolom | Tipe Data | Constraint | Keterangan |
|---|---|---|---|
| `id` | `BIGSERIAL` / `UUID` | `PRIMARY KEY` | ID unik laporan |
| `user_id` | `BIGINT` / `UUID` | `NOT NULL, FK -> users(id) ON DELETE CASCADE` | Pembuat laporan |
| `type` | `VARCHAR(20)` | `NOT NULL, CHECK (type IN ('kehilangan', 'ditemukan'))` | Jenis laporan |
| `status` | `VARCHAR(20)` | `NOT NULL, DEFAULT 'open', CHECK (status IN ('open', 'selesai'))` | Status pencarian/penyerahan |
| `title` | `VARCHAR(150)` | `NOT NULL` | Nama barang |
| `category` | `VARCHAR(80)` | `NOT NULL` | Kategori barang (e.g. `Elektronik`, `Dompet & Tas`, `Kunci`, `Dokumen & Kartu`, `Pakaian & Aksesoris`, `Buku & Alat Tulis`, `Lainnya`) |
| `location` | `VARCHAR(120)` | `NOT NULL` | Lokasi terakhir/ditemukan (e.g. `Foodcourt`, `Gedung A`, `Gedung B`, `Perpustakaan`) |
| `incident_date` | `DATE` | `NOT NULL` | Tanggal hilang/ditemukan |
| `description` | `TEXT` | `NOT NULL` | Ciri-ciri barang dan detail lokasi |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL, DEFAULT NOW()` | Waktu posting |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL, DEFAULT NOW()` | Waktu terakhir diubah |

**Index disarankan:**
- `idx_posts_type_status` pada `(type, status)`
- `idx_posts_category` pada `(category)`
- `idx_posts_location` pada `(location)`
- `idx_posts_created_at` pada `(created_at DESC)`

### 3.3. Tabel `post_images`
Menyimpan satu atau lebih foto untuk setiap laporan (relasi 1-to-many dari `posts`).

| Kolom | Tipe Data | Constraint | Keterangan |
|---|---|---|---|
| `id` | `BIGSERIAL` | `PRIMARY KEY` | ID unik gambar |
| `post_id` | `BIGINT` | `NOT NULL, FK -> posts(id) ON DELETE CASCADE` | ID laporan terkait |
| `image_url` | `TEXT` | `NOT NULL` | URL file gambar (S3 / Cloudinary / local `/uploads`) |
| `sort_order` | `INT` | `NOT NULL, DEFAULT 0` | Urutan tampilan gambar (0 = thumbnail utama) |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL, DEFAULT NOW()` | Waktu diunggah |

### 3.4. Tabel `comments`
Menyimpan komentar dan balasan (*nested reply* 1 level via `parent_id`).

| Kolom | Tipe Data | Constraint | Keterangan |
|---|---|---|---|
| `id` | `BIGSERIAL` | `PRIMARY KEY` | ID unik komentar |
| `post_id` | `BIGINT` | `NOT NULL, FK -> posts(id) ON DELETE CASCADE` | ID laporan |
| `user_id` | `BIGINT` | `NOT NULL, FK -> users(id) ON DELETE CASCADE` | Penulis komentar |
| `parent_id` | `BIGINT` | `NULL, FK -> comments(id) ON DELETE CASCADE` | Diisi jika komentar adalah balasan |
| `content` | `TEXT` | `NOT NULL` | Isi komentar |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL, DEFAULT NOW()` | Waktu komentar dibuat |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL, DEFAULT NOW()` | Waktu terakhir diubah |

### 3.5. Tabel `saved_posts`
Menyimpan daftar laporan yang di-*bookmark* / disimpan oleh pengguna.

| Kolom | Tipe Data | Constraint | Keterangan |
|---|---|---|---|
| `id` | `BIGSERIAL` | `PRIMARY KEY` | ID unik |
| `user_id` | `BIGINT` | `NOT NULL, FK -> users(id) ON DELETE CASCADE` | Pengguna yang menyimpan |
| `post_id` | `BIGINT` | `NOT NULL, FK -> posts(id) ON DELETE CASCADE` | Laporan yang disimpan |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL, DEFAULT NOW()` | Waktu disimpan |
| **Unique** | `UNIQUE (user_id, post_id)` | | Mencegah duplikasi bookmark |

### 3.6. Tabel `notifications`
Menyimpan notifikasi untuk pemilik laporan (misalnya ada komentar baru atau laporan ditandai selesai).

| Kolom | Tipe Data | Constraint | Keterangan |
|---|---|---|---|
| `id` | `BIGSERIAL` | `PRIMARY KEY` | ID unik notifikasi |
| `user_id` | `BIGINT` | `NOT NULL, FK -> users(id) ON DELETE CASCADE` | Penerima notifikasi |
| `actor_id` | `BIGINT` | `NULL, FK -> users(id) ON DELETE SET NULL` | Pengguna pemicu (misal yang berkomentar) |
| `post_id` | `BIGINT` | `NULL, FK -> posts(id) ON DELETE CASCADE` | Laporan terkait |
| `type` | `VARCHAR(40)` | `NOT NULL` | `'comment'`, `'reply'`, `'status_update'` |
| `message` | `TEXT` | `NOT NULL` | Teks ringkas notifikasi |
| `is_read` | `BOOLEAN` | `NOT NULL, DEFAULT FALSE` | Status sudah dibaca atau belum |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL, DEFAULT NOW()` | Waktu notifikasi |

---

## 4. SQL DDL Lengkap (Siap Eksekusi - PostgreSQL)

```sql
CREATE TABLE users (
  id            BIGSERIAL PRIMARY KEY,
  name          VARCHAR(100) NOT NULL,
  email         VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  whatsapp      VARCHAR(25)  NOT NULL,
  avatar_url    TEXT,
  role          VARCHAR(20)  NOT NULL DEFAULT 'user',
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE posts (
  id            BIGSERIAL PRIMARY KEY,
  user_id       BIGINT       NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type          VARCHAR(20)  NOT NULL CHECK (type IN ('kehilangan', 'ditemukan')),
  status        VARCHAR(20)  NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'selesai')),
  title         VARCHAR(150) NOT NULL,
  category      VARCHAR(80)  NOT NULL,
  location      VARCHAR(120) NOT NULL,
  incident_date DATE         NOT NULL,
  description   TEXT         NOT NULL,
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_posts_type_status ON posts (type, status);
CREATE INDEX idx_posts_category    ON posts (category);
CREATE INDEX idx_posts_location    ON posts (location);
CREATE INDEX idx_posts_created_at  ON posts (created_at DESC);

CREATE TABLE post_images (
  id         BIGSERIAL PRIMARY KEY,
  post_id    BIGINT      NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  image_url  TEXT        NOT NULL,
  sort_order INT         NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE comments (
  id         BIGSERIAL PRIMARY KEY,
  post_id    BIGINT      NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id    BIGINT      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  parent_id  BIGINT      REFERENCES comments(id) ON DELETE CASCADE,
  content    TEXT        NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_comments_post_id ON comments (post_id);

CREATE TABLE saved_posts (
  id         BIGSERIAL PRIMARY KEY,
  user_id    BIGINT      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  post_id    BIGINT      NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, post_id)
);

CREATE TABLE notifications (
  id         BIGSERIAL PRIMARY KEY,
  user_id    BIGINT      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  actor_id   BIGINT      REFERENCES users(id) ON DELETE SET NULL,
  post_id    BIGINT      REFERENCES posts(id) ON DELETE CASCADE,
  type       VARCHAR(40) NOT NULL,
  message    TEXT        NOT NULL,
  is_read    BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_read ON notifications (user_id, is_read);
```

---

## 5. Kontrak REST API Endpoints

### 5.1. Autentikasi (`/auth`)

| Method | Endpoint | Auth | Keterangan |
|---|---|---|---|
| `POST` | `/api/auth/register` | Tidak | Daftar akun baru |
| `POST` | `/api/auth/login` | Tidak | Login & dapatkan JWT |
| `POST` | `/api/auth/logout` | Ya | Invalidasi token (opsional jika stateless JWT) |
| `GET` | `/api/auth/me` | Ya | Ambil profil user yang sedang login |
| `PUT` | `/api/auth/profile` | Ya | Update profil (`name`, `whatsapp`, `avatar`) |

**Contoh Request `POST /api/auth/register`:**
```json
{
  "name": "Syifa Nur Aini",
  "email": "syifa@widyatama.ac.id",
  "password": "Password123!",
  "whatsapp": "081312123476"
}
```

**Contoh Response `200/201` Login & Register:**
```json
{
  "success": true,
  "message": "Login berhasil",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "name": "Syifa Nur Aini",
      "email": "syifa@widyatama.ac.id",
      "whatsapp": "081312123476",
      "avatar_url": "/users/emily.jpg"
    }
  }
}
```

---

### 5.2. Laporan / Posts (`/posts`)

| Method | Endpoint | Auth | Keterangan |
|---|---|---|---|
| `GET` | `/api/posts` | Opsional | List laporan dengan filter, search, sort, & pagination |
| `GET` | `/api/posts/:id` | Opsional | Detail 1 laporan beserta list gambar |
| `POST` | `/api/posts` | Ya | Buat laporan baru (`multipart/form-data`) |
| `PATCH` | `/api/posts/:id/status` | Ya (Owner) | Ubah status laporan (`open` / `selesai`) |
| `DELETE` | `/api/posts/:id` | Ya (Owner) | Hapus laporan |
| `POST` | `/api/posts/:id/bookmark` | Ya | Toggle simpan/hapus dari `saved_posts` |
| `GET` | `/api/posts/me` | Ya | Daftar laporan milik user yang sedang login |
| `GET` | `/api/posts/saved` | Ya | Daftar laporan yang disimpan oleh user |

**Query Parameters `GET /api/posts`:**
- `type`: `kehilangan` | `ditemukan` (kosongkan untuk semua)
- `category`: nama kategori
- `location`: nama lokasi
- `search`: kata kunci pencarian pada `title`, `description`, `location`
- `sort`: `latest` (default) | `oldest`
- `page`: nomor halaman (default `1`)
- `limit`: jumlah item per halaman (default `10`)

**Request `POST /api/posts` (`multipart/form-data`):**
- `type`: `'kehilangan'` | `'ditemukan'`
- `title`: string
- `category`: string
- `location`: string
- `incident_date`: `YYYY-MM-DD`
- `description`: string
- `images[]`: file gambar (opsional, maksimal misal 5 file, `image/jpeg,image/png,image/webp`)

**Contoh Item Post pada Response `GET /api/posts`:**
```json
{
  "id": 1,
  "type": "kehilangan",
  "status": "open",
  "title": "Tumbler minum leopard",
  "category": "Lainnya",
  "location": "Foodcourt",
  "incident_date": "2026-09-10",
  "description": "Dicari tumbler dengan motif leopard, terakhir simpen di gedung B lt.406",
  "images": ["/posts-img/tumbler.jpg"],
  "comments_count": 5,
  "is_saved": false,
  "created_at": "2026-09-10T08:30:00Z",
  "author": {
    "id": 2,
    "name": "Rony Parulian",
    "email": "rony@widyatama.ac.id",
    "whatsapp": "081312123476",
    "avatar_url": "/users/rony.jpg"
  }
}
```

---

### 5.3. Komentar (`/posts/:id/comments`)

| Method | Endpoint | Auth | Keterangan |
|---|---|---|---|
| `GET` | `/api/posts/:id/comments` | Tidak | Ambil daftar komentar pada post |
| `POST` | `/api/posts/:id/comments` | Ya | Tambah komentar atau balasan (`parent_id`) |
| `DELETE` | `/api/comments/:commentId` | Ya (Owner) | Hapus komentar |

**Request `POST /api/posts/:id/comments`:**
```json
{
  "content": "Di ujung sebelah mana nya kak?",
  "parent_id": null
}
```

---

### 5.4. Notifikasi (`/notifications`)

| Method | Endpoint | Auth | Keterangan |
|---|---|---|---|
| `GET` | `/api/notifications` | Ya | Ambil notifikasi user yang login |
| `PATCH` | `/api/notifications/:id/read` | Ya | Tandai 1 notifikasi telah dibaca |
| `PATCH` | `/api/notifications/read-all` | Ya | Tandai semua notifikasi telah dibaca |

---

## 6. Catatan Implementasi Backend

1. **CORS:** Aktifkan CORS untuk origin frontend Vite (`http://localhost:5173`) dengan `allowedHeaders: ['Content-Type', 'Authorization']`.
2. **Validasi Upload:** Batasi ukuran file maksimal `5MB` per foto dan hanya izinkan MIME type `image/jpeg`, `image/png`, `image/webp`.
3. **Otorisasi Kepemilikan:** Pastikan endpoint `PATCH /api/posts/:id/status`, `DELETE /api/posts/:id`, dan `DELETE /api/comments/:id` memverifikasi `record.user_id === req.user.id`.
4. **Mode Mock di Frontend:** Selama backend belum siap, frontend berjalan dengan `VITE_USE_MOCK=true` di `.env`. Saat backend sudah aktif, ubah menjadi `VITE_USE_MOCK=false` dan arahkan `VITE_API_BASE_URL` ke server backend kamu.
