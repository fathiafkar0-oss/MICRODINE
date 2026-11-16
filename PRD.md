# Product Requirement Document (PRD) — MICRODINE

> **Inovasi Platform Manajemen Restoran Terpadu untuk Mendorong Kemandirian Digital Bisnis Mikro Indonesia**  
> **Versi Dokumen**: 1.0 (Final Draft)  
> **Status**: Disetujui untuk Implementasi  
> **Sumber Kebenaran**: `docs/proposal.pdf` (Proposal Tim SKS, Universitas Syiah Kuala 2026), `docs/mockups/` (9 Layar Prototipe UI), `AGENTS.md`

---

## 1. Tujuan & Latar Belakang Masalah

### 1.1 Latar Belakang
Sektor penyediaan makanan dan minuman (F&B) skala mikro di Indonesia mencakup lebih dari 5,28 juta unit usaha. Mayoritas pelaku usaha masih mengandalkan pencatatan manual atau sistem terpisah yang rentan terhadap kesalahan manusia (*human error*), kebocoran pendapatan, dan ketidakakuratan pelaporan finansial. Seiring dengan pertumbuhan transaksi QRIS yang melonjak lebih dari 175% secara tahunan, digitalisasi operasional restoran mikro menjadi kebutuhan mendesak untuk menjaga daya saing dan keberlanjutan bisnis.

### 1.2 Masalah Kritis yang Diselesaikan (Proposal Bab 1.2)
1. **Ketidakakuratan Perhitungan Laba akibat Fluktuasi HPP**:
   Pencatatan manual umumnya hanya merekam omzet tanpa mendokumentasikan Harga Pokok Penjualan (HPP) pada saat transaksi terjadi. Akibatnya, ketika harga jual atau HPP menu diubah di masa depan, laporan laba masa lalu ikut berubah secara retroaktif.  
   *Solusi*: Penerapan **Snapshot HPP & Harga Jual Historis** secara permanen pada setiap baris transaksi (`order_items`).
2. **Risiko Tumpang Tindih Pesanan & Blind-Spot Ketersediaan Meja**:
   Pelayan dan kasir sering mengalami keterlambatan informasi mengenai kondisi fisik meja, yang memicu pemesanan ganda (*double-booking*) atau pesanan meja tertukar.  
   *Solusi*: Integrasi meja fisik berbasis token unik QR Code meja dan barcode scanner kasir, di mana **1 Meja Fisik = 1 Sesi Aktif**.
3. **Ambiguitas Status Pembayaran pada Laporan Keuangan**:
   Pencatatan manual sering menggabungkan pesanan yang belum dibayar (*pending*), batal, atau gagal ke dalam rekapitulasi penjualan, menciptakan omzet semu.  
   *Solusi*: Penerapan sistem pembayaran di awal (**Pay-First Enforcement**), di mana pesanan HANYA diteruskan ke dapur dan dimasukkan ke dalam perhitungan omzet/laba jika status pembayaran telah tervalidasi `paid` (Lunas).

---

## 2. Persona & Hak Akses (Role-Based Access Control)

Platform ini melayani 4 persona pengguna dengan batas wewenang yang tegas:

| Peran (Role) | Identifikasi / Autentikasi | Tanggung Jawab Utama | Rute Utama yang Diizinkan |
| :--- | :--- | :--- | :--- |
| **Pelanggan (`pelanggan`)** | Tanpa akun; terautentikasi melalui parameter/token QR meja fisik | Memindai QR meja, memesan menu secara mandiri (*self-ordering*), membayar via QRIS/Tunai, melacak status masakan | `/meja/{table}`, `/meja/{table}/keranjang`, `/meja/{table}/checkout`, `/pesanan/{code}`, `/pesanan/{code}/bayar` |
| **Kasir (`kasir`)** | Kredensial staf (username & password) via Portal Karyawan | Memvalidasi pembayaran tunai, mengoperasikan antrean Kanban, memproses pesanan manual via barcode meja, memantau meja, menutup sesi meja, mencetak struk | `/staf/masuk`, `/kasir`, `/kasir/pesanan`, `/kasir/meja`, `/kasir/histori` |
| **Dapur (`dapur`)** | Staf dapur (akses tampilan Kitchen Display System) | Memantau tiket pesanan lunas secara *real-time*, memperbarui progres masakan (*Cooking → Done*) | `/dapur` |
| **Admin (`admin`)** | Kredensial pemilik/manajer via Portal Karyawan | Mengelola master menu & HPP, menganalisis dashboard keuangan, audit laporan historis, mengatur pajak daerah, kelola akun staf | `/staf/masuk`, `/admin`, `/admin/menu`, `/admin/laporan`, `/admin/target`, `/admin/pengaturan` |

---

## 3. Cakupan Proyek (Project Scope)

> **Status Implementasi**: Seluruh antarmuka pengguna frontend (9 layar lengkap, komponen UI, mock data, dan Tailwind v4 `@theme`) telah selesai diimplementasikan pada repositori. Pengembangan aktif saat ini difokuskan pada pengikatan (*wiring*) ke backend Laravel monolitik: skema database PostgreSQL riil, service & action domain, otentikasi riil, integrasi QRIS Midtrans, dan WebSockets Laravel Reverb.

