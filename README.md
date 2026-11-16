# MICRODINE

> **Inovasi Platform Manajemen Restoran Terpadu untuk Mendorong Kemandirian Digital Bisnis Mikro Indonesia**

MICRODINE adalah platform manajemen restoran skala mikro terpadu berbasis web yang mengintegrasikan sistem *Point of Sales* (POS) dan pemesanan mandiri (*self-ordering*) berbasis QR Code meja. Platform ini dirancang untuk menyelesaikan tantangan operasional restoran mikro melalui alur pembayaran di awal (*pay-first*), sinkronisasi antrean pesanan dapur dan kasir secara *real-time* berbasis WebSockets, visualisasi ketersediaan meja, serta perekaman Harga Pokok Penjualan (HPP) historis (*data snapshot*) guna memastikan keakuratan laporan keuangan dan profitabilitas bisnis secara berkelanjutan.

---

## Status Proyek
**Dalam Pengembangan** (*Under Active Development*)

> **Fase 1 — Frontend selesai.** Semua halaman sudah bisa dibuka dan diklik dengan **data contoh**
> (`resources/js/Data/mock/`). Backend (database, autentikasi, payment gateway, WebSocket) dikerjakan di fase berikutnya.

---

## Tim Pengembang (SKS Team)
- **Cut Fenny Nandalita** (NIM: 2404111010027)
- **Caesar Rahmawan** (NIM: 2404111010075)
- **Syarief Hidayatullah** (NIM: 2404111010096)
- **Fathi Afkar** (NIM: 2404111010118)

*Universitas Syiah Kuala — 2026*

---

## Tumpukan Teknologi (Tech Stack)
- **Backend Framework**: Laravel (PHP)
- **Frontend Architecture**: React (Single Page Application via Inertia.js)
- **Database**: PostgreSQL (dengan dukungan row-level locking)
- **Real-Time Synchronization**: WebSockets

---

