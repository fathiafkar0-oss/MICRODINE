# MICRODINE · Platform Manajemen Restoran Skala Mikro

Pelanggan memesan dari meja lewat QR, membayar di awal (QRIS/tunai), pesanan masuk ke kasir & dapur secara
real-time, dan admin memantau omzet, HPP, laba kotor, serta target penjualan.

**Stack:** Laravel 13 · Inertia.js 3 · React 19 · Tailwind CSS 4 · PostgreSQL (rencana backend)

> **Status: Fase 1 — Frontend.** Semua halaman sudah bisa dibuka dan diklik dengan **data contoh**
> (`resources/js/Data/mock/`). Backend (database, autentikasi, payment gateway, WebSocket) dikerjakan di fase berikutnya.

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

Font (Plus Jakarta Sans) sudah ikut di-bundle lewat `@fontsource`, jadi tampilan tetap benar walau internet di lokasi lomba bermasalah.

---

## Daftar halaman

| URL | Halaman (`resources/js/Pages/…`) | Peran |
|---|---|---|
| `/` | `Welcome` — halaman awal + jalan pintas demo | Publik |
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
    │                             FilterChips, Logo, LiveBadge, OrderCard, CashPaymentModal
    ├── Layouts/                  AdminLayout, CashierLayout, KitchenLayout, CustomerLayout
    ├── Pages/
    │   ├── Auth/Login.jsx
    │   ├── Customer/             Menu/Index, Cart/Index, Checkout/Index, Payment/Index, Order/Status
    │   ├── Cashier/              Dashboard, Orders, Tables, History  (+ Partials/)
    │   ├── Kitchen/              Dashboard  (+ Partials/)
    │   ├── Admin/                Dashboard, Menus, Reports, Targets, Settings  (+ Partials/)
    │   └── Welcome.jsx
    ├── Hooks/                    useCart, useCurrency, useCountdown
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