### 3.1 Cakupan Inti (MVP - Minimum Viable Product)
Fokus mutlak pada penyelesaian alur bisnis utama (*core workflow*) dari awal hingga akhir (*end-to-end*):
1. **Dine-in QR Self-Ordering**: Pindai QR meja langsung mengunci nomor meja tanpa pilih meja manual.
2. **Katalog Digital & Keranjang**: Pilihan menu, kuantitas, catatan khusus, dan kalkulasi subtotal + pajak daerah (PBJT/PB1).
3. **Pay-First Enforcement**: Pilihan pembayaran QRIS (otomatis sandbox) atau Tunai di Kasir.
4. **Sinkronisasi Real-Time (Laravel Reverb WebSockets)**: Tiket pesanan lunas seketika muncul di layar Dapur dan Kanban Kasir tanpa *refresh*.
5. **Kitchen Display System (KDS)**: Kartu tiket pesanan besar dengan kontrol progres memasak.
6. **Kanban Kasir & Validasi Tunai**: Kolom antrean pesanan, kalkulator kembalian otomatis, dan pelacakan sesi meja.
7. **Perekaman Data Finansial Presisi**: Perekaman snapshot HPP dan harga saat transaksi dibuat, serta dashboard laporan laba/rugi admin.

### 3.2 Cakupan Ekstensi (MVP+ / Fase Penyempurnaan)
Fitur pendukung operasional yang terdapat pada prototipe UI (mockup):
1. **Pemantauan Target Penjualan**: Penetapan target bulanan, grafik kumulatif, dan rekomendasi pendapatan harian.
2. **Pengaturan Restoran & Meja**: Konfigurasi identitas restoran, toggle/persentase tarif pajak PBJT/PB1, serta cetak stiker QR meja.
3. **Manajemen Akun Kasir**: CRUD akun staf kasir dengan manajemen hak akses aman.

### 3.3 Di Luar Cakupan (Out-of-Scope)
Fitur-fitur berikut secara eksplisit **tidak dikembangkan** dalam rilis ini:
- Manajemen stok/inventaris bahan baku riil (pengurangan gramatur/komoditas).
- Komposisi resep dinamis per menu.
- Multi-cabang (*multi-outlet / franchise*).
- Pemesanan reservasi meja di masa mendatang (*advance booking*).
- Program loyalitas, membership, poin, atau voucher diskon.
- Pesanan pesan antar (*delivery / ride-hailing integration*).

---

## 4. Kebutuhan Fungsional (Functional Requirements)

### 4.1 Modul Pelanggan (Customer Mobile-First)

#### [FR-01] Inisiasi Sesi Meja via Scan QR Code Fisik
- **User Story**: Sebagai pelanggan, saya ingin memindai QR code di meja agar langsung diarahkan ke katalog menu meja saya tanpa perlu mendaftar akun atau memilih nomor meja secara manual.
- **Acceptance Criteria**:
  - *Given* pelanggan memindai QR code fisik yang memuat token valid meja (misal: Meja 07),  
    *When* halaman dimuat di peramban gawai,  
    *Then* sistem otomatis mengunci nomor meja 07, memeriksa sesi meja, dan menampilkan katalog menu.
  - *Given* meja telah memiliki sesi aktif dari pemesan sebelumnya,  
    *When* pelanggan berikutnya di meja tersebut memindai QR code yang sama,  
    *Then* sistem otomatis menggabungkan pelanggan ke sesi aktif yang sama tanpa membuat sesi ganda (*session duplication*).
  - *Given* token QR tidak valid atau kedaluwarsa,  
    *When* diakses,  
    *Then* sistem menampilkan pesan kesalahan informatif bahwa meja tidak terdaftar.

#### [FR-02] Katalog Menu & Filter Kategori
- **User Story**: Sebagai pelanggan, saya ingin menelusuri katalog menu berdasarkan kategori dan pencarian kata kunci agar mudah menemukan makanan/minuman yang diinginkan.
- **Acceptance Criteria**:
  - *Given* katalog terbuka,  
    *When* pelanggan memilih tab filter (*Semua, Makanan, Minuman, Camilan*) atau mengetik di bilah pencarian,  
    *Then* daftar produk disaring secara instan tanpa memuat ulang halaman.
  - *Given* produk yang berstatus *Kosong / Tidak Tersedia*,  
    *When* ditampilkan di katalog,  
    *Then* kartu produk menampilkan lencana "Habis" dan tombol tambah dinonaktifkan.

