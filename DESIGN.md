# Sistem Desain UI (Design System) — MICRODINE

> **Inovasi Platform Manajemen Restoran Terpadu untuk Mendorong Kemandirian Digital Bisnis Mikro Indonesia**  
> **Versi Dokumen**: 1.0 (Official UI Specification)  
> **Acuan Desain Utama**: `docs/mockups/` (9 Layar Prototipe Proposal SKS Team 2026), `docs/palette-mobile.jpeg` (Palet Theatre), `docs/palette.jpeg` (Palet Ocean)

---

## 1. Prinsip Desain & Identitas Visual (Design Principles & Mood)

Sistem desain MICRODINE memadukan efisiensi operasional sistem kasir kelas industri dengan kehangatan keramahan restoran (*hospitality*). Desain antarmuka dibagi menjadi dua tema terpadu yang berbagi semantik token yang sama:

1. **Tema Mobile "Theatre" (Antarmuka Pelanggan / Self-Ordering)**:
   - **Nuansa & Karakter**: Hangat, elegan, mewah, dan menggugah selera (*warm, elegant, premium dining experience*).
   - **Tujuan**: Menghadirkan rasa nyaman saat memesan mandiri lewat ponsel pintar, dengan tipografi yang jernih, tombol aksi sentuh yang ramah ibu jari (*thumb-zone friendly*), dan hierarki harga yang transparan.
2. **Tema Desktop "Ocean" & "Theatre Extended" (Portal Staf: Kasir, Dapur, Admin)**:
   - **Nuansa & Karakter**: Tenang, presisi, bersih, profesional, dan berdensitas informasi tinggi (*high-density, low-fatigue operational dashboard*).
   - **Tujuan**: Mengurangi kelelahan mata (*eye fatigue*) kasir dan juru masak yang menatap layar berjam-jam, memperjelas status antrean dengan kode warna fungsional instan, serta meminimalkan klik saat transaksi berlangsung.

---

## 2. Token Desain (Design Tokens) & Konfigurasi Tema

### 2.1 Palet Warna & Spesifikasi Nilai Hex

#### A. Tema "Theatre" (Default untuk Pelanggan `Customer/*`)
- **Regal Navy** (`#0A1D4B`): Digunakan untuk header atas, top bar, tombol sekunder, dan penekanan judul penting.
- **Deep Crimson** (`#9E0E18`): Digunakan untuk status bahaya, pesanan batal/gagal, meja terisi, error validasi, dan aksi destruktif.
- **Opulent Gold** (`#CC9E4A`): Digunakan untuk tombol *Call-to-Action* (CTA) utama, lencana antrean aktif, dan aksen penting.
- **Ethereal Ivory** (`#F7EBE0`): Digunakan untuk latar belakang kanvas halaman, kartu menu masakan, dan kontainer kartu pesanan.
- **Velvet Obsidian** (`#171721`): Digunakan untuk teks utama, teks di atas latar emas, dan *overlay* modal gelap.

#### B. Tema "Ocean" (Pilihan Alternatif Portal Staf `Cashier/*`, `Kitchen/*`, `Admin/*`)
- **Timid Blue** (`#DAE1EE`): Digunakan untuk latar belakang kanvas permukaan terang.
- **Movie Magic** (`#B4C0D5`): Digunakan untuk garis border halus, efek hover, dan chip pendukung.
- **Periwinkle Blossom** (`#8E9CB7`): Digunakan untuk teks sekunder/muted, garis batas kartu, dan aksen dekoratif.
- **Dana** (`#566680`): Digunakan untuk tombol aksi primer staf, ikon aktif, dan navigasi tab.
- **Black Is Back** (`#10161A`): Digunakan untuk sidebar navigasi gelap dan teks judul utama.

