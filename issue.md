# Issue — Perencanaan Pengembangan Backend MICRODINE (High-Level)

> **Dokumen kerja untuk pelaksana backend** (junior developer / model ringan).
> Tujuan: membangun backend Laravel 13 yang menyambungkan frontend React/Inertia yang
> **sudah jadi** ke database PostgreSQL yang **sudah dirancang**, tanpa mengubah desain
> keduanya.
>
> Sifat dokumen: **high-level** — menjelaskan *apa* yang harus dibuat, *kontrak* yang harus
> dipenuhi, dan *urutan* pengerjaan. Detail implementasi (kode) ada di sumber kebenaran di bawah.

---

## 1. Aturan Emas (baca dulu, patuhi selalu)

1. **Jangan mengubah frontend** (`resources/js/**`, `resources/css/**`, `resources/views/**`).
   Frontend adalah kontrak. Backend menyesuaikan diri kepadanya.
2. **Jangan mengubah desain database.** Skema 11 tabel sudah final di ARCHITECTURE.md. Migration
   hanya mewujudkan desain itu, tidak menambah/mengurangi kolom seenaknya.
3. **Pay-first**: pesanan masuk antrean dapur **hanya** setelah `payment_status = paid`.
4. **Snapshot HPP & harga**: `order_items` menyimpan `unit_price_snapshot` & `unit_hpp_snapshot`
   pada saat pesanan dibuat; perubahan harga/HPP di masa depan tidak boleh mengubah transaksi lama.
5. **Uang = integer Rupiah** (`bigint`). Tidak pernah float/decimal.
6. **Satu meja = satu sesi aktif** (partial unique index PostgreSQL).
7. **Broadcast WebSocket setelah commit** (`DB::afterCommit()`), bukan sebelum.
8. **Webhook idempoten + verifikasi signature**.
9. **Laporan hanya menghitung transaksi `paid`**, dan omzet/laba **sebelum pajak**.
10. Zona waktu `Asia/Jakarta`; UI berbahasa Indonesia; kode/nama/komentar berbahasa Inggris.

---

## 2. Sumber Kebenaran (wajib dibaca sesuai urutan)

| Urutan | Dokumen | Untuk apa |
|---|---|---|
| 1 | `AGENTS.md` | 8 invarian bisnis + aturan repo/branch |
| 2 | `ARCHITECTURE.md` | Skema DB (Bab 3), state machine (Bab 4), sekuens (Bab 5), routing (Bab 7), gateway (Bab 8), seeder (Bab 11) |
| 3 | `API_CONTRACT.md` | Kontrak props tiap halaman (Bab 3), aksi mutasi (Bab 4), webhook (Bab 5), channel/event (Bab 6) |
| 4 | `PRD.md` | Edge case & state machine (Bab 5, 7) |
| 5 | `PLAN.md` | Pembagian task + acceptance criteria + traceability |
| 6 | `routes/web.php` | Daftar rute yang sudah terdaftar |
| 7 | `resources/js/Pages/**` | Komentar di atas tiap file = nama props yang diharapkan |
| 8 | `resources/js/Data/mock/**` | Bentuk data yang harus dikirim controller (fallback saat ini) |

---

## 3. Gambaran Besar

- **Monolit** Laravel + Inertia + React. Tidak ada REST API terpisah; halaman dirender lewat
  controller Inertia, mutasi via request Inertia, real-time via Laravel Reverb.
- **4 peran**: `pelanggan` (tanpa login, via token meja), `kasir`, `dapur`, `admin` (login username).
- **11 tabel**: `users`, `restaurant_settings`, `categories`, `menu_items`, `dining_tables`,
  `table_sessions`, `orders`, `order_items`, `payments`, `order_status_logs`, `sales_targets`.
- **Alur inti (vertical slice)**: scan QR meja → buat/sambung sesi → pilih menu → checkout →
  bayar (QRIS/tunai) → `paid` → masuk antrean dapur → koki update status → broadcast → kasir
  tutup sesi.

---

## 4. Keputusan Desain yang Sudah Ditetapkan (jangan ditawar lagi)

### 4.1 Pemetaan status: database (EN) → tampilan frontend (ID)