#### [FR-03] Keranjang Pesanan & Catatan Khusus
- **User Story**: Sebagai pelanggan, saya ingin mengatur jumlah porsi dan menambahkan catatan khusus (misal: "tanpa bawang, pedas sedang") pada setiap menu.
- **Acceptance Criteria**:
  - *Given* menu di katalog,  
    *When* pelanggan menekan tombol `+` atau `-`,  
    *Then* kuantitas pesanan diperbarui dan bilah bawah (*bottom bar*) menampilkan akumulasi jumlah item serta total harga sementara secara dinamis.
  - *Given* modal catatan per item dibuka,  
    *When* pelanggan mengetik catatan khusus dan menyimpan,  
    *Then* catatan tersebut tersimpan dan terikat pada item menu terkait di keranjang.
  - *Given* halaman keranjang pesanan,  
    *When* ditinjau,  
    *Then* sistem merinci subtotal pesanan, nilai pajak daerah PBJT/PB1 (jika diaktifkan oleh admin), dan total tagihan akhir dalam bilangan bulat rupiah.

#### [FR-04] Checkout & Pemilihan Metode Pembayaran (Pay-First)
- **User Story**: Sebagai pelanggan, saya ingin memasukkan nama pemesan dan memilih metode pembayaran (QRIS atau Tunai di Kasir) untuk memproses pesanan saya.
- **Acceptance Criteria**:
  - *Given* pelanggan berada di halaman pembayaran,  
    *When* mengisi nama pemesan dan memilih metode **QRIS**, lalu menekan "Konfirmasi Pesanan",  
    *Then* sistem membuat pesanan baru dengan status `payment_status = 'pending'`, membuat invoice QRIS dinamis, dan mengarahkan ke halaman pelacak dengan kode QRIS dan waktu mundur (*countdown*).
  - *Given* pelanggan memilih metode **Tunai di Kasir**,  
    *When* menekan "Konfirmasi Pesanan",  
    *Then* sistem membuat pesanan baru dengan status `payment_status = 'pending'`, menampilkan instruksi pelunasan di kasir, dan mengirimkan tiket pesanan ke kolom "Menunggu Pembayaran" pada papan Kanban kasir.

#### [FR-05] Pelacakan Status Pesanan Real-Time
- **User Story**: Sebagai pelanggan, saya ingin memantau status pesanan saya secara langsung dari layar ponsel pintar saya tanpa perlu me-refresh halaman.
- **Acceptance Criteria**:
  - *Given* pelanggan berada di layar status pesanan,  
    *When* pembayaran QRIS berhasil divalidasi oleh payment gateway atau kasir mengonfirmasi penerimaan uang tunai,  
    *Then* badge status seketika berpindah dari *Menunggu Bayar* ke *Diproses* secara otomatis via WebSockets.
  - *Given* koki dapur menandai seluruh menu pesanan selesai dimasak,  
    *When* event broadcast diterima gawai pelanggan,  
    *Then* indikator visual berubah menjadi *Selesai (Siap Disajikan)*.
  - *Given* pesanan telah berstatus selesai,  
    *When* pelanggan menekan tombol "Pesan Menu Lagi",  
    *Then* sistem mengarahkan kembali ke katalog menu dengan nomor meja dan sesi aktif yang sama.

---

### 4.2 Modul Autentikasi Staf (Central Employee Portal)

#### [FR-06] Portal Login Terpusat & Kontrol Akses
- **User Story**: Sebagai staf restoran, saya ingin masuk ke sistem melalui portal login terpusat yang aman sesuai peran saya (Kasir atau Admin).
- **Acceptance Criteria**:
  - *Given* portal login di rute `/staf/masuk`,  
    *When* kasir memasukkan username dan password di tab **Kasir**,  
    *Then* sistem mengotentikasi dan mengarahkan pengguna ke halaman antrean pesanan kasir (`/kasir/pesanan`).
  - *Given* portal login di rute `/staf/masuk`,  
    *When* admin memasukkan username dan password di tab **Admin**,  
    *Then* sistem mengotentikasi dan mengarahkan pengguna ke dashboard eksekutif (`/admin`).
  - *Given* pengguna yang tidak terotentikasi mencoba mengakses rute internal staf,  
    *Then* sistem memblokir akses dan mengalihkan ke `/staf/masuk`.
  - *Given* percobaan login gagal berturut-turut melebihi batas (5 kali),  
    *Then* sistem menerapkan *rate-limiting (throttling)* selama 60 detik.

---

### 4.3 Modul Kasir (Point of Sales & Cashier Operations)

#### [FR-07] Antrean Pesanan Kanban & Kartu Ringkasan
- **User Story**: Sebagai kasir, saya ingin melihat antrean pesanan dalam bentuk papan Kanban yang terbagi menjadi kolom *Menunggu Pembayaran*, *Diproses*, dan *Selesai*.
- **Acceptance Criteria**:
  - *Given* papan Kanban kasir,  
    *When* pesanan tunai baru dibuat pelanggan,  
    *Then* kartu pesanan otomatis muncul di kolom *Menunggu Pembayaran* lengkap dengan nomor antrean (misal: A-024), nomor meja, daftar item, dan total nominal.
  - *Given* kartu ringkasan di bagian atas Kanban,  
    *Then* menampilkan angka metrik *Menunggu Bayar*, *Sedang Diproses*, *Selesai Hari Ini*, dan akumulasi *Omzet Hari Ini* (khusus transaksi lunas) secara *real-time*.
  - *Given* bilah pencarian di Kanban,  
    *When* kasir mengetik nomor meja atau kode pesanan,  
    *Then* kartu pesanan terfilter secara cepat.