#### C. Warna Status Fungsional (Functional Status Colors)
Warna status distandardisasi secara global agar memiliki makna visual yang seragam:
- **Status Lunas / Sukses / Tersedia (Hijau)**: `#16A34A` (Emerald 600) | Latar lembut: `#DCFCE7` (Emerald 100)
- **Status Menunggu Bayar / Pending (Amber)**: `#D97706` (Amber 600) | Latar lembut: `#FEF3C7` (Amber 100)
- **Status Diproses / Memasak / Diantar (Biru)**: `#2563EB` (Blue 600) | Latar lembut: `#DBEAFE` (Blue 100)
- **Status Batal / Gagal / Terisi (Merah/Crimson)**: `#9E0E18` (Deep Crimson) | Latar lembut: `#FEE2E2` (Red 100)

---

### 2.2 Uji Kepatuhan Kontras Aksesibilitas (WCAG 2.1 AA)

Standar minimum rasio kontras WCAG AA adalah **4.5:1** untuk teks normal dan **3:0:1** untuk teks tebal/besar (`>= 18pt` atau bold `>= 14pt`) serta elemen grafis kontrol UI:

| Pasangan Warna (Latar vs Teks) | Rasio Kontras | Status WCAG | Ketentuan & Rekomendasi Desain |
| :--- | :---: | :---: | :--- |
| **Obsidian `#171721` di atas Ivory `#F7EBE0`** | **15.1 : 1** | **PASS (AAA)** | Digunakan untuk seluruh paragraf, nama menu, dan harga di halaman pelanggan. |
| **Regal Navy `#0A1D4B` di atas Ivory `#F7EBE0`** | **13.9 : 1** | **PASS (AAA)** | Digunakan untuk judul kategori dan header section. |
| **Deep Crimson `#9E0E18` di atas Ivory `#F7EBE0`** | **7.1 : 1** | **PASS (AAA)** | Digunakan untuk teks harga promo, label meja "Terisi", dan pesan error. |
| **White `#FFFFFF` di atas Regal Navy `#0A1D4B`** | **16.4 : 1** | **PASS (AAA)** | Digunakan untuk teks header aplikasi dan tombol sekunder. |
| **Velvet Obsidian `#171721` di atas Gold `#CC9E4A`** | **7.2 : 1** | **PASS (AAA)** | **WAJIB**: Teks di atas tombol CTA emas harus menggunakan Velvet Obsidian. |
| *White `#FFFFFF` di atas Gold `#CC9E4A`* | *2.5 : 1* | *FAIL* | **DILARANG**: Teks putih di atas emas tidak lolos kontras. |
| *Gold `#CC9E4A` di atas Ivory `#F7EBE0`* | *2.1 : 1* | *FAIL* | **DILARANG**: Warna emas tidak boleh menjadi warna teks di atas latar ivory. |
| **Gold `#CC9E4A` di atas Regal Navy `#0A1D4B`** | **6.6 : 1** | **PASS (AA)** | Digunakan untuk teks nomor meja dan ikon bintang di header navy. |
| *Deep Crimson `#9E0E18` di atas Navy `#0A1D4B`* | *1.9 : 1* | *FAIL* | **DILARANG**: Jangan menempatkan lencana merah langsung di atas navbar navy. |
| **Black Is Back `#10161A` di atas Timid Blue `#DAE1EE`**| **13.8 : 1** | **PASS (AAA)** | Digunakan untuk teks utama pada tabel kasir dan dasbor admin. |
| **White `#FFFFFF` di atas Black Is Back `#10161A`** | **18.2 : 1** | **PASS (AAA)** | Digunakan untuk teks menu navigasi pada sidebar staf. |
| **White `#FFFFFF` di atas Dana `#566680`** | **5.8 : 1** | **PASS (AA)** | Digunakan untuk teks tombol aksi primer pada portal staf. |

---

### 2.3 Konfigurasi Tailwind CSS v4 (@theme) & Variabel Desain

Repositori mengadopsi arsitektur **Tailwind CSS v4** dengan plugin `@tailwindcss/vite`. Seluruh token desain didefinisikan secara deklaratif menggunakan direktif `@theme` langsung pada `resources/css/app.css` tanpa memerlukan berkas `tailwind.config.js` eksternal:

