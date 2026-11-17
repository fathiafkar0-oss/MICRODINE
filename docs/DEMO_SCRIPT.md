# Skrip Demo MICRODINE — 5 Menit untuk Dewan Juri

> **T-055** — Panduan skenario demonstrasi langsung (*live demo*) agar seluruh tim bisa membawakan
> alur yang sama persis saat presentasi, dalam waktu **4–5 menit**.
>
> Alur ini membuktikan empat keunggulan diferensiasi produk (lihat PRD.md Bab 8):
> **Scan QR → Pay-First → Real-time KDS → Snapshot Laba (HPP).**

---

## 0. Persiapan sebelum naik ke depan juri (lakukan di belakang panggung)

Checklist 2 menit sebelum sesi dimulai:

- [ ] `php artisan migrate:fresh --seed` sudah dijalankan sehingga data demo (menu, meja, akun staf,
      target penjualan 14 hari) dalam kondisi bersih — lihat `database/seeders/DemoTransactionSeeder.php`.
- [ ] `composer run dev` berjalan (menyalakan `serve` + `queue:listen` + `reverb` + `vite` sekaligus).
      Pastikan baris `[reverb]` muncul di output, bukan hanya `[server]`/`[vite]`.
- [ ] `BROADCAST_CONNECTION=reverb` di `.env` (bukan `log`) — kalau masih `log`, layar dapur **tidak**
      akan ter-update otomatis saat demo.
- [ ] Dua tab/jendela browser sudah terbuka bersebelahan, **tanpa harus login ulang saat demo**:
  1. **Tab Pelanggan** — mode HP/incognito, siap diarahkan ke `/meja/07` (anggap ini hasil scan QR).
  2. **Tab Dapur** — sudah login sebagai `dapur` (password `password`) dan berada di `/dapur`
     (ditampilkan di layar kedua / TV, mensimulasikan Kitchen Display System sungguhan).
- [ ] (Opsional, kalau laptop cadangan ada) Tab ketiga login sebagai `kasir` di `/kasir` untuk
      menunjukkan papan Kanban ikut bergerak live di sisi kasir, tidak hanya dapur.
- [ ] Koneksi internet lokasi lomba sering tidak stabil — **tidak masalah**. Mode simulasi QRIS
      (langkah 3 di bawah) berjalan 100% lokal, tanpa memanggil Midtrans sungguhan.

---

## 1. Pembukaan singkat (30 detik)

> "MICRODINE menyelesaikan 3 masalah UMKM kuliner: pesanan palsu/kabur tanpa bayar, dapur dan kasir
> yang tidak sinkron, dan laporan laba yang meleset karena margin bahan baku naik-turun. Caranya:
> **bayar dulu, baru masuk dapur** — dan semuanya real-time tanpa refresh manual."

---

## 2. Pelanggan scan QR → pesan (60 detik)

Di **Tab Pelanggan**:

1. Buka `/meja/07` — tunjukkan ini persis halaman yang muncul setelah pelanggan memindai QR fisik
   di atas meja (tidak ada halaman landing/promosi di antaranya — langsung ke menu meja tersebut).
2. Tambahkan 2–3 item ke keranjang (`+` pada kartu menu), lalu buka **Keranjang**
   (`/meja/07/keranjang`) — tunjukkan catatan per item (mis. "tidak pedas").
3. Lanjut **Checkout** (`/meja/07/checkout`) — isi nama pemesan, pilih metode **QRIS**, kirim.
4. Pelanggan otomatis diarahkan ke halaman pembayaran (`/pesanan/{kode}/bayar`) dengan kode unik
   pesanan dan hitung mundur batas waktu bayar.

> **Poin penting ke juri**: "Pesanan ini **belum masuk ke dapur**. Statusnya masih
> `menunggu_bayar` — dapur baru melihatnya setelah pembayaran tervalidasi. Ini mencegah pesanan
> palsu atau pelanggan yang kabur tanpa bayar."

---

## 3. Pay-First tervalidasi → langsung ke dapur, tanpa refresh (90 detik — bagian paling penting)

Di **Tab Pelanggan**, pada halaman pembayaran QRIS, klik tombol demo:

> **"Mode demo: simulasikan pembayaran berhasil"**