#### [FR-08] Modal Kalkulator Pembayaran Tunai
- **User Story**: Sebagai kasir, saya ingin menggunakan modal kalkulator otomatis saat menerima uang tunai dari pelanggan agar perhitungan kembalian cepat dan bebas kesalahan hitung.
- **Acceptance Criteria**:
  - *Given* kartu pesanan di kolom *Menunggu Pembayaran*,  
    *When* kasir menekan tombol "Terima Tunai",  
    *Then* modal pop-up terbuka menampilkan rincian total tagihan dan kolom input uang yang diterima.
  - *Given* kasir memasukkan jumlah uang diterima,  
    *When* nominal uang dimasukkan,  
    *Then* sistem otomatis menghitung dan menampilkan nilai uang kembalian.
  - *Given* uang diterima valid (>= total tagihan),  
    *When* kasir menekan "Konfirmasi Pembayaran",  
    *Then* status pesanan berubah menjadi `paid`, kartu berpindah ke kolom *Diproses*, dan event WebSocket dipancarkan seketika ke layar KDS dapur di dalam *database transaction after-commit callback*.

#### [FR-09] Pemrosesan Pesanan Manual via Barcode Scanner Meja
- **User Story**: Sebagai kasir, saya ingin melayani pesanan pelanggan yang tidak menggunakan ponsel pintar dengan memindai barcode fisik nomor meja menggunakan hardware barcode scanner.
- **Acceptance Criteria**:
  - *Given* kasir membuka antarmuka pesanan manual,  
    *When* kasir memindai barcode meja fisik menggunakan barcode scanner (input keyboard emulation),  
    *Then* sistem mengenali nomor meja secara otomatis dan mengaitkan pesanan ke sesi meja tersebut tanpa input nomor meja manual.
  - *Given* kasir memilih menu pesanan manual dan mengonfirmasi pembayaran tunai,  
    *Then* pesanan langsung berstatus `paid` dan didistribusikan ke KDS dapur.

#### [FR-10] Visualisasi Grid Manajemen Meja & Penutupan Sesi
- **User Story**: Sebagai kasir, saya ingin melihat denah visual seluruh meja restoran dalam bentuk grid kartu agar mengetahui meja mana yang sedang terisi atau kosong.
- **Acceptance Criteria**:
  - *Given* halaman manajemen meja,  
    *When* meja memiliki sesi aktif,  
    *Then* kartu meja berlatar warna merah dengan label **"Terisi"**, menampilkan nama pemesan, nomor pesanan aktif, durasi waktu duduk, dan tombol "Lihat QR Meja".
  - *Given* meja tidak memiliki sesi aktif,  
    *Then* kartu meja berlatar warna hijau dengan label **"Tersedia"** dan kapasitas kursi.
  - *Given* meja berstatus "Terisi" dan seluruh pesanan meja tersebut telah disajikan/lunas,  
    *When* kasir menekan tombol "Tutup Sesi Meja",  
    *Then* sesi meja diubah menjadi `closed`, status meja kembali hijau "Tersedia", dan meja siap menerima pelanggan baru.

#### [FR-11] Histori Transaksi Harian & Cetak Ulang Struk
- **User Story**: Sebagai kasir, saya ingin melihat riwayat seluruh transaksi hari ini, memeriksa status webhook pembayaran, dan mencetak ulang struk fisik jika diminta pelanggan.
- **Acceptance Criteria**:
  - *Given* halaman histori pesanan,  
    *When* kasir menerapkan filter tanggal, metode (Semua, Tunai, QRIS), atau tab status (*Semua, Lunas, Menunggu Bayar, Dibatalkan, Gagal*),  
    *Then* tabel transaksi menyajikan data sesuai filter.
  - *Given* sebuah baris transaksi dipilih,  
    *When* diklik,  
    *Then* panel samping (drawer) terbuka menampilkan rincian audit pesanan, riwayat perubahan status waktu-demi-waktu, status validasi signature webhook gateway, dan rincian item.
  - *Given* panel detail terbuka,  
    *When* kasir menekan tombol "Cetak Ulang Struk",  
    *Then* sistem membuka dialog cetak struk resmi transaksi.

---

### 4.4 Modul Dapur (Kitchen Display System — KDS)

#### [FR-12] Layar Pemantauan Dapur Real-Time (KDS)
- **User Story**: Sebagai juru masak dapur, saya ingin melihat pesanan yang sudah lunas pada layar monitor berukuran besar secara otomatis tanpa menyentuh tombol refresh.
- **Acceptance Criteria**:
  - *Given* layar KDS dibuka di `/dapur`,  
    *When* ada pesanan baru berstatus `paid` (baik dari QRIS maupun tunai),  
    *Then* tiket pesanan baru seketika muncul mengisi slot grid dapur dengan animasi penanda dan indikator label "Live - update otomatis".
  - *Given* tiket pesanan di dapur,  
    *Then* kartu tiket menampilkan secara jelas nomor antrean, nomor meja, nama pelanggan, waktu masuk pesanan, rincian menu beserta jumlah porsi, dan catatan khusus masakan.
  - *Given* juru masak selesai memasak pesanan,  
    *When* tombol status ditekan untuk mengubah dari "Sedang Dimasak" menjadi "Selesai",  
    *Then* status pesanan di database diperbarui menjadi `done`, status di Kanban kasir dan layar pelanggan seketika tersinkronisasi via WebSockets, dan kartu pesanan terarsipkan dari antrean aktif KDS.
  - *Given* pesanan masih berstatus `pending` (belum lunas),  
    *Then* pesanan tersebut **strictly** tidak boleh tampil pada layar dapur.