```css
/* resources/css/app.css */
@import 'tailwindcss';
@import '@fontsource-variable/plus-jakarta-sans';

@source '../../vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php';
@source '../../storage/framework/views/*.php';

/*
 * Token desain MICRODINE, mengikuti mockup proposal (BAB II 2.3).
 * Palet: Regal Navy, Deep Crimson, Opulent Gold, Ethereal Ivory, Velvet Obsidian.
 *
 * Aturan pakai singkat:
 * - Latar halaman: bg-canvas · kartu: bg-panel + border-line
 * - Aksi utama: bg-gold text-obsidian (tombol pil) · aksi kedua: bg-navy text-white
 * - Status selalu memakai label teks, bukan warna saja
 */
@theme {
    --font-sans: 'Plus Jakarta Sans Variable', 'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif;

    /* Warna merek */
    --color-navy: #0a1d4b;
    --color-navy-hover: #162c68;
    --color-navy-soft: #1c2f63;
    --color-crimson: #9e0e18;
    --color-gold: #cc9e4a;
    --color-gold-hover: #b98a35;
    --color-gold-soft: #f2cf87;
    --color-gold-tint: #faf0dc;
    --color-ivory: #f4e8db;
    --color-obsidian: #171721;

    /* Permukaan & teks */
    --color-canvas: #f4e8db;
    --color-panel: #fffcf7;
    --color-raised: #f8efe4;
    --color-line: #e9dccb;
    --color-line-strong: #d3c1a8;
    --color-ink: #171721;
    --color-soft: #474a59;
    --color-faint: #686b78;

    /* Status fungsional (dipasangkan dengan label teks) */
    --color-success: #1e6f48;
    --color-success-tint: #e1f0e6;
    --color-danger: #9e0e18;
    --color-danger-tint: #f7e0e2;
    --color-warn: #7a5410;
    --color-warn-tint: #f6e7c9;
    --color-info: #34446e;
    --color-info-tint: #e6e9f1;

    --radius-card: 16px;

    --animate-fade-in: fade-in 160ms ease-out;
    --animate-slide-up: slide-up 220ms cubic-bezier(0.2, 0.8, 0.2, 1);
    --animate-pop-in: pop-in 180ms cubic-bezier(0.2, 0.8, 0.2, 1);
}

@layer base {
    html {
        -webkit-text-size-adjust: 100%;
        background-color: var(--color-canvas);
    }

    body {
        font-family: var(--font-sans);
        font-feature-settings: 'tnum' 1;
        color: var(--color-ink);
        -webkit-font-smoothing: antialiased;
    }

    :focus-visible {
        outline: 2px solid var(--color-navy);
        outline-offset: 2px;
    }
}

@utility scrollbar-none {
    scrollbar-width: none;
    &::-webkit-scrollbar {
        display: none;
    }
}

@utility menu-tile {
    background-image: linear-gradient(135deg, #b8742f 0%, #7a3b16 100%);
}
```

---

### 2.4 Tipografi (Typography)

1. **Tipografi Utama Antarmuka**: **Plus Jakarta Sans** (Google Fonts).
   - *Alasan*: Huruf geometris sans-serif kontemporer dengan keterbacaan tinggi di layar kecil (*mobile*), memiliki karakter angka monospaced proporsional yang rapi untuk penyajian format nominal rupiah (misal: `Rp 63.800`).
2. **Tipografi Aksesori Brand (Opsional)**: **Cormorant Garamond** (Google Fonts).
   - *Alasan*: Digunakan secara terbatas hanya untuk teks logo *"MICRODINE"* di header aplikasi pelanggan untuk menegaskan identitas restoran berkelas (*fine-dining / artisanal cafe*). Seluruh teks fungsional lainnya tetap memakai sans-serif.

---

## 3. Tata Letak Induk (Layout Shells)

Sistem antarmuka terbagi ke dalam **4 tata letak independen** (`resources/js/Layouts/`) yang disesuaikan secara spesifik untuk ergonomi masing-masing persona:

### 3.1 Customer Shell (`CustomerLayout.jsx`)
- **Target Form Factor**: Mobile-first viewport (~390px hingga 428px), terpusat (`max-w-md mx-auto min-h-screen`) saat diakses melalui peramban desktop.
- **Header Atas (Sticky)**:
  - Latar belakang: `#0A1D4B` (Regal Navy).
  - Teks brand `MICRODINE` dengan lencana nomor meja emas: *"Meja [X]"*.
  - Indikator status sesi meja aktif.