Frontend memakai **satu** kolom `status`, sedangkan database memakai **dua** dimensi
(`payment_status` + `kitchen_status`). Controller harus menurunkan satu nilai `status` dari
keduanya, lalu melabelinya ke Bahasa Indonesia.

| `status` (frontend) | `payment_status` (DB) | `kitchen_status` (DB) |
|---|---|---|
| `menunggu_bayar` | `pending` | — |
| `diproses` | `paid` | `queued` / `cooking` |
| `selesai` | `paid` | `done` |
| `diantar` | `paid` | `served` |
| `dibatalkan` | `cancelled` | — |
| `gagal` | `failed` | — |
| `kedaluwarsa` | `expired` | — |

> DB menyimpan nilai **Inggris** (`pending`, `paid`, …). Terjemahan ke label Indonesia dilakukan
> di satu tempat (serializer/helper), bukan tersebar di banyak file.

### 4.2 Pemetaan field lain

| Frontend | Database |
|---|---|
| `order.code` | `daily_queue_number` (format `A-024`) |
| `order.method: 'qris' \| 'tunai'` | `payment_method: 'qris' \| 'cash'` |
| `order.source: 'qr' \| 'kasir'` | `source: 'qr' \| 'manual'` |
| `menu.id` (`M-010`) | `menu_items.id` + prefiks tampilan `M-` |
| `restaurant.taxRate` (0.1) | `restaurant_settings.tax_rate_percent` / 100 |
| `restaurant.paymentDeadlineMinutes` | `restaurant_settings.qris_expires_minutes` |

### 4.3 Aturan finansial

- `subtotal` = Σ `qty * unit_price_snapshot`; `tax_amount` = subtotal × tarif (jika `tax_enabled`);
  `total` = subtotal + tax. Omzet & laba laporan = **hanya** transaksi `paid`, **sebelum** pajak.
- Laba per item = `subtotal_price − subtotal_hpp`.

---

## 5. Roadmap Eksekusi (12 modul, urut & bergantung)

Kerjakan berurutan. Setiap modul = satu atau beberapa branch task (lihat `PLAN.md`).

| # | Modul | Inti pekerjaan | Task PLAN |
|---|---|---|---|
| A | Fondasi skema data | Migration 11 tabel, enum, model, factory + seeder | T-006–T-011 |
| B | Auth & RBAC | Login staff (username), middleware role, redirect per peran | T-012, T-014 |
| C | Master menu admin | CRUD menu + HPP, kalkulator margin, toggle ketersediaan | T-015, T-018 |
| D | Meja & sesi | Token QR/barcode, service sesi meja (locking) | T-019, T-020 |
| E | Pemesanan pelanggan | Controller katalog, keranjang→checkout, tracker status | T-023–T-026 |
| F | Pay-first & snapshot | Gateway (interface + simulasi + Midtrans), webhook, tunai, snapshot | T-027–T-030, T-032 |
| G | Real-time | Event broadcast (Reverb/Echo) | T-033 |
| H | Kasir manual | Pesanan manual barcode, tutup sesi, batalkan | T-037–T-039 |
| I | Histori & struk | Histori harian + detail audit + re-print | (controller) |
| J | Laporan & admin+ | Agregasi laba rugi, laporan + ekspor, pajak, akun staf, target | T-043, T-045–T-048 |
| K | Testing & QA | Tes concurrency, idempotensi, snapshot, pay-first | T-049–T-051 |
| L | Demo & deploy | Simulasi pembayaran offline, deployment, dokumentasi | T-054–T-057 |

**Target pertama (MVP / critical path)** = A → B → C → D → E → F → G. Setelah itu aplikasi
sudah bisa dipakai end-to-end untuk demo.

---

## 6. Rincian per Modul (high-level)

> Format setiap modul: **Tujuan** → **Baca** → **Buat** → **Kontrak** → **Selesai bila**.

### A. Fondasi skema data
- **Tujuan**: 11 tabel PostgreSQL + enum + model + data demo 14 hari.
- **Baca**: ARCHITECTURE.md Bab 3.2 (spesifikasi tiap kolom), Bab 11.2 (seeder).
- **Buat**: migration (3 batch: users/settings/categories/menu; dining_tables/table_sessions;
  orders/order_items/payments/logs/targets), `app/Enums/*`, `app/Models/*`,
  `database/factories/*`, `DatabaseSeeder` (12 meja, 15 menu, akun staf, transaksi 14 hari).