---

### 4.5 Modul Administrator (Executive Dashboard & Master Data)

#### [FR-13] Dasbor Ringkasan Bisnis & Analitik Eksekutif
- **User Story**: Sebagai pemilik restoran (admin), saya ingin melihat rangkuman kinerja omzet, HPP, laba bersih, dan tren penjualan untuk membuat keputusan bisnis strategis.
- **Acceptance Criteria**:
  - *Given* dashboard admin dibuka,  
    *When* periode dipilih (*Hari ini, 7 hari, 30 hari, atau tanggal tertentu*),  
    *Then* kartu metrik menyajikan:
      - **Total Omzet**: Akumulasi total transaksi berstatus `paid`.
      - **Total HPP**: Akumulasi nilai snapshot `unit_hpp * quantity` dari transaksi `paid`.
      - **Laba Bersih**: Selisih pasti antara Total Omzet dan Total HPP.
      - **Transaksi Sukses**: Jumlah total transaksi berstatus `paid`.
  - *Given* grafik tren pendapatan dan laba 14 hari,  
    *Then* menyajikan visualisasi batang komparatif antara omzet dan laba per hari.
  - *Given* widget metode pembayaran dan menu terlaris,  
    *Then* menyajikan persentase proporsi transaksi QRIS vs Tunai serta daftar produk paling diminati.

#### [FR-14] Manajemen Master Menu, HPP Statis, & Kalkulator Margin
- **User Story**: Sebagai admin, saya ingin mengelola master menu makanan/minuman dengan HPP statis yang secara otomatis menghitung selisih laba kotor dan persentase margin secara seketika.
- **Acceptance Criteria**:
  - *Given* formulir tambah/edit menu dibuka,  
    *When* admin memasukkan nilai modal baku (**HPP**) dan **Harga Jual**,  
    *Then* sistem secara *real-time* menghitung dan menampilkan nominal margin keuntungan (Harga Jual - HPP) serta persentase margin laba.
  - *Given* daftar menu,  
    *When* admin mengubah tombol geser (*toggle*) "Tersedia" atau "Tampilkan di Katalog",  
    *Then* status ketersediaan menu di katalog pelanggan langsung diperbarui.
  - *Given* admin mengubah harga jual atau HPP suatu menu yang sudah pernah dipesan di masa lalu,  
    *Then* data transaksi lama **TIDAK BERUBAH SAMA SEKALI** karena transaksi lama menggunakan data snapshot pada `order_items`.

#### [FR-15] Audit Laporan Transaksi Historis & Ekspor Data
- **User Story**: Sebagai admin, saya ingin memeriksa buku besar riwayat transaksi dengan snapshot data HPP yang terkunci permanen serta mengekspornya ke format spreadsheet.
- **Acceptance Criteria**:
  - *Given* tabel Transaksi & Laporan dibuka,  
    *Then* setiap baris transaksi menampilkan nomor pesanan, waktu transaksi, metode bayar, status, total omzet, akumulasi snapshot HPP, dan nominal laba bersih yang dihasilkan saat transaksi dibuat.
  - *Given* admin menekan tombol "Unduh Excel",  
    *When* diklik,  
    *Then* sistem menghasilkan file spreadsheet (.xlsx / .csv) berisi seluruh data transaksi historis terfilter.
  - *Given* admin menekan tombol "Cetak Laporan",  
    *When* diklik,  
    *Then* sistem membuka lembar cetak laporan ringkasan berkala untuk arsip fisik.

#### [FR-16] Pengaturan Restoran & Pajak Daerah PBJT/PB1 (MVP+)
- **User Story**: Sebagai admin, saya ingin mengonfigurasi identitas restoran, mengaktifkan/menonaktifkan pajak daerah, serta mengelola daftar meja.
- **Acceptance Criteria**:
  - *Given* panel pengaturan pajak,  
    *When* admin mengaktifkan toggle pajak PBJT/PB1 dan menentukan tarif (default 10%),  
    *Then* seluruh kalkulasi pesanan baru di keranjang pelanggan otomatis menyertakan baris pajak sesuai persentase yang ditetapkan.
  - *Given* panel manajemen meja,  
    *When* admin menambah meja baru,  
    *Then* sistem membuat record meja fisik lengkap dengan token unik dan opsi unduh gambar QR Code siap cetak.