- **Area Konten (Scrollable)**: Berisi katalog menu, keranjang, checkout, dan status pesanan dengan kanvas `--color-canvas` (`#F4E8DB`).
- **Bilah Aksi Bawah (Sticky Bottom Action Bar)**:
  - Mengapung di bagian bawah layar gawai dengan latar panel ivory/navy.
  - Tombol aksi utama CTA emas membulat (`bg-gold text-obsidian rounded-xl`): *"Lihat Keranjang"* atau *"Konfirmasi Pesanan"*.

### 3.2 Cashier Shell (`CashierLayout.jsx`)
- **Navigasi Atas & Status Operasional**:
  - Top bar bersih dengan logo MICRODINE dan tab navigasi cepat: **Pesanan (Kanban)**, **Manajemen Meja**, dan **Histori Transaksi**.
  - Indikator konektivitas WebSocket (*"Online"* / *"Reconnecting..."*).
  - Jam digital WIB dan profil kasir bertugas.
- **Area Konten**: Densitas tinggi, layout grid/kanban yang dioptimalkan untuk efisiensi kecepatan operasional di meja kasir.

### 3.3 Kitchen Shell (`KitchenLayout.jsx`)
- **Target Form Factor**: Layar penuh monitor / tablet dapur (*100vw, 100vh*), bebas distraksi navigasi kasir/admin.
- **Header Minimalis**:
  - Judul *"Kitchen Display System (KDS)"*.
  - Indikator lencana hijau berkedip: *"Live - update otomatis"*.
  - Ringkasan jumlah tiket antrean memasak dan tiket yang telah selesai.
- **Kisi Tiket**: Grid responsif kartu tiket berdimensi besar yang dapat dibaca jelas dari jarak 2 meter.

### 3.4 Admin Shell (`AdminLayout.jsx`)
- **Sidebar Navigasi Kiri (Lebar 240px - 260px)**:
  - Latar belakang navy pekat (`#0A1D4B`).
  - Header: Logo `MICRODINE` dengan teks *"Admin Panel"*.
  - Grup Navigasi:
    - **Dashboard** (Ringkasan finansial & tren)
    - **Menu & HPP** (Master data menu & kalkulator margin)
    - **Laporan** (Audit transaksi & export)
    - **Target Penjualan** (Proyeksi omzet bulanan & harian)
    - **Pengaturan** (Pajak daerah PBJT/PB1 & sistem)
  - Footer Sidebar: Profil Admin dan tombol Keluar (*Logout*).
- **Kanvas Utama**: Padding standar `p-6` hingga `p-8`, latar `--color-canvas`, kartu metrik berlatar `--color-panel` putih gading.

---

## 4. Katalog Komponen UI Lengkap (Component Catalog)

Komponen UI diorganisasi ke dalam dua sub-folder di `resources/js/Components/`:

### 4.1 Komponen UI Dasar (`Components/UI/`)
1. **Button (`Button.jsx`)**:
   - Varian: `primary` (bg-gold text-obsidian), `secondary` (bg-navy text-white), `danger` (bg-crimson text-white), `ghost` (border border-line text-ink).
   - Ukuran: `sm`, `md`, `lg`. State: `hover`, `active`, `focus-visible`, `disabled`, `loading`.
2. **Input & Select (`Input.jsx`)**:
   - Input teks, angka rupiah, pencarian dengan ikon, textarea catatan masakan.
3. **Card (`Card.jsx`)**:
   - Kontainer permukaan bersih (`bg-panel border border-line rounded-card shadow-sm`).
4. **Modal (`Modal.jsx`)**:
   - Modal backdrop gelap dengan animasi `pop-in`, tombol tutup, dan area aksi.
5. **Table & Pagination (`Table.jsx`)**:
   - Tabel audit transaksi berbaris rapi dengan styling header kontras dan kontrol pagination.
6. **Toggle (`Toggle.jsx`)**:
   - Saklar sakelar geser untuk status ketersediaan menu ("Tersedia / Habis") dan toggle pajak PBJT/PB1.