- **Kontrak**: kolom uang `bigint`; `table_sessions` punya partial unique index
  `WHERE status='active'`; `orders` punya index pelaporan `(payment_status, paid_at)`.
- **Selesai bila**: `migrate:fresh --seed` sukses; unit test struktur tabel & relasi lolos.

### B. Auth & RBAC
- **Tujuan**: portal login terpusat, proteksi rute staf.
- **Baca**: ARCHITECTURE.md Bab 7; API_CONTRACT.md (login); PRD.md Bab 4.2.
- **Buat**: `AuthController` (login/logout, `username` bukan email), middleware
  `EnsureUserRole`, pembagian `auth.user` via `HandleInertiaRequests`.
- **Kontrak**: rute `/kasir`, `/dapur`, `/admin` dilindungi role; redirect sesuai peran;
  `/staf/masuk` menampilkan halaman login yang sudah ada.
- **Selesai bila**: login berhasil masuk sesuai role; rute salah role redirect; test auth lolos.

### C. Master menu admin
- **Tujuan**: CRUD menu + HPP + kalkulasi margin otomatis.
- **Baca**: API_CONTRACT.md ACT-08; halaman `Admin/Menus.jsx` (props `menus`, `categories`).
- **Buat**: `Admin/MenuController`, `StoreMenuRequest`/`UpdateMenuRequest`, service margin.
- **Kontrak**: `menus` dan `categories` dikirim dengan bentuk seperti `Data/mock/menus.js`;
  harga & HPP integer; soft delete menu.
- **Selesai bila**: CRUD + toggle `is_available`/`show_in_catalog` berfungsi; validasi FormRequest.

### D. Meja & sesi
- **Tujuan**: token QR/barcode unik per meja; resolusi sesi meja aman konkurensi.
- **Baca**: ARCHITECTURE.md Bab 5 (sekuens A, F); API_CONTRACT.md ACT-07.
- **Buat**: generator token (CSPRNG 32 char), `TableSessionService`
  (create-or-join dengan pessimistic lock), controller grid meja.
- **Kontrak**: `dining_tables.qr_token` & `barcode_code` unik; scan QR kedua kali di meja sama
  → **menempel ke sesi aktif**, bukan bikin sesi baru.
- **Selesai bila**: test locking (2 scan bersamaan → 1 sesi aktif).

### E. Pemesanan pelanggan
- **Tujuan**: katalog, keranjang, checkout, tracker.
- **Baca**: API_CONTRACT.md Bab 3.1; halaman `Customer/*` (props `table`, `session`,
  `categories`, `menus`, `restaurant`, `order`).
- **Buat**: `Customer/MenuController`, `CartController`, `CheckoutController`,
  `OrderStatusController` (thin, logika di service).
- **Kontrak**: props sesuai yang tertulis di komentar atas tiap file `Customer/*`.
  **Harga/HPP diambil ulang dari DB**, tidak percaya harga dari browser.
- **Selesai bila**: alur katalog→keranjang→checkout→status menampilkan data DB nyata.

### F. Pay-first & snapshot
- **Tujuan**: pembayaran QRIS & tunai, webhook, snapshot permanen.
- **Baca**: ARCHITECTURE.md Bab 8; API_CONTRACT.md ACT-01/03, Bab 5 (webhook); PRD Bab 5.
- **Buat**: `PaymentGatewayInterface` + `SimulatedPaymentGateway` + `MidtransPaymentGateway`,
  `PaymentService`, `PaymentWebhookController` (idempoten + signature), `CashPaymentAction`,
  snapshot saat `CreateOrderAction`.
- **Kontrak**: webhook hanya mengubah status via transaksi; `order_items` immutable setelah
  dibuat; `paid` baru boleh muncul di antrean dapur.
- **Selesai bila**: QRIS sandbox + simulasi + tunai bekerja; webhook idempoten.

### G. Real-time
- **Tujuan**: antrean kasir, KDS, dan tracker pelanggan update tanpa refresh.
- **Baca**: ARCHITECTURE.md Bab 6; API_CONTRACT.md Bab 6.
- **Buat**: event classes (`ShouldBroadcastNow`) + channel auth + listener di sisi frontend
  (jika ada penyesuaian kecil diperbolehkan hanya di titik integrasi, bukan desain ulang UI).