## Desain & Prototipe Antarmuka
- [Figma UI Proposal](https://www.figma.com/design/mpg0lR5Ub4Fsb4vdjuX99h/MICRODINE-%E2%80%93-UI-Proposal?node-id=0-1&t=RcLIaeDzs6K7zTV0-1)

---

## Menjalankan di laptop

Butuh **PHP 8.3+**, **Composer**, dan **Node.js 20+**.

```bash
composer install
cp .env.example .env          # Windows PowerShell: copy .env.example .env
php artisan key:generate
npm install
```

Lalu jalankan dua terminal:

```bash
php artisan serve             # terminal 1 → http://127.0.0.1:8000
npm run dev                   # terminal 2 → Vite (hot reload)
```

Untuk demo tanpa `npm run dev`, cukup `npm run build` sekali lalu `php artisan serve`.

Font (Plus Jakarta Sans untuk aplikasi, Cormorant Garamond untuk judul halaman awal) sudah ikut di-bundle lewat `@fontsource`, jadi tampilan tetap benar walau internet di lokasi lomba bermasalah.

---

## Daftar halaman

| URL | Halaman (`resources/js/Pages/…`) | Peran |
|---|---|---|
| `/` | `Landing/Index` — halaman awal (landing page) + jalan pintas demo | Publik |
| `/meja/07` | `Customer/Menu/Index` — menu hasil scan QR meja 07 | Pelanggan |
| `/meja/07/keranjang` | `Customer/Cart/Index` — keranjang + catatan per item | Pelanggan |
| `/meja/07/checkout` | `Customer/Checkout/Index` — nama pemesan + pilih QRIS / tunai | Pelanggan |
| `/pesanan/A-028/bayar` | `Customer/Payment/Index` — QRIS + hitung mundur / instruksi tunai | Pelanggan |
| `/pesanan/A-024` | `Customer/Order/Status` — timeline pesanan dimasak | Pelanggan |
| `/staf/masuk` | `Auth/Login` — portal masuk staf (Kasir / Dapur / Admin) | Staf |
| `/kasir` | `Cashier/Dashboard` — antrean pesanan (Kanban) + terima tunai | Kasir |
| `/kasir/pesanan` | `Cashier/Orders` — pesanan manual + scan barcode meja (`MJ-07`) | Kasir |
| `/kasir/meja` | `Cashier/Tables` — status meja, tutup sesi, QR & barcode | Kasir |
| `/kasir/histori` | `Cashier/History` — histori harian + cetak ulang struk | Kasir |
| `/dapur` | `Kitchen/Dashboard` — layar dapur (Kitchen Display) | Dapur |
| `/admin` | `Admin/Dashboard` — ringkasan bisnis | Admin |
| `/admin/menu` | `Admin/Menus` — menu & HPP + margin otomatis | Admin |
| `/admin/laporan` | `Admin/Reports` — transaksi & laporan (unduh CSV) | Admin |
| `/admin/target` | `Admin/Targets` — target penjualan bulanan | Admin |
| `/admin/pengaturan` | `Admin/Settings` — pajak, batas bayar, sesi meja, akun staf | Admin |

Alur demo pelanggan: buka `/meja/07` → tambah menu → keranjang → checkout → di halaman pembayaran klik
*"Mode demo: simulasikan pembayaran berhasil"* (menggantikan webhook payment gateway sandbox).

---

## Struktur frontend

```
resources/
├── css/app.css                   Token desain (warna, font, radius) — ikuti mockup proposal
├── images/                       Foto restoran & menu
├── views/app.blade.php           Root Inertia
└── js/
    ├── app.jsx                   Entry Inertia (resolver halaman + toast)
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
    │   ├── Admin/                Dashboard, Menus, Reports, Targets, Settings  (+ Partials/)
    │   └── Landing/              Index  (+ Partials/: Hero, Fitur, Tentang, Menu, Langkah, Footer)
    ├── Hooks/                    useCart, useCurrency, useCountdown, useReveal, useNow
    ├── Utils/                    formatCurrency, formatDate, status, classNames, navigation,
    │                             orderStorage, salesTarget
    └── Data/mock/                DATA CONTOH: menus, orders, tables, restaurant, staff, reports
```

Aturan main supaya rapi:

- **Satu halaman = satu file** di `Pages/`. Bagian halaman yang besar (modal form, grafik, panel detail)
  dipecah ke folder `Partials/` di sebelahnya, mis. `Pages/Admin/Partials/MenuFormModal.jsx`.
- Komponen yang dipakai **lebih dari satu halaman** masuk `Components/UI` (tanpa logika bisnis)
  atau `Components/Shared` (berisi logika/tata letak MICRODINE).
- Format rupiah & tanggal **selalu** lewat `Utils/formatCurrency` dan `Utils/formatDate`.
- Halaman tidak mengimpor data contoh secara langsung kecuali sebagai **nilai default props**,
  supaya saat backend siap tinggal kirim props dari controller.

**Panduan warna** (sesuai mockup proposal): latar `bg-canvas`, kartu `bg-panel`, aksi utama `bg-gold`,
aksi kedua `bg-navy`. Status selalu memakai **label teks**, bukan warna saja.

---

## Catatan untuk tim backend

- Routes ada di `routes/web.php` (sementara memakai closure / `Route::inertia`). Ganti dengan controller.
- Setiap halaman sudah menerima **props** dengan nama yang tertulis di komentar bagian atas file-nya
  (mis. `Pages/Cashier/Dashboard.jsx` → `orders`, `restaurant`, `stats`). Kirim props dengan bentuk yang sama
  seperti di `Data/mock/`, dan halaman otomatis berhenti memakai data contoh.
- Item pesanan wajib menyimpan **snapshot `price` & `hpp`** saat transaksi dibuat.
- Omzet & laba di dasbor/laporan dihitung **hanya dari transaksi lunas** dan **sebelum pajak**.
- `auth.user` dibagikan lewat `app/Http/Middleware/HandleInertiaRequests.php`.
- Real-time: antrean kasir, layar dapur, dan status pelanggan menunggu event dari Laravel Reverb.
- QRIS memakai payment gateway **mode sandbox**; status lunas hanya dari webhook yang valid.