7. **StatCard (`StatCard.jsx`)**:
   - Kartu metrik ringkasan omzet, laba kotor, pesanan selesai, dan HPP dengan lencana persentase tren.
8. **TrendChart & TargetComparisonChart (`TrendChart.jsx`, `TargetComparisonChart.jsx`)**:
   - Grafik batang omzet dan garis laba bersih 14 hari serta grafik perbandingan target penjualan.
9. **PaymentDistributionChart & TopSellingList (`PaymentDistributionChart.jsx`, `TopSellingList.jsx`)**:
   - Visualisasi distribusi metode pembayaran (QRIS vs Tunai) dan daftar produk terlaris.

### 4.2 Komponen Komposit Bersama (`Components/Shared/`)
1. **CashPaymentModal (`CashPaymentModal.jsx`)**:
   - Modal kalkulator pembayaran tunai kasir dengan input pecahan uang cepat (`Rp 50.000`, `Rp 100.000`, `Uang Pas`) dan kalkulasi kembalian otomatis real-time.
2. **DishDetailModal (`DishDetailModal.jsx`)**:
   - Modal detail hidangan pelanggan untuk mengatur porsi dan catatan khusus ("tanpa seledri", "pedas level 2").
3. **ReceiptModal (`ReceiptModal.jsx`)**:
   - Modal tampilan struk kasir dengan format thermal 58mm/80mm siap cetak (`window.print()`).
4. **Navbar & Sidebar (`Navbar.jsx`, `Sidebar.jsx`)**:
   - Komponen navigasi atas dan sidebar staf.
5. **SearchBar & Pagination (`SearchBar.jsx`, `Pagination.jsx`)**:
   - Pencarian instan dan navigasi halaman data.
6. **Toast & OfflineBanner (`Toast.jsx`, `OfflineBanner.jsx`)**:
   - Penampil notifikasi status transaksi dan peringatan hilangnya koneksi jaringan WebSocket.

---

## 5. Spesifikasi Detail 9 Layar Mockup UI (Mockup Specifications)

### Layar 1: Antarmuka Pemesanan Pelanggan (Mobile-First)
- **Komponen Utama**:
  1. Header Navy: Menampilkan nama restoran, tombol "Pesanan Saya", dan kartu info nomor meja (misal: Meja 07).
  2. Filter Kategori: Chip horizontal (*Semua, Makanan, Minuman, Camilan*).
  3. Kartu Menu: Gambar makanan di sisi kanan/kiri, nama menu, deskripsi singkat, harga rupiah, dan tombol `+ Tambah` atau stepper `- 1 +`.
  4. Halaman Keranjang: Rincian item, catatan khusus per item ("Tanpa bawang goreng"), subtotal, pajak daerah PBJT/PB1 10%, dan total tagihan.
  5. Halaman Pembayaran: Pilihan radio button **QRIS** (otomatis e-wallet/m-banking) vs **Tunai di Kasir**, ringkasan pesanan, dan tombol CTA emas *"Konfirmasi Pesanan"*.
  6. Layar Pelacak Pesanan: Nomor antrean besar (misal: `A-024`), timer hitung mundur 15 menit, gambar QRIS dinamis, tombol "Unduh QR" dan "Bayar Tunai", serta indikator visual progres 3 tahap: *Menunggu Bayar → Sedang Dimasak → Siap Disajikan*.

### Layar 2: Portal Autentikasi Karyawan Terpusat (Login)
- **Komponen Utama**:
  1. Latar belakang: Foto restoran redup dengan *dark gradient overlay*.
  2. Kartu Login Glassmorphism / Putih Bersih di tengah.
  3. Tab Segmented Control: Pilihan tab **"Kasir"** dan **"Admin"**.
  4. Input Form: Username dengan ikon pengguna, Password dengan ikon gembok dan toggle mata *show/hide*.
  5. Tombol Masuk: Tombol emas/navy lebar penuh *"Masuk ke Portal"*.