- **Kontrak**: broadcast **setelah** `DB::afterCommit()`; payload sesuai API_CONTRACT Bab 6.2.
- **Selesai bila**: pesanan dibayar → muncul di KDS & kanban kasir tanpa reload.

### H. Kasir manual, tutup sesi, batalkan
- **Tujuan**: pesanan manual via barcode meja; tutup sesi; batalkan pesanan belum bayar.
- **Baca**: ARCHITECTURE.md Bab 5 (C, D, F); API_CONTRACT.md ACT-02/06/07.
- **Buat**: `Cashier/OrderController` (manual order), `CloseTableSessionAction`,
  `CancelOrderAction`.
- **Kontrak**: pesanan `paid` **tidak boleh** dibatalkan tanpa otorisasi khusus; tutup sesi
  melepas `active` → `closed`.
- **Selesai bila**: alur manual & tutup sesi berfungsi + test pembatalan.

### I. Histori & struk
- **Tujuan**: histori harian kasir + detail audit + cetak ulang.
- **Baca**: API_CONTRACT.md Bab 3.2 (histori), halaman `Cashier/History.jsx`.
- **Buat**: controller histori dengan multi-filter (tanggal/status/method) + endpoint detail
  order (termasuk `order_status_logs`).
- **Kontrak**: props `orders` + `restaurant` sesuai bentuk mock `orders.js`.

### J. Laporan & admin+
- **Tujuan**: dasbor keuangan, laporan + ekspor, pengaturan pajak, akun staf, target.
- **Baca**: ARCHITECTURE.md Bab 11; API_CONTRACT.md Bab 3.4, ACT-09.
- **Buat**: `ReportingService` (agregasi laba rugi berbasis snapshot), controller laporan
  (+ ekspor CSV), `SettingsController`, `StaffController`, `SalesTargetController`.
- **Kontrak**: `Admin/Dashboard` (`dashboard`, `menus`), `Admin/Reports` (`orders`,
  `restaurant`), `Admin/Settings` (`restaurant`, `staff`, `payment`), `Admin/Targets`
  (`salesTarget`) — bentuk mengikuti `Data/mock/reports.js` & `staff.js`.
- **Selesai bila**: angka dasbor = hanya transaksi `paid`, sebelum pajak.

### K. Testing & QA
- **Tujuan**: bukti otomatis 8 invarian.
- **Buat**: `PayFirstOrderTest`, `HppSnapshotTest`, `TableSessionLockingTest`,
  `WebhookIdempotencyTest`, plus test concurrency 2 scan QR.
- **Catatan**: partial unique index & pessimistic lock hanya bisa diuji di PostgreSQL;
  test yang butuh PG diberi `markTestSkipped` bila koneksi bukan `pgsql`.

### L. Demo & deploy
- **Tujuan**: siap demo offline + produksi.
- **Buat**: endpoint/tombol dev "simulasikan pembayaran berhasil", skenario demo 5 menit,
  konfigurasi Supervisor (queue + reverb), update `README.md`.

---

## 7. Kontrak Props per Halaman (ringkas)

Pelaksana harus memastikan controller mengirim props dengan **nama yang sama** seperti di bawah
(detail tiap field ada di `API_CONTRACT.md` Bab 3 dan `Data/mock/`).

| Halaman (`Pages/…`) | Props yang dikirim controller |
|---|---|
| `Customer/Menu/Index` | `table`, `session`, `restaurant`, `categories`, `menus` |
| `Customer/Cart/Index` | `table`, `restaurant`, `menus` |
| `Customer/Checkout/Index` | `table`, `restaurant` |
| `Customer/Payment/Index` | `code`, `order`, `restaurant` |
| `Customer/Order/Status` | `code`, `order`, `restaurant` |
| `Auth/Login` | `auth` (via share) + field login |
| `Cashier/Dashboard` | `orders`, `restaurant`, `stats` |
| `Cashier/Orders` | `menus`, `categories`, `tables`, `restaurant` |
| `Cashier/Tables` | `tables`, `appUrl` |
| `Cashier/History` | `orders`, `restaurant` |
| `Kitchen/Dashboard` | `orders`, `doneToday` |
| `Admin/Dashboard` | `dashboard`, `menus` |
| `Admin/Menus` | `menus`, `categories` |
| `Admin/Reports` | `orders`, `restaurant` |
| `Admin/Targets` | `salesTarget` |
| `Admin/Settings` | `restaurant`, `staff`, `payment` |

