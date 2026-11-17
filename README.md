# MICRODINE

> **Inovasi Platform Manajemen Restoran Terpadu untuk Mendorong Kemandirian Digital Bisnis Mikro Indonesia**

MICRODINE adalah platform manajemen restoran skala mikro terpadu berbasis web yang mengintegrasikan sistem *Point of Sales* (POS) dan pemesanan mandiri (*self-ordering*) berbasis QR Code meja. Platform ini dirancang untuk menyelesaikan tantangan operasional restoran mikro melalui alur pembayaran di awal (*pay-first*), sinkronisasi antrean pesanan dapur dan kasir secara *real-time* berbasis WebSockets, visualisasi ketersediaan meja, serta perekaman Harga Pokok Penjualan (HPP) historis (*data snapshot*) guna memastikan keakuratan laporan keuangan dan profitabilitas bisnis secara berkelanjutan.

---

## Status Proyek
**Siap didemonstrasikan** (*Hackathon-ready*) — alur inti **Scan QR → Pay-First → Real-time KDS →
Snapshot Laba** sudah berjalan penuh dengan database sungguhan (bukan lagi data contoh/mock).

> Ingin membawakan demo ke juri? Ikuti **[`docs/DEMO_SCRIPT.md`](docs/DEMO_SCRIPT.md)** — skrip
> langkah-demi-langkah berdurasi 4–5 menit.

---

## Tim Pengembang (SKS Team)
- **Cut Fenny Nandalita** (NIM: 2404111010027)
- **Caesar Rahmawan** (NIM: 2404111010075)
- **Syarief Hidayatullah** (NIM: 2404111010096)
- **Fathi Afkar** (NIM: 2404111010118)

*Universitas Syiah Kuala — 2026*

---

## Tumpukan Teknologi (Tech Stack)
- **Backend**: Laravel 13.x (PHP 8.3+), arsitektur monolit (satu basis kode, tanpa REST API terpisah)
- **Frontend**: React 19+ via Inertia.js v3 (SPA)
- **Styling**: Tailwind CSS v4
- **Database**: PostgreSQL 16+ (dengan dukungan row-level/pessimistic locking)
- **Real-Time Synchronization**: Laravel Reverb + Laravel Echo (WebSocket, tanpa refresh manual)
- **Payment Gateway**: QRIS via `PaymentGatewayInterface` (sandbox Midtrans + simulator demo offline)

---