### Layar 3: Antrean Pesanan Kasir (Kanban Board)
- **Komponen Utama**:
  1. Kartu Ringkasan 4 Kolom: Menunggu Bayar (3), Sedang Diproses (2), Selesai Hari Ini (27), Omzet Hari Ini (`Rp 2.140.000`).
  2. Papan Kanban 3 Kolom:
     - Kolom 1: **Menunggu Pembayaran** (Kartu pesanan tunai dengan tombol *"Terima Tunai"*).
     - Kolom 2: **Diproses** (Pesanan lunas sedang dimasak dapur, dilengkapi tombol *"Tandai Selesai"*).
     - Kolom 3: **Selesai** (Pesanan yang sudah siap disajikan / diantar).
  3. Pop-up Modal Kalkulator Tunai: Terpicu saat kasir klik "Terima Tunai".

### Layar 4: Manajemen Meja & Histori Pesanan Kasir
- **Komponen Utama**:
  1. **Tab Manajemen Meja**: Grid kartu meja (Meja 01 s/d Meja 12) dengan kode warna hijau (Tersedia) dan merah (Terisi), detail nama pelanggan dan waktu berjalan, serta aksi "Lihat QR Meja" dan "Tutup Sesi".
  2. **Tab Histori Pesanan**:
     - Filter rentang tanggal, filter metode (Semua, Tunai, QRIS), dan tab status (*Semua, Lunas, Menunggu Bayar, Dibatalkan, Gagal*).
     - Tabel transaksi: Kolom Pesanan, Meja-Sumber, Item, Total, Metode, Pembayaran, Status Dapur.
     - Drawer Detail Pesanan: Muncul di panel kanan saat baris diklik, menyajikan timeline riwayat status, log verifikasi webhook gateway, dan tombol cetak struk.

### Layar 5: Dasbor Keuangan & Analitik Admin
- **Komponen Utama**:
  1. Kartu Metrik Utama: Total Omzet (`Rp 4.250.000`), Total HPP (`Rp 2.590.000`), Laba Bersih (`Rp 1.660.000`, Margin 39%), Transaksi Sukses (68).
  2. Filter Waktu: Tombol pilihan *Hari ini, 7 hari, 30 hari*, dan *Pilih Tanggal*.
  3. Grafik Tren Omzet & Laba 14 Hari: Diagram batang komparatif antara omzet harian dan margin laba bersih.
  4. Widget Komposisi Pembayaran: Proporsi QRIS (`Rp 2.635.000` / 62%) vs Tunai (`Rp 1.615.000` / 38%).
  5. Widget Menu Terlaris: Peringkat masakan terfavorit lengkap dengan kontribusi labanya.

### Layar 6: Manajemen Master Data Menu & Kalkulasi Margin
- **Komponen Utama**:
  1. Tabel Menu: Kolom Menu, Kategori, HPP, Harga Jual, Margin (Nominal & Persen warna hijau), Status Tersedia, Aksi Edit/Hapus.
  2. Modal Tambah / Edit Menu:
     - Input Nama Menu, Kategori, Deskripsi, Upload Foto.
     - Input HPP (Modal) dan Harga Jual.
     - **Kotak Margin Cerdas (Real-Time)**: Otomatis menghitung dan menampilkan *"Margin otomatis (Harga Jual - HPP): Rp 8.000 - 67%"*.
     - Toggle: "Tampilkan di katalog pelanggan" dan "Tersedia".

### Layar 7: Audit Laporan Transaksi Historis
- **Komponen Utama**:
  1. Kartu Rekapitulasi: Total Omzet Terpilih, Total HPP Terpilih, Total Laba Bersih Terpilih, Jumlah Pesanan.
  2. Tabel Audit Snapshot: Menampilkan baris transaksi historis di mana nilai HPP dan laba bersih terkunci permanen sesuai kondisi saat pesanan dibuat.
  3. Tombol Ekspor: Tombol *"Unduh Excel"* dan *"Cetak Laporan"*.

### Layar 8: Antarmuka Pemantauan Antrean Dapur (KDS)
- **Komponen Utama**:
  1. Header Gelap Minimalis: Menampilkan jumlah pesanan dimasak (misal: 2), pesanan selesai (misal: 27), dan indikator siaran WebSockets *"Live - update otomatis"*.
  2. Kisi Tiket Besar: Kartu pesanan ukuran besar untuk meja A-024 dan A-023 yang berstatus lunas.
  3. Slot Kosong: Kotak abu-abu berlabel *"Kosong"* untuk menandai kapasitas antrean yang belum terisi.
  4. Aksi Koki: Tombol perubahan progres masakan instan.