---

## 8. Kontrak Aksi Mutasi (HTTP) — ringkas

Sumber lengkap: `API_CONTRACT.md` Bab 4 (`ACT-01` … `ACT-09`). Ringkasan untuk orientasi:

| Aksi | Metode & tujuan | Peran |
|---|---|---|
| ACT-01 | Buat pesanan mandiri pelanggan (dari keranjang) | pelanggan |
| ACT-02 | Input pesanan manual via barcode meja | kasir |
| ACT-03 | Terima pembayaran tunai | kasir |
| ACT-04 | Update progres masakan | dapur |
| ACT-05 | Konfirmasi makanan disajikan | dapur/kasir |
| ACT-06 | Batalkan pesanan belum bayar | kasir |
| ACT-07 | Tutup sesi meja | kasir |
| ACT-08 | CRUD master menu | admin |
| ACT-09 | Update pengaturan restoran & pajak | admin |

---

## 9. Kontrak Real-Time — ringkas

Sumber lengkap: `API_CONTRACT.md` Bab 6. Orientasi: channel terpisah per peran
(mis. `kasir`, `dapur`, `pesanan.{code}`); event utama: pesanan baru dibayar, status masakan
berubah, makanan siap/disajikan, pembayaran diterima, sesi meja ditutup. Payload **harus**
mengikuti standar di Bab 6.2.

---

## 10. Test Wajib

| Test | Invarian yang dibuktikan |
|---|---|
| `PayFirstOrderTest` | Pesanan `pending` tak terlihat di dapur; baru `paid` yang masuk antrean |
| `HppSnapshotTest` | Ubah harga/HPP master → transaksi lama tidak berubah |
| `TableSessionLockingTest` | Satu meja hanya satu sesi `active` (partial unique index) |
| `WebhookIdempotencyTest` | Webhook dobel tidak menggandakan pencatatan |
| `DatabaseMigrationTest` | Struktur & tipe kolom sesuai ARCHITECTURE.md |

---

## 11. Definition of Done (checklist generik per modul)

- [ ] Migration/kolom sesuai ARCHITECTURE.md (tanpa mengubah desain).
- [ ] Controller mengirim props sesuai kontrak (Bab 7) — frontend berhenti memakai mock.
- [ ] Logika bisnis di `Services/` atau `Actions/`, bukan di controller.
- [ ] Validasi input lewat `FormRequest`.
- [ ] Uang integer; waktu `Asia/Jakarta`; label UI Bahasa Indonesia; kode Bahasa Inggris.
- [ ] Tidak ada file frontend yang berubah.
- [ ] `php artisan test` lolos + `vendor/bin/pint` bersih.
- [ ] Broadcast (jika ada) via `DB::afterCommit()`.

---

## 12. Konvensi Branch, Commit, PR (dari AGENTS.md)

- Branch task: `feat/T-0xx-<slug>` / `fix/T-0xx-…` dari `main` terbaru (`git pull --rebase origin main`).
- Commit: Conventional Commits + Task ID, Bahasa Inggris. Contoh: `feat(T-006): create migrations …`.
- Sebelum push: lint + test + build lolos. Push branch → buka PR. **Jangan merge tanpa persetujuan**.
- **Dilarang**: push langsung ke `main`, force push ke `main`, commit `.env`/kredensial.
- Hindari konflik: satu orang fokus di satu area; kalau konflik, jangan timpa kode teman.

---

## 13. SOP Singkat Pelaksana (cara kerja per task)

1. Baca dokumen urutan di Bab 2 yang relevan dengan modul.
2. Baca komentar atas file halaman frontend + `Data/mock` terkait untuk tahu kontrak props.
3. Buat branch task dari `main` terbaru.
4. Implementasi backend sesuai modul (jangan ubah frontend).
5. Jalankan `php artisan test` + `vendor/bin/pint`.
6. Commit + push + PR; tuliskan di PR: task yang dikerjakan, langkah test, acceptance criteria.