#### [FR-17] Manajemen Akun Staf Kasir (MVP+)
- **User Story**: Sebagai admin, saya ingin membuat dan mengelola akun staf kasir yang bertugas di restoran.
- **Acceptance Criteria**:
  - *Given* modul Akun Kasir,  
    *When* admin membuat akun baru dengan nama, username, dan password,  
    *Then* akun kasir aktif dan dapat digunakan untuk masuk melalui portal karyawan.
  - *Given* kasir berhenti bertugas,  
    *When* admin menonaktifkan akun tersebut,  
    *Then* sesi login kasir dicabut dan tidak dapat mengakses portal kasir.

#### [FR-18] Pemantauan Target Penjualan & Proyeksi Finansial (MVP+)
- **User Story**: Sebagai admin, saya ingin menetapkan target omzet bulanan dan melihat kalkulasi rekomendasi harian yang harus dicapai agar target tercapai.
- **Acceptance Criteria**:
  - *Given* admin memasukkan target omzet bulanan (misal: Rp 45.000.000),  
    *Then* sistem menghitung persentase realisasi omzet berjalan, sisa target nominal, dan membagi sisa target dengan sisa hari kalender bulan berjalan untuk menampilkan "Kebutuhan Omzet Harian".
  - *Given* grafik kumulatif vs target,  
    *Then* menyajikan garis proyeksi target mingguan dibandingkan kurva realisasi pendapatan aktual.

---

## 5. Aturan Bisnis & Mesin Status (State Machine)

### 5.1 Siklus Status Pembayaran (`payment_status`)
1. `pending`: Pesanan telah dikonfirmasi pemesan, menunggu scan/pembayaran QRIS atau pelunasan uang tunai di kasir.
2. `paid`: Pembayaran tervalidasi secara sah (webhook QRIS ber-signature valid atau konfirmasi kasir pada modal tunai).
3. `failed`: Transaksi digital ditolak oleh penerbit pembayaran / gateway.
4. `cancelled`: Pesanan dibatalkan oleh kasir sebelum pembayaran dilunasi.
5. `expired`: Waktu pembayaran QRIS habis tanpa adanya konfirmasi pelunasan (melebihi batas waktu 15 menit).

### 5.2 Siklus Status Antrean Dapur (`kitchen_status`)
1. `queued`: Pesanan telah berstatus `paid` dan masuk ke dalam antrean aktif monitor dapur.
2. `cooking`: Juru masak telah menekan tombol progres bahwa pesanan sedang dimasak.
3. `done`: Seluruh masakan pada tiket pesanan telah selesai disiapkan dan siap disajikan.
4. `served`: Makanan telah diantar ke meja pelanggan dan dikonfirmasi oleh pelayan/kasir.

### 5.3 Siklus Status Sesi Meja (`table_session_status`)
1. `active`: Sesi meja terbuka sejak pemindaian QR pertama atau pesanan manual pertama di meja tersebut. Semua pemindaian QR berikutnya pada meja yang sama otomatis terikat ke sesi ini.
2. `closed`: Kasir secara eksplisit menutup sesi meja setelah pelanggan selesai makan dan meninggalkan meja. Status visual meja kembali menjadi "Tersedia" (hijau).

### 5.4 Matriks Transisi Status & Pemicu (State Transition Matrix)

| Status Awal | Event / Pemicu (*Trigger*) | Aktor / Sumber | Status Akhir | Aksi Ikutan Sistem (*Side Effects*) |
| :--- | :--- | :--- | :--- | :--- |
| *None* | Scan QR / Buat Pesanan Baru | Pelanggan / Kasir | Payment: `pending` | Mengunci sesi meja (`active`), catat snapshot harga & HPP. |
| `pending` | Webhook QRIS valid / Kasir konfirmasi tunai | Payment Gateway / Kasir | Payment: `paid`<br>Kitchen: `queued` | **Broadcast WebSockets (DB::afterCommit)**; tiket muncul di KDS & Kanban Kasir. |
| `pending` | Countdown habis (15 menit) | Sistem (Scheduler / Worker) | Payment: `expired` | QR dinonaktifkan; opsi pemesanan ulang untuk pelanggan. |
| `pending` | Kasir klik "Batalkan Pesanan" | Kasir | Payment: `cancelled` | Pesanan dihapus dari Kanban Menunggu Bayar. |
| `queued` | Koki klik "Mulai Masak" | Dapur | Kitchen: `cooking` | Broadcast WebSockets; status di pelanggan & kasir: "Sedang Dimasak". |
| `cooking` | Koki klik "Tandai Selesai" | Dapur | Kitchen: `done` | Broadcast WebSockets; status di pelanggan: "Siap Disajikan". |
| `done` | Kasir klik "Tandai Diantar" | Kasir | Kitchen: `served` | Kartu pesanan di Kanban dipindahkan ke kolom "Selesai". |
| Sesi `active` | Kasir klik "Tutup Sesi Meja" | Kasir | Session: `closed` | Meja kembali hijau "Tersedia", token sesi diarsipkan. |

---

## 6. Kebutuhan Non-Fungsional (Non-Functional Requirements)