### Layar 9: Pemantauan Target Penjualan & Proyeksi Finansial
- **Komponen Utama**:
  1. Kartu Target: Target Omzet Bulanan (`Rp 45.000.000`), Realisasi Omzet (`Rp 15.180.000`), Sisa Target (`Rp 29.820.000`), dan **Kebutuhan Omzet Harian** (`Rp 1.569.000 / hari`).
  2. Grafik Kumulatif vs Target: Kurva garis akumulasi pendapatan dibandingkan garis linear target.
  3. Tabel Pencapaian Harian & Target Mingguan: Rincian persentase target minggu 1 hingga minggu 4.

---

## 6. Gaya Visualisasi Grafik Data (Recharts Styling)

Visualisasi grafik menggunakan pustaka **Recharts** dengan tema visual terstandardisasi:

```javascript
// Konfigurasi Warna Grafik Recharts
export const chartColors = {
  theatre: {
    revenueBar: '#CC9E4A',      // Opulent Gold (Batang Omzet)
    profitLine: '#0A1D4B',      // Regal Navy (Garis Laba Bersih)
    targetLine: '#9E0E18',      // Deep Crimson (Garis Target Proyeksi)
    gridLines: '#E8DACF',
    tooltipBg: '#171721',
    tooltipText: '#FFFFFF',
  },
  ocean: {
    revenueBar: '#566680',      // Dana (Batang Omzet)
    profitLine: '#10161A',      // Black Is Back (Garis Laba Bersih)
    targetLine: '#DC2626',      // Red (Garis Target Proyeksi)
    gridLines: '#B4C0D5',
    tooltipBg: '#10161A',
    tooltipText: '#FFFFFF',
  }
};
```

**Aturan Formatting Grafik**:
- Sumbu Y wajib diformat singkat dalam Rupiah: `Rp 1jt`, `Rp 2,5jt`, `Rp 5jt`.
- Tooltip wajib menampilkan nominal Rupiah lengkap berpemisah titik: `Rp 4.250.000`.
- Sudut batang grafik membulat di bagian atas (`radius={[6, 6, 0, 0]}`).

---

## 7. Pola Interaksi & Standar Mikro (Micro-Interactions)

1. **Animasi Pembaruan Real-Time**:
   Saat tiket pesanan baru tiba melalui WebSockets Reverb, kartu pesanan muncul dengan transisi halus *fade-in slide-down* durasi 300ms (`transition-all duration-300 ease-out`), disertai sorotan kilau emas halus selama 1 detik agar staf segera menyadari pesanan baru tanpa suara dengung yang mengganggu.
2. **Konfirmasi Aksi Destruktif**:
   Aksi pembatalan pesanan, penghapusan menu, atau penutupan paksa sesi meja yang belum selesai menyajikan masakan wajib memunculkan modal dialog konfirmasi eksplisit dengan tombol merah *"Ya, Batalkan"* dan *"Batal"*.
3. **Format Angka & Waktu Baku (Bahasa Indonesia)**:
   - Mata Uang: `Rp 63.800` (menggunakan spasi setelah Rp, pemisah ribuan titik, tanpa desimal `,00`).
   - Tanggal & Jam: `"Sabtu, 8 Nov 2026, 12:42 WIB"`.
   - Durasi Relatif: `"2 menit yang lalu"`, `"Baru saja"`.
4. **Nada Teks Antarmuka (Tone of Voice)**:
   Menggunakan Bahasa Indonesia yang sopan, ramah, percaya diri, dan jelas (misal: *"Pesanan Anda sedang disiapkan di dapur"*, *"Pembayaran berhasil divalidasi"*).

---

## 8. Standar Aksesibilitas (Accessibility & Ergonomics)