## Desain & Prototipe Antarmuka
- [Figma UI Proposal](https://www.figma.com/design/mpg0lR5Ub4Fsb4vdjuX99h/MICRODINE-%E2%80%93-UI-Proposal?node-id=0-1&t=RcLIaeDzs6K7zTV0-1)

---

## Menjalankan di laptop (setup lengkap, < 5 menit)

**Kebutuhan**: PHP **8.3+**, **Composer**, **Node.js 20+**, dan **PostgreSQL 16+** yang sudah
menyala (lihat ARCHITECTURE.md Bab 3 untuk alasan memilih PostgreSQL).

```bash
composer install
cp .env.example .env          # Windows PowerShell: copy .env.example .env
php artisan key:generate
npm install
```

### 1. Konfigurasi `.env` — Database

Buat database kosong bernama `microdine` di PostgreSQL, lalu isi bagian `DB_*` di `.env` sesuai
kredensial lokal (`DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`) — nilai bawaan (`.env.example`)
sudah mengarah ke `127.0.0.1:5432`, database `microdine`, user `postgres`.

```bash
php artisan migrate --seed
```

Seeder akan membuat data demo lengkap: akun staf, kategori & menu + HPP, meja, target penjualan
14 hari, dan beberapa transaksi contoh (`database/seeders/DemoTransactionSeeder.php`).

**Akun staf bawaan** (password selalu `password`):

| Username | Peran | Masuk lewat |
|---|---|---|
| `admin` | Admin | `/staf/masuk` |
| `kasir` | Kasir | `/staf/masuk` |
| `dapur` | Dapur | `/staf/masuk` |

### 2. Konfigurasi `.env` — Real-time (Laravel Reverb)

Modul real-time (layar dapur & kasir yang ter-update otomatis tanpa refresh) memakai
[Laravel Reverb](https://laravel.com/docs/reverb). Paket ini **tidak** ikut di-*commit* ke repo
(butuh unduhan dari Packagist), jadi pasang sekali saja di laptop masing-masing:

```bash
composer require laravel/reverb
php artisan reverb:install   # otomatis mengisi REVERB_* di .env & membuat config/reverb.php
```

Setelah itu, pastikan di `.env`:

```env
BROADCAST_CONNECTION=reverb   # bukan `log` — `reverb:install` tidak selalu mengubah baris ini otomatis
```

> Tanpa `laravel/reverb` terpasang / tanpa langkah ini, aplikasi **tetap bisa dipakai normal**
> (`BROADCAST_CONNECTION=log` di `.env.example` adalah default yang aman) — hanya saja layar dapur
> & kasir perlu refresh manual untuk melihat pesanan baru, alih-alih otomatis. Lihat
> `resources/js/echo.js` (bootstrap Echo di sisi frontend hanya aktif kalau `VITE_REVERB_APP_KEY`
> terisi) dan ARCHITECTURE.md Bab 6 & 8.2.

### 3. Jalankan

Opsi tercepat — satu perintah menyalakan server, Vite, queue listener, **dan** Reverb sekaligus:

```bash
composer run dev
```

Atau jalankan manual di terminal terpisah kalau perlu melihat log masing-masing proses:

```bash
php artisan serve             # terminal 1 → http://127.0.0.1:8000
php artisan reverb:start      # terminal 2 → WebSocket (lewati kalau belum pasang Reverb)
npm run dev                   # terminal 3 → Vite (hot reload)
```

Untuk demo tanpa `npm run dev`, cukup `npm run build` sekali lalu `php artisan serve`.

Font (Plus Jakarta Sans) sudah ikut di-bundle lewat `@fontsource`, jadi tampilan tetap benar walau
internet di lokasi lomba bermasalah.

### Deployment produksi

Template konfigurasi Nginx & Supervisor (queue worker + daemon Reverb dengan auto-restart) ada di
`deploy/nginx/` dan `deploy/supervisor/` — lihat komentar di masing-masing berkas sebelum dipasang
di server. Lihat ARCHITECTURE.md Bab 12.2.

---

## Daftar halaman

| URL | Halaman (`resources/js/Pages/…`) | Peran |
|---|---|---|
| `/` | *(tidak ada landing page — langsung diarahkan ke `/staf/masuk`)* | — |
| `/meja/07` | `Customer/Menu/Index` — menu hasil scan QR meja 07 | Pelanggan |
| `/meja/07/keranjang` | `Customer/Cart/Index` — keranjang + catatan per item | Pelanggan |
| `/meja/07/checkout` | `Customer/Checkout/Index` — nama pemesan + pilih QRIS / tunai | Pelanggan |
| `/pesanan/A-028/bayar` | `Customer/Payment/Index` — QRIS + hitung mundur / tombol simulasi demo | Pelanggan |
| `/pesanan/A-024` | `Customer/Order/Status` — timeline pesanan dimasak | Pelanggan |
| `/staf/masuk` | `Auth/Login` — portal masuk staf (Kasir / Dapur / Admin) | Staf |
| `/kasir` | `Cashier/Dashboard` — antrean pesanan (Kanban) + terima tunai, live tanpa refresh | Kasir |
| `/kasir/pesanan` | `Cashier/Orders` — pesanan manual + scan barcode meja (`MJ-07`) | Kasir |
| `/kasir/meja` | `Cashier/Tables` — status meja, tutup sesi, QR & barcode, live tanpa refresh | Kasir |
| `/kasir/histori` | `Cashier/History` — histori harian + cetak ulang struk | Kasir |
| `/dapur` | `Kitchen/Dashboard` — layar dapur (Kitchen Display), live tanpa refresh — cocok untuk TV dapur | Dapur |
| `/admin` | `Admin/Dashboard` — ringkasan bisnis | Admin |
| `/admin/menu` | `Admin/Menus` — menu & HPP + margin otomatis | Admin |
| `/admin/analisis-menu` | `Admin/MenuAnalytics` — menu terlaris, paling diminati, matriks menu | Admin |
| `/admin/meja` | `Admin/Tables` — tambah/ubah/nonaktifkan meja, buat ulang & cetak semua QR | Admin |
| `/admin/laporan` | `Admin/Reports` — transaksi & laporan (unduh CSV) | Admin |
| `/admin/target` | `Admin/Targets` — target penjualan bulanan | Admin |
| `/admin/pengaturan` | `Admin/Settings` — pajak, batas bayar, sesi meja, akun staf | Admin |

Alur demo pelanggan: buka `/meja/07` → tambah menu → keranjang → checkout → di halaman pembayaran klik
*"Mode demo: simulasikan pembayaran berhasil"* (menggantikan webhook payment gateway sandbox — lihat
`docs/DEMO_SCRIPT.md` untuk skrip lengkapnya).

---

## Struktur frontend

```
resources/
├── css/app.css                   Token desain (warna, font, radius) — ikuti mockup proposal
├── images/                       Foto restoran & menu
├── views/app.blade.php           Root Inertia
└── js/
    ├── app.jsx                   Entry Inertia (resolver halaman + toast)
    ├── echo.js                   Bootstrap Laravel Echo (Reverb) — lihat §Real-time di atas
    ├── Components/
    │   ├── UI/                   Komponen dasar: Button, Input (+Select, Textarea), Modal, Badge,
    │   │                         Card, Table, Toggle, StatCard, MenuThumb, QuantityStepper, TrendChart
    │   └── Shared/               Komponen bersama: Sidebar, Navbar, SearchBar, Pagination, PageHeader,
    │                             FilterChips, Logo, LiveBadge, OrderCard, CashPaymentModal, Ornament, Reveal, ClassicLogo
    ├── Layouts/                  AdminLayout, CashierLayout, KitchenLayout, CustomerLayout
    ├── Pages/
    │   ├── Auth/                 Login  (+ Partials/: panel foto, tab peran, kolom isian)
    │   ├── Customer/             Menu/Index, Cart/Index, Checkout/Index, Payment/Index, Order/Status
    │   ├── Cashier/              Dashboard, Orders, Tables, History  (+ Partials/)
    │   ├── Kitchen/              Dashboard  (+ Partials/)
    │   └── Admin/                Dashboard, Menus, MenuAnalytics, Tables, Reports, Targets, Settings  (+ Partials/)
    ├── Hooks/                    useCart, useCurrency, useCountdown, useLiveReload, useFlashToast, useReveal, useNow, useSeenOnScreen
    ├── Utils/                    formatCurrency, formatDate, status, classNames, navigation,
    │                             orderStorage, salesTarget, tables, menuAnalytics, menuInteractions
    └── Data/mock/                Data contoh — hanya dipakai sebagai nilai default props kalau backend
                                  belum mengirim props (lihat aturan di bawah)
```

Aturan main supaya rapi:

- **Satu halaman = satu file** di `Pages/`. Bagian halaman yang besar (modal form, grafik, panel detail)
  dipecah ke folder `Partials/` di sebelahnya, mis. `Pages/Admin/Partials/MenuFormModal.jsx`.
- Komponen yang dipakai **lebih dari satu halaman** masuk `Components/UI` (tanpa logika bisnis)
  atau `Components/Shared` (berisi logika/tata letak MICRODINE).
- Format rupiah & tanggal **selalu** lewat `Utils/formatCurrency` dan `Utils/formatDate`.
- Halaman tidak mengimpor data contoh secara langsung kecuali sebagai **nilai default props**.

**Panduan warna** (sesuai mockup proposal): latar `bg-canvas`, kartu `bg-panel`, aksi utama `bg-gold`,
aksi kedua `bg-navy`. Status selalu memakai **label teks**, bukan warna saja.

---

## Dokumen & referensi proyek

- `AGENTS.md` — aturan arsitektur & bisnis non-negosiasi, konvensi kode, workflow Git.
- `PRD.md` / `ARCHITECTURE.md` / `DESIGN.md` / `PLAN.md` / `API_CONTRACT.md` — spesifikasi lengkap per modul.
- `docs/DEMO_SCRIPT.md` — skrip demo 5 menit untuk dewan juri.
- `deploy/` — template konfigurasi Nginx & Supervisor untuk produksi.