- **NFR-1 (Latensi Sinkronisasi Real-Time)**:
  Waktu perambatan data sejak status pembayaran menjadi `paid` hingga tiket pesanan muncul pada layar KDS Dapur dan Kanban Kasir harus di bawah **2,0 detik** pada koneksi jaringan standar, diorkestrasi via Laravel Reverb WebSockets.
- **NFR-2 (Mobile-First Responsiveness & Ergonomi Layar Sentuh)**:
  Antarmuka pelanggan harus dioptimalkan untuk layar ponsel pintar dengan lebar resolusi *viewport* 360px – 428px. Seluruh tombol interaktif utama harus memiliki area sentuh minimum **44 x 44 piksel** untuk kemudahan navigasi dengan satu tangan.
- **NFR-3 (Integritas Data Keuangan & Angka Moneter)**:
  Seluruh nilai moneter (harga jual, HPP, subtotal, pajak, total omzet) disimpan dan dihitung dalam **bilangan bulat Rupiah (integer / bigint)** untuk mencegah kesalahan pembulatan angka desimal. Seluruh operasi checkout dan validasi pembayaran dibungkus dalam *Database Transaction* dengan *row-level locking* (`lockForUpdate`).
- **NFR-4 (Keamanan & Ketahanan Sistem)**:
  - Seluruh rute publik pelanggan (scan QR, kirim pesanan) wajib dilindungi pembatasan laju (*rate limiting / throttling*, misal: 60 permintaan/menit per IP) untuk menangkal serangan DoS.
  - Webhook payment gateway wajib memverifikasi tanda tangan kriptografi (*SHA512 / HMAC signature*) dan menerapkan mekanisme idempotensi (*idempotency key*) guna mencegah pencatatan transaksi ganda.
  - Zero plain credentials: Kunci API dan kredensial basis data disimpan di `.env`, hanya `.env.example` yang masuk ke Git.
- **NFR-5 (Jejak Audit Forensik / Auditability)**:
  Setiap perubahan status pembayaran dan respons payload webhook payment gateway wajib dicatat secara lengkap pada tabel log audit untuk memudahkan investigasi diskrepansi transaksi.
- **NFR-6 (Ketahanan & Fallback Konektivitas)**:
  Jika koneksi WebSocket mengalami gangguan (*drop*), antarmuka front-end (React) secara otomatis menampilkan status *"Menghubungkan kembali..."* dan mengaktifkan *fallback long-polling* berkala setiap **5 detik** hingga koneksi WebSocket pulih.

---

## 7. Penanganan Kasus Tepi (Edge Cases & Exception Handling)

1. **Dua Pelanggan Memindai QR Meja yang Sama Secara Bersamaan**:
   - *Penanganan*: Sistem mendeteksi bahwa meja fisik tersebut telah memiliki sesi aktif (`table_session_status = 'active'`). Pelanggan kedua secara transparan digabungkan ke dalam sesi meja yang sama (*shared active session*). Pesanan dari pelanggan kedua akan membentuk tiket pesanan baru yang tetap terikat pada nomor meja dan sesi tersebut tanpa membatalkan pesanan pelanggan pertama.
2. **Masa Berlaku Pembayaran QRIS Habis (Expired)**:
   - *Penanganan*: Halaman pembayaran QRIS dilengkapi penghitung waktu mundur (*countdown timer*) 15 menit. Jika waktu habis tanpa ada webhook pelunasan dari gateway, status pesanan beralih ke `expired`. Tampilan antarmuka pelanggan memperbarui diri dan memunculkan tombol *"Pesan Ulang / Coba Lagi"* yang akan menerbitkan kode transaksi baru.
3. **Webhook Pembayaran Terlambat atau Tiba Berulang (Duplicate / Delayed Webhook)**:
   - *Penanganan*: Handler webhook memeriksa *idempotency* berbasis ID Transaksi Gateway. Jika webhook berstatus `paid` diterima untuk pesanan yang sudah berstatus `paid`, handler segera mengembalikan respons HTTP `200 OK` tanpa memicu event broadcast ulang. Jika webhook tiba terlambat setelah pelanggan menutup halaman, status di database tetap terupdate `paid` dan tiket tetap muncul di layar dapur/kasir.
4. **Kasir Membatalkan Pesanan Tunai yang Belum Dibayar**:
   - *Penanganan*: Pada kolom Kanban "Menunggu Pembayaran", kasir memiliki tombol opsi "Batalkan Pesanan". Jika pelanggan urung memesan, kasir menekan tombol ini. Sistem mengubah status pesanan menjadi `cancelled`. Transaksi dicatat pada histori kasir sebagai "Dibatalkan" dan secara ketat dikecualikan dari akumulasi omzet harian. Jika tidak ada pesanan lain di meja tersebut, kasir dapat menutup sesi meja.
5. **Perubahan Harga Menu di Master Data saat Pesanan Masih Menunggu Pembayaran**:
   - *Penanganan*: Nilai `unit_price` dan `unit_hpp` langsung dikunci (*snapshot*) pada baris tabel `order_items` pada detik pertama pesanan dibuat (`created_at`). Sekalipun admin mengubah harga menu di panel admin sedetik kemudian, pesanan yang sedang menunggu bayar tetap ditagihkan sesuai nominal saat pesanan dibuat.