1. **Target Sentuh Minimum (Touch Targets)**:
   Seluruh tombol, ikon aksi, dan tombol penambah kuantitas `+/-` pada antarmuka gawai pelanggan memiliki area sentuh minimum **44 x 44 piksel** untuk kenyamanan navigasi satu tangan.
2. **Keterbacaan Monitor Dapur Jarak Jauh**:
   Layar KDS menggunakan kontras tinggi dengan ukuran font nomor meja minimal `24px (bold)`, nomor antrean `32px (bold)`, dan nama masakan minimal `18px (medium)` agar dapat dibaca jelas oleh juru masak dari jarak 2 hingga 3 meter.
3. **Fokus Visual Keyboard**:
   Seluruh elemen kontrol interaktif wajib memiliki cincin fokus yang tegas (`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2`) guna mendukung staf kasir yang menggunakan navigasi keyboard atau barcode scanner.
4. **Pembaca Layar (ARIA Labels)**:
   Setiap tombol aksi yang hanya berupa ikon (seperti tombol cetak struk atau tombol close modal) wajib dilengkapi atribut `aria-label` deskriptif (misal: `aria-label="Cetak ulang struk transaksi"`).

---

## 9. Inventaris Aset & Ikonografi (Asset Inventory)

1. **Pustaka Ikon**: **`lucide-react`** (digunakan secara konsisten di seluruh antarmuka):
   - Navigasi: `LayoutDashboard`, `UtensilsCrossed`, `ReceiptText`, `Settings`, `Users`, `TrendingUp`, `Clock`, `Grid`.
   - Aksi: `Plus`, `Minus`, `Trash2`, `Edit3`, `Printer`, `QrCode`, `Search`, `CheckCircle2`, `XCircle`, `AlertTriangle`.
2. **Logo & Wordmark**:
   - Vektor SVG `MICRODINE` dengan ikon mangkuk/meja minimalis dan tipografi geometris modern.
3. **Ilustrasi Keadaan Kosong (Empty States)**:
   - Gambar vektor minimalis yang ramah saat tidak ada pesanan di antrean Kanban, keranjang belanja kosong, atau tabel hasil pencarian tidak ditemukan.

---

## 10. Checklist Kesesuaian Mockup (Mockup Compliance Checklist)

- [x] **Layar 1 (Pelanggan)**: Kartu info meja navy di header, katalog filter kategori, bottom bar emas, checkout pilihan QRIS/Tunai, pelacak 3 tahap dengan QRIS countdown.
- [x] **Layar 2 (Login)**: Background foto restoran dengan dark overlay, tab switch Kasir/Admin, tombol login lebar.
- [x] **Layar 3 (Kanban Kasir)**: Kartu ringkasan 4 kolom metrik, Kanban 3 kolom (Menunggu Bayar, Diproses, Selesai), modal kalkulator tunai otomatis hitung kembalian.
- [x] **Layar 4 (Meja & Histori)**: Grid meja kartu hijau/merah dengan waktu duduk, histori pesanan dengan filter tanggal & metode, drawer audit riwayat status di sisi kanan.
- [x] **Layar 5 (Admin Dashboard)**: Ringkasan Omzet/HPP/Laba/Transaksi, grafik tren 14 hari, perbandingan QRIS vs Tunai, menu terlaris.
- [x] **Layar 6 (Master Menu)**: Tabel menu lengkap dengan margin nominal & persen, modal tambah menu dengan kalkulator margin laba otomatis, toggle tayang di katalog.
- [x] **Layar 7 (Audit Laporan)**: Snapshot HPP permanen, kartu rekapitulasi, tombol unduh Excel dan cetak laporan.
- [x] **Layar 8 (KDS Dapur)**: Tampilan kartu tiket besar, label "Live - update otomatis", slot bergaris putus-putus "Kosong", tombol toggle selesai.
- [x] **Layar 9 (Target Penjualan)**: Target bulanan, realisasi, sisa target, kebutuhan omzet harian, grafik kumulatif vs target mingguan.
- [x] **Uji Kontras WCAG AA**: Seluruh teks di atas emas diatur Velvet Obsidian (7.2:1), emas dilarang sebagai warna teks di atas kanvas ivory, dan warna status merah/hijau/amber terstandardisasi.
