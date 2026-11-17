# Deploy MICRODINE ke Railway (untuk dapat link publik)

Panduan ini melengkapi `deploy/` (template VPS) dengan jalur yang lebih cepat: satu
`Dockerfile` (lihat root proyek) yang menjalankan Nginx + PHP-FPM + Laravel Reverb
dalam satu container, di-deploy lewat [Railway](https://railway.app).

> File pendukung: `Dockerfile`, `docker/nginx.conf.template`, `docker/supervisord.conf`,
> `docker/entrypoint.sh`, `railway.json`. Semua sudah siap, tidak perlu diubah kecuali
> kamu paham betul apa yang diubah.

---

## 0. Sebelum mulai

- Pastikan semua perubahan sudah kamu `git add` + `commit` + **push** ke GitHub
  (`main` atau branch yang mau di-deploy) — Railway men-deploy langsung dari repo GitHub.
- Siapkan nilai `APP_KEY` baru khusus produksi (jangan pakai punya lokal):
  ```bash
  php artisan key:generate --show
  ```
  Simpan hasilnya (diawali `base64:...`) — dipakai di langkah 3.

---

## 1. Buat project di Railway

1. Masuk ke [railway.app](https://railway.app), login pakai akun GitHub.
2. **New Project** → **Deploy from GitHub repo** → pilih repo MICRODINE kalian.
3. Railway akan mendeteksi `railway.json` dan `Dockerfile` secara otomatis, lalu mulai build.
   **Build pertama ini akan GAGAL** — wajar, karena variabel environment belum diisi
   (lanjut ke langkah 2 & 3 dulu).

## 2. Tambah database PostgreSQL

1. Di dashboard project yang sama, klik **+ New** → **Database** → **Add PostgreSQL**.
2. Railway otomatis membuat service Postgres terpisah dengan variabel `PGHOST`, `PGPORT`,
   `PGDATABASE`, `PGUSER`, `PGPASSWORD` sendiri — kamu tidak perlu isi manual, tinggal
   dirujuk di langkah 3.

## 3. Isi variabel environment di service aplikasi (bukan di service Postgres)

Klik service aplikasi MICRODINE → tab **Variables** → isi satu-satu:

| Variabel | Nilai | Keterangan |
|---|---|---|
| `APP_NAME` | `MICRODINE` | |
| `APP_ENV` | `production` | **Wajib**, jangan `local` |
| `APP_KEY` | `base64:...` | Dari langkah 0 — **jangan** pakai `key:generate` di Railway, container bisa restart kapan saja |
| `APP_DEBUG` | `false` | **Wajib** — kalau `true`, error akan membocorkan isi `.env` ke publik |
| `APP_URL` | *(isi setelah langkah 5)* | Domain publik Railway kamu, pakai `https://` |
| `APP_LOCALE` | `id` | |
| `LOG_LEVEL` | `info` | |
| `DB_CONNECTION` | `pgsql` | |
| `DB_HOST` | `${{Postgres.PGHOST}}` | Railway reference variable — ketik persis begini |
| `DB_PORT` | `${{Postgres.PGPORT}}` | |
| `DB_DATABASE` | `${{Postgres.PGDATABASE}}` | |
| `DB_USERNAME` | `${{Postgres.PGUSER}}` | |
| `DB_PASSWORD` | `${{Postgres.PGPASSWORD}}` | |
| `SESSION_DRIVER` | `file` | |
| `BROADCAST_CONNECTION` | `reverb` | |
| `REVERB_APP_ID` | bebas, mis. `microdine1` | Dikarang sendiri — bukan dari pihak ketiga, bebas asal konsisten |
| `REVERB_APP_KEY` | bebas, mis. angka/huruf acak 20 karakter | Sama seperti di atas |
| `REVERB_APP_SECRET` | bebas, string acak panjang | Sama seperti di atas, jaga kerahasiaannya |
| `REVERB_HOST` | `127.0.0.1` | Internal container saja — Nginx yang meneruskan ke publik |
| `REVERB_PORT` | `6001` | Harus sama dengan di `docker/supervisord.conf` & `docker/nginx.conf.template` |
| `REVERB_SCHEME` | `http` | Internal saja, TLS publik ditangani Railway |
| `VITE_REVERB_APP_KEY` | sama seperti `REVERB_APP_KEY` di atas | **Dipakai saat build**, bukan saat runtime |
| `VITE_REVERB_HOST` | domain Railway kamu TANPA `https://`, mis. `microdine-production.up.railway.app` | Lihat langkah 5 — isi setelah domain ada, lalu **redeploy** |
| `VITE_REVERB_PORT` | `443` | |
| `VITE_REVERB_SCHEME` | `https` | |
| `FILESYSTEM_DISK` | `local` | |
| `QUEUE_CONNECTION` | `sync` | |
| `CACHE_STORE` | `file` | |
| `MAIL_MAILER` | `log` | |
| `MIDTRANS_IS_PRODUCTION` | `false` | Biarkan kosong kalau belum punya akun Midtrans sungguhan — tombol simulasi demo tetap jalan tanpa ini |

> **Catatan Build Variables**: `VITE_REVERB_*` dibaca Vite **saat build image**, bukan
> saat container jalan. Railway otomatis meneruskan variabel service sebagai build
> argument untuk Dockerfile — kalau ternyata tidak (cek di log build apakah muncul
> warning "VITE_REVERB_HOST is not set"), buka tab **Settings** service → cari bagian
> **Build** → tambahkan manual sebagai *Build Argument* dengan nama & nilai yang sama.

## 4. Redeploy

Setelah semua variabel di atas terisi (boleh lewati `APP_URL`/`VITE_REVERB_HOST` dulu,
isi placeholder sementara), klik **Deploy** lagi secara manual, atau push commit baru
ke GitHub (Railway auto-deploy tiap push).

## 5. Buat domain publik

1. Service aplikasi → tab **Settings** → bagian **Networking** → **Generate Domain**.
2. Railway akan memberi domain seperti `microdine-production.up.railway.app`.
3. Salin domain itu, isi balik ke variabel `APP_URL` (dengan `https://` di depan) dan
   `VITE_REVERB_HOST` (tanpa `https://`) di langkah 3 tadi.
4. **Redeploy sekali lagi** — langkah ini wajib karena `VITE_REVERB_HOST` baru
   benar-benar terpasang di hasil build JS setelah build ulang.

## 6. Tes

- Buka domain publiknya, harus langsung diarahkan ke `/staf/masuk` (sesuai perubahan
  landing page kemarin).
- Login pakai `admin` / `password` (akun ini otomatis dibuat oleh seeder lewat
  `php artisan migrate --force` yang dijalankan `docker/entrypoint.sh` setiap container start).
- Buka dua tab (Kasir & Dapur), coba alur Scan QR → Bayar → cek apakah kedua tab
  ter-update otomatis tanpa refresh (tanda Reverb benar-benar jalan).
- Kalau real-time tidak jalan tapi semua halaman lain normal: cek lagi `VITE_REVERB_HOST`
  sudah diisi domain yang benar dan sudah di-redeploy setelahnya (kesalahan paling umum).

---

## Troubleshooting cepat

| Gejala | Kemungkinan penyebab |
|---|---|
| Build gagal di tahap `composer install` | Cek `composer.lock` ikut di-commit & di-push, jangan masuk `.gitignore` |
| Build gagal di tahap `npm run build` | Sama — pastikan `package-lock.json` ikut ter-push |
| Halaman tampil tapi semua data kosong/error 500 | `APP_KEY` belum diisi atau variabel `DB_*` salah rujuk ke service Postgres |
| Login sukses tapi HPP/laporan kosong | Wajar untuk database baru — jalankan seeder manual sekali lewat tab **Shell** di Railway: `php artisan db:seed` |
| WebSocket tidak konek (console browser ada error `wss://...` gagal) | `VITE_REVERB_HOST` salah/belum di-redeploy, atau domain belum di-generate |