6. **Koneksi Jaringan WebSocket Terputus di Dapur / Kasir**:
   - *Penanganan*: Listener Laravel Echo di sisi React memonitor *state* koneksi Reverb. Jika terdeteksi *disconnect*, sistem beralih ke mekanisme HTTP polling berkala setiap 5 detik ke rute sinkronisasi `/api/v1/sync` (atau Inertia reload partial) dan secara otomatis mencoba melakukan jabat tangan ulang (*re-handshake*) ke server WebSocket.
7. **Kasir Mencoba Menutup Sesi Meja saat Masih Ada Makanan yang Belum Selesai**:
   - *Penanganan*: Jika kasir menekan "Tutup Sesi Meja" pada meja yang masih memiliki pesanan dengan status `kitchen_status != 'served'`, modal dialog konfirmasi peringatan akan muncul: *"Peringatan: Masih terdapat X pesanan yang belum selesai dimasak/disajikan di meja ini. Tetap tutup sesi?"*. Kasir harus mengonfirmasi secara sadar atau menyelesaikan pesanan terlebih dahulu.
8. **Menu Dinonaktifkan oleh Admin saat Sedang Berada di Keranjang Pelanggan**:
   - *Penanganan*: Saat pelanggan menekan "Konfirmasi Pesanan" di kasir/checkout, sistem backend memvalidasi ketersediaan riil (`is_available = true`) di dalam transaksi database. Jika menu baru saja dinonaktifkan admin, proses checkout digagalkan dengan pesan kesalahan ramah: *"Mohon maaf, menu [Nama Menu] baru saja habis. Silakan sesuaikan pesanan di keranjang Anda."*.

---

## 8. Metrik Keberhasilan Produk (Success Metrics)

1. **Efisiensi Waktu Pelayanan (*Service Turnaround Time*)**:
   Waktu rata-rata sejak pelanggan selesai membayar hingga makanan disajikan ke meja berkurang hingga **< 15 menit**.
2. **Nol Persen Diskrepansi Keuangan (*Zero Revenue Discrepancy*)**:
   Tingkat akurasi laporan omzet dan kas masuk mencapai **100%**, karena sistem Pay-First mengeliminasi risiko pesanan belum bayar masuk ke dalam buku besar.
3. **Ketahanan Historis Laba Kotor (*HPP Historical Stability*)**:
   **100% konsistensi laba historis**, di mana simulasi perubahan harga jual atau kenaikan HPP bahan baku pada master menu di masa depan menghasilkan deviasi **0%** terhadap laporan laba rugi transaksi masa lalu.
4. **Eliminasi Pemesanan Meja Ganda (*Zero Double-Booking*)**:
   Tidak terjadi kasus tumpang tindih alokasi nomor meja antar pelanggan yang berbeda karena penguncian otomatis sesi meja tunggal.

---

## 9. Resolusi Inkonsistensi Dokumen Proposal & Pertanyaan Terbuka

### 9.1 Resolusi Inkonsistensi Dokumen Awal
- **Inkonsistensi Alur Meja**: Proposal Bab 1.3 menyebut pelanggan *"memilih meja"*, namun Bab 2.1 merinci alur QR meja otomatis.  
  *Keputusan PRD*: Alur meja **sepenuhnya otomatis** dari pemindaian QR token meja fisik. Tidak ada pemilihan nomor meja manual oleh pelanggan. Kasir adalah satu-satunya peran yang dapat memilih meja secara manual untuk pelanggan offline.
- **Inkonsistensi Tab Login Portal Karyawan**: Mockup UI hanya menyediakan tab untuk Kasir dan Admin, sementara peran Dapur tercantum dalam proposal.  
  *Keputusan PRD*: Mengadopsi **Opsi A**, di mana layar KDS Dapur (`/dapur`) dapat diluncurkan langsung dari tautan cepat di portal kasir yang diautentikasi atau menggunakan PIN/token dapur ringkas, sehingga perangkat monitor dapur tidak memerlukan login akun staf berkala.
- **Fitur Tambahan Mockup**: Target Penjualan, Pengaturan Restoran, dan Akun Kasir dikategorikan sebagai **MVP+**.
- **Klaim Human Error**: Pernyataan proposal *"dihilangkan sepenuhnya"* disesuaikan menjadi *"diminimalkan secara signifikan"*.

### 9.2 Keputusan Desain & Pertanyaan Terbuka untuk Pengembangan
1. **Payment Gateway Sandbox**: Menggunakan abstraksi `PaymentGatewayInterface` dengan implementasi default sandbox **Midtrans Snap / Core API (QRIS)**.
2. **Pencetakan Struk Kasir**: Rilis awal menggunakan perintah cetak standar peramban (`window.print()`) dengan template struk thermal 58mm/80mm yang bersih, dengan arsitektur yang siap dihubungkan ke driver ESC/POS thermal printer pada rilis berikutnya.
3. **Masa Berlaku Invoice QRIS**: Ditetapkan secara baku selama **15 menit** sebelum pesanan beralih menjadi `expired`.