(Tombol ini memanggil endpoint `POST /api/v1/payments/simulate/{kode}` yang menjalankan validasi
pembayaran *persis* seperti webhook Midtrans sungguhan — hanya jalurnya lokal, dibuat khusus agar
demo tidak bergantung pada koneksi internet venue. Lihat `T-054`/ARCHITECTURE.md Bab 8.2.)

**Langsung alihkan pandangan juri ke Tab/layar Dapur** — tanpa menyentuh apa pun di sana:

- Tiket pesanan baru **muncul otomatis** di layar dapur dalam hitungan detik, **tanpa reload
  halaman sama sekali**.
- (Jika tab Kasir juga dibuka) papan Kanban kasir ikut berpindah kolom secara bersamaan.

> **Poin penting ke juri**: "Ini bukan polling atau auto-refresh berkala — ini **WebSocket
> (Laravel Reverb)**. Begitu status pembayaran berubah di server, event disiarkan langsung ke
> layar dapur dan kasir. Tidak ada yang perlu menekan tombol refresh — cocok dipasang permanen di
> TV dapur."

Di **Tab Dapur**, klik **"Tandai Selesai"** pada tiket tersebut.

- Tunjukkan tiket itu **hilang dari layar dapur** dan (jika tab kasir terbuka) kartu pesanan di
  kasir **berpindah kolom ke "Selesai"** — juga otomatis, juga tanpa refresh.

---

## 4. Snapshot HPP & laba yang tidak pernah berubah (60 detik)

Login sebagai **Admin** (`admin` / `password`) di tab baru, lalu:

1. Buka `/admin/menu` — pilih satu item menu yang baru saja dipesan, **naikkan HPP-nya** sedikit
   (mis. harga bahan baku naik), simpan.
2. Buka `/admin/laporan` — tunjukkan transaksi yang baru saja terjadi: laba (margin) yang tercatat
   **tetap memakai HPP lama**, bukan HPP baru yang baru diubah.

> **Poin penting ke juri**: "Setiap transaksi menyimpan *snapshot* harga jual dan HPP tepat saat
> pesanan dibuat (`order_items.unit_price`, `unit_hpp`). Kalau besok harga bahan baku naik lagi,
> laporan laba bulan lalu **tidak ikut berubah** — ini yang membuat laporan laba UMKM akurat,
> beda dari pembukuan manual yang sering salah hitung margin retroaktif."

---

## 5. Penutup (30 detik)

> "Jadi dalam satu alur: pelanggan scan QR dan bayar duluan, dapur & kasir tersinkron real-time
> tanpa refresh, dan setiap transaksi punya jejak HPP historis untuk laporan laba yang akurat.
> Semua ini jalan walau koneksi internet venue tidak stabil, karena mode simulasi pembayaran
> berjalan lokal — dan di produksi nanti, cukup ganti ke kredensial Midtrans sungguhan tanpa
> mengubah satu baris kode alur bisnisnya."

---

## Jalur cadangan kalau ada kendala teknis saat demo

| Kendala | Solusi cepat |
|---|---|
| Reverb tidak menyala (`BROADCAST_CONNECTION=log`) | Tunjukkan alur tetap lengkap, lalu klik tombol reload manual di pojok kanan atas Kasir/Meja — sampaikan ke juri bahwa versi produksi memakai WebSocket (tunjukkan kode `useLiveReload` di editor sebagai bukti). |
| Laptop demo tidak ada koneksi internet sama sekali | Tombol simulasi pembayaran (langkah 3) tidak butuh internet eksternal sama sekali — tetap jalan normal. |
| Data demo sudah "kotor" dari gladi resik sebelumnya | Jalankan `php artisan migrate:fresh --seed` sebelum naik ke depan juri (lihat checklist §0). |
| Layar dapur/kasir tidak ditampilkan di layar kedua | Minimal tunjukkan di dua tab browser bersebelahan pada satu layar — yang penting juri melihat kedua sisi berubah bersamaan. |

---

## Referensi

- Alur bisnis & aturan invarian: `AGENTS.md` Bab 5, `PRD.md` Bab 8.
- Arsitektur real-time: `ARCHITECTURE.md` Bab 6 & Bab 8.2.
- Akun demo bawaan (`database/seeders/StaffSeeder.php`, password selalu `password`):
  `admin`, `kasir`, `dapur`.
