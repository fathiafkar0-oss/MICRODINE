# Kontrak API & Antarmuka Sistem (API & Interface Contract) — MICRODINE

> **Inovasi Platform Manajemen Restoran Terpadu untuk Mendorong Kemandirian Digital Bisnis Mikro Indonesia**  
> **Versi Dokumen**: 1.0 (Master API Specification)  
> **Arsitektur**: Monolitik Terintegrasi (Laravel 13 + React 19 via Inertia.js v3)  
> **Standar Desain**: *Contract-First*, Validasi Batas Sistem (*Boundary Validation*), Semantik Error Terpadu, Protokol Idempotensi Ketat, & Kepatuhan *Hyrum's Law*.

---

## 1. Ikhtisar Arsitektur & Prinsip Desain Kontrak

Aplikasi MICRODINE mengadopsi arsitektur **Monolitik Tunggal (*Single Codebase Monolith*)** dengan Inertia.js v3. Interaksi antara *backend* dan *frontend* terbagi ke dalam 4 kategori antarmuka:

1. **Kontrak Props Halaman Inertia (*Page Props Contract*)**: Data terhidrasi langsung dari Controller ke komponen React saat navigasi halaman (`Inertia::render()`).
2. **Kontrak Mutasi HTTP (*State-Changing Actions*)**: Pengiriman form atau aksi mutasi melalui permintaan HTTP (`POST`, `PUT`, `PATCH`, `DELETE`) yang divalidasi oleh `FormRequest`.
3. **Kontrak Webhook & Integrasi Gateway (*External Boundary*)**: Endpoint publik untuk menerima *callback* pembayaran Midtrans ber-tanda tangan kriptografis dan fallback HTTP *long-polling*.
4. **Kontrak Siaran Real-Time (*WebSockets Broadcast*)**: Saluran dan payload event asinkron instan melalui Laravel Reverb + Laravel Echo.

```mermaid
flowchart LR
    subgraph KLIEN["Peramban Klien (React 19)"]
        UI_Cust["Pelanggan (Mobile)"]
        UI_Cash["Kasir (Kanban & Grid)"]
        UI_KDS["Dapur (KDS)"]
        UI_Admin["Admin (Analitik)"]
    end

    subgraph BACKEND["Backend Laravel 13"]
        InertiaCtrl["Inertia Controllers\n(Hydrate Page Props)"]
        ActionCtrl["Domain Actions\n(FormRequest Validated)"]
        WebhookCtrl["Webhook Controller\n(Signature & Idempotency)"]
        ReverbWS["Laravel Reverb WS\n(Broadcast Events)"]
    end

    subgraph GATEWAY["External Services"]
        Midtrans["Midtrans QRIS Gateway"]
    end

    UI_Cust -->|1. Request Page / Navigation| InertiaCtrl
    InertiaCtrl -->|Hydrated Props| UI_Cust
    UI_Cust -->|2. Submit Order / Pay| ActionCtrl
    UI_Cash -->|2. Accept Cash / Close Table| ActionCtrl
    UI_KDS -->|2. Progress Cooking / Done| ActionCtrl
    
    Midtrans -->|3. Webhook Callback (POST)| WebhookCtrl
    ActionCtrl -.->|Trigger Broadcast| ReverbWS
    WebhookCtrl -.->|Trigger Broadcast| ReverbWS
    ReverbWS -->|4. Push Socket Event| UI_Cust
    ReverbWS -->|4. Push Socket Event| UI_Cash
    ReverbWS -->|4. Push Socket Event| UI_KDS
```

---

## 2. Standar Protokol & Konvensi Data Global

### 2.1 Format Nilai Moneter & Mata Uang
- **Tipe Data**: Seluruh nilai moneter (harga jual, HPP, subtotal, pajak, kembalian, omzet) **WAJIB** direpresentasikan dalam **Bilangan Bulat Rupiah (`int` / `bigint`)**.
- **Larangan Desimal**: Dilarang keras menggunakan tipe data `float` atau `double` di seluruh kontrak input/output untuk mencegah anomali pembulatan pecahan sen.
- **Contoh**: Rp 63.800 dikirimkan sebagai `63800`.

### 2.2 Format Waktu & Zona Waktu
- **Zona Waktu**: Baku `Asia/Jakarta` (WIB / UTC+7).
- **Format Pertukaran Data**: String standar ISO 8601 (`YYYY-MM-DDTHH:mm:ss+07:00`) atau string waktu terformat Indonesia sesuai kebutuhan presentasi visual (`"14:25"`, `"16 Nov 2026"`).

### 2.3 Standar Struktur Error Terpadu (Consistent Error Semantics)
Semua respons error non-Inertia (API/Webhook/JSON) menggunakan format pembungkus (*envelope*) yang seragam:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Data pesanan tidak valid.",
    "details": {
      "items": ["Minimal 1 menu harus dipilih dalam pesanan."],
      "customer_name": ["Nama pemesan wajib diisi."]
    }
  }
}
```

#### Pemetaan Kode Status HTTP:
| Kode HTTP | Makna Semantik | Penggunaan di MICRODINE |
| :---: | :--- | :--- |
| **`200 OK`** | Permintaan sukses | Ambil data, pembaruan data parsial sukses, webhook diterima. |
| **`201 Created`** | Pembuatan entitas sukses | Pesanan baru berhasil dibuat, menu baru disimpan. |
| **`302 Found`** | Redirect Inertia | Standar respon mutasi form Inertia ke halaman status/tujuan. |
| **`400 Bad Request`** | Format payload cacat | JSON tidak terbaca, barcode tidak dapat di-parse. |
| **`401 Unauthorized`** | Belum terotentikasi | Sesi staf kadaluarsa, belum login ke `/staf/masuk`. |
| **`403 Forbidden`** | Akses ditolak | Role staf tidak berhak (RBAC), tanda tangan webhook Midtrans tidak valid. |
| **`404 Not Found`** | Sumber daya tidak ditemukan | Nomor meja salah, kode pesanan tidak ada, menu telah dihapus. |
| **`409 Conflict`** | Konflik konkurensi / *race* | Meja fisik sedang dikunci oleh proses lain, request in-flight terduplikasi. |
| **`422 Unprocessable`** | Validasi input gagal | Validasi FormRequest gagal (harga negatif, nama kosong, menu habis). |
| **`500 Server Error`** | Kesalahan internal server | Kesalahan database; rincian SQL internal tidak boleh bocor ke publik. |

### 2.4 Protokol Idempotensi (*Idempotency Key & Atomic Lock*)
1. **Derivasi Kunci**: Kunci idempotensi diturunkan dari identitas bisnis yang stabil:
   - Webhook QRIS: `idempotency_key = midtrans:{order_id}:{status_code}`.
   - Pembayaran Tunai Kasir: `idempotency_key = cash:{order_code}`.
   - Pembuatan Pesanan: Diambil dari header `Idempotency-Key` (atau digenerate sekali per checkout klik).
2. **Klaim Atomik**: Server memvalidasi kunci dalam satu transaksi `SELECT ... FOR UPDATE` dan *unique constraint*. Pengecekan terpisah yang diikuti insert tanpa lock dilarang keras (*Time-of-Check to Time-of-Use race*).
3. **Perlindungan Payload**: Jika request kedua datang dengan *Idempotency-Key* yang sama tetapi isi payload berbeda, server mengembalikan error `422 IDEMPOTENCY_KEY_REUSED`.
4. **Duplikasi In-Flight**: Jika request kedua tiba saat request pertama masih berjalan, server merespon dengan `409 Conflict` (bukan mengeksekusi ulang).

---

## 3. Kontrak Props Halaman Inertia (Inertia View Props Contract)

Seluruh halaman antarmuka dirender oleh Laravel Controller via `Inertia::render('Path/Komponen', $props)`. Berikut adalah kontrak skema props yang dijamin oleh backend:

### 3.1 Halaman Pelanggan (Customer Mobile-First)

#### A. Katalog Menu (`GET /meja/{table}`)
- **Komponen**: `Customer/Menu/Index`
- **Parameter Rute**: `table` (regex: `^[0-9]{2}$`, misal: `"07"`)
- **Props**:
```typescript
interface CustomerMenuProps {
  table: string; // "07"
  session: {
    joined: boolean; // true jika bergabung ke sesi meja yang sudah aktif
    sessionId: number;
    guestName?: string;
  };
  restaurant: {
    name: string; // "MICRODINE Resto"
    address: string;
    taxEnabled: boolean;
    taxRatePercent: number; // 10
    paymentDeadlineMinutes: number; // 15
  };
  categories: Array<{
    id: number;
    name: string; // "Makanan", "Minuman", "Camilan"
    slug: string;
  }>;
  menus: Array<{
    id: number;
    categoryId: number;
    category: string; // "Makanan"
    name: string; // "Nasi Goreng Spesial"
    description: string;
    price: number; // 28000
    hpp: number; // 12000 (tidak dipaparkan ke public pelanggan)
    image: string; // URL atau path aset foto
    isAvailable: boolean;
  }>;
}
```

#### B. Keranjang Pesanan (`GET /meja/{table}/keranjang`)
- **Komponen**: `Customer/Cart/Index`
- **Props**:
```typescript
interface CustomerCartProps {
  table: string;
  restaurant: RestaurantSettings;
}
```
*(Catatan: Item keranjang disimpan di client local storage via `useCart(table)` dan divalidasi ke backend saat submit pesanan).*

#### C. Checkout Pembayaran (`GET /meja/{table}/checkout`)
- **Komponen**: `Customer/Checkout/Index`
- **Props**:
```typescript
interface CustomerCheckoutProps {
  table: string;
  restaurant: RestaurantSettings;
}
```

#### D. Menunggu Pembayaran (`GET /pesanan/{code}/bayar`)
- **Komponen**: `Customer/Payment/Index`
- **Parameter Rute**: `code` (regex: `^[A-Z]-[0-9]{3}$`, misal: `"A-024"`)
- **Props**:
```typescript
interface CustomerPaymentProps {
  code: string; // "A-024"
  order: {
    code: string;
    table: string; // "07"
    customer: string; // "Fathi"
    method: 'qris' | 'tunai';
    status: 'menunggu_bayar' | 'diproses' | 'selesai' | 'dibatalkan' | 'kedaluwarsa';
    qrisString?: string; // Payload QRIS dinamis string standar EMVCo
    qrisExpiresAt: string; // "2026-11-16T15:35:00+07:00"
    createdAt: string;
    items: Array<{
      menuId: number;
      name: string;
      price: number;
      qty: number;
      notes?: string;
    }>;
    subtotal: number;
    tax: number;
    total: number;
  };
  restaurant: RestaurantSettings;
}
```

#### E. Pelacak Status Pesanan (`GET /pesanan/{code}`)
- **Komponen**: `Customer/Order/Status`
- **Parameter Rute**: `code` (misal: `"A-024"`)
- **Props**:
```typescript
interface CustomerOrderStatusProps {
  code: string;
  order: {
    code: string;
    table: string;
    customer: string;
    method: 'qris' | 'tunai';
    status: 'menunggu_bayar' | 'diproses' | 'selesai' | 'dibatalkan' | 'kedaluwarsa';
    kitchenStatus: 'queued' | 'cooking' | 'done' | 'served';
    paidAt?: string;
    cookingAt?: string;
    doneAt?: string;
    servedAt?: string;
    items: Array<{
      id: number;
      name: string;
      price: number;
      qty: number;
      notes?: string;
    }>;
    subtotal: number;
    tax: number;
    total: number;
  };
  restaurant: RestaurantSettings;
}
```

---

### 3.2 Halaman Staf Kasir (Point of Sales & Table Management)

#### A. Antrean Kanban Kasir (`GET /kasir`)
- **Komponen**: `Cashier/Dashboard`
- **Props**:
```typescript
interface CashierDashboardProps {
  orders: Array<{
    id: number;
    code: string; // "A-024"
    table: string; // "07"
    customer: string;
    method: 'qris' | 'tunai';
    status: 'menunggu_bayar' | 'diproses' | 'selesai' | 'dibatalkan';
    kitchenStatus: 'queued' | 'cooking' | 'done' | 'served';
    createdAt: string;
    minutesAgo: number;
    items: Array<{
      id: number;
      name: string;
      qty: number;
      notes?: string;
    }>;
    subtotal: number;
    tax: number;
    total: number;
  }>;
  restaurant: RestaurantSettings;
  stats: {
    doneToday: number; // 27
    shiftOmzet: number; // 2140000 (Khusus transaksi paid)
    waitingPaymentCount: number;
    inProgressCount: number;
  };
}
```

#### B. Pesanan Manual Kasir via Barcode Scanner (`GET /kasir/pesanan`)
- **Komponen**: `Cashier/Orders`
- **Props**:
```typescript
interface CashierOrdersProps {
  menus: Array<MenuItem>;
  categories: Array<Category>;
  tables: Array<{
    id: number;
    number: string; // "07"
    barcode: string; // "MJ-07"
    capacity: number;
    status: 'tersedia' | 'terisi';
  }>;
  restaurant: RestaurantSettings;
}
```

#### C. Grid Manajemen Meja (`GET /kasir/meja`)
- **Komponen**: `Cashier/Tables`
- **Props**:
```typescript
interface CashierTablesProps {
  tables: Array<{
    id: number;
    number: string; // "07"
    barcode: string; // "MJ-07"
    capacity: number;
    status: 'tersedia' | 'terisi';
    activeSession?: {
      id: number;
      startedAt: string;
      durationMinutes: number;
      customerName?: string;
      orderCode?: string;
      unservedCount: number; // Jumlah masakan yang belum diantar
    };
  }>;
  restaurant: RestaurantSettings;
}
```

#### D. Histori Transaksi Harian (`GET /kasir/histori`)
- **Komponen**: `Cashier/History`
- **Props**:
```typescript
interface CashierHistoryProps {
  orders: Array<{
    id: number;
    code: string;
    table: string;
    customer: string;
    method: 'qris' | 'tunai';
    status: 'lunas' | 'menunggu_bayar' | 'dibatalkan' | 'gagal';
    time: string; // "14:25"
    subtotal: number;
    tax: number;
    total: number;
    items: Array<{
      name: string;
      qty: number;
      price: number;
    }>;
    webhookLog?: {
      verified: boolean;
      statusCode: string;
      receivedAt: string;
    };
  }>;
  stats: {
    totalRevenue: number;
    totalTransactions: number;
    totalCash: number;
    totalQris: number;
  };
  filters: {
    date: string; // "2026-11-16"
    status: string; // "Semua" | "lunas" | "menunggu_bayar" | "dibatalkan"
    method: string; // "Semua" | "tunai" | "qris"
    search?: string;
  };
  pagination: {
    currentPage: number;
    perPage: number;
    totalItems: number;
    totalPages: number;
  };
}
```

---

### 3.3 Halaman Monitor Dapur (Kitchen Display System — KDS)

#### Layar KDS Dapur (`GET /dapur`)
- **Komponen**: `Kitchen/Dashboard`
- **Invarian Kritis**: HANYA pesanan berstatus `payment_status = 'paid'` yang boleh dikirim oleh controller!
- **Props**:
```typescript
interface KitchenDashboardProps {
  orders: Array<{
    id: number;
    code: string; // "A-024"
    table: string; // "07"
    customer: string; // "Andi"
    kitchenStatus: 'queued' | 'cooking';
    paidAt: string;
    minutesAgo: number;
    items: Array<{
      id: number;
      name: string;
      qty: number;
      notes?: string; // "Tanpa cabai, kuah dipisah"
    }>;
  }>;
  doneToday: number;
}
```

---

### 3.4 Halaman Administrator (Analytics, Master Data, & Settings)

#### A. Ringkasan Eksekutif (`GET /admin`)
- **Komponen**: `Admin/Dashboard`
- **Props**:
```typescript
interface AdminDashboardProps {
  metrics: {
    totalRevenue: number; // Omzet (hanya paid)
    totalHpp: number; // Akumulasi snapshot unit_hpp * qty
    netProfit: number; // totalRevenue - totalHpp
    successfulOrdersCount: number;
    profitMarginPercent: number; // misal: 45.8 (%)
  };
  revenueTrends: Array<{
    date: string; // "02/11"
    omzet: number; // 3200000
    profit: number; // 1450000
  }>;
  paymentDistribution: {
    qrisPercent: number; // 68
    cashPercent: number; // 32
    qrisCount: number;
    cashCount: number;
  };
  topSelling: Array<{
    id: number;
    name: string;
    soldQty: number;
    revenue: number;
  }>;
  period: 'today' | '7days' | '30days' | 'thisMonth';
}
```

#### B. Master Menu & HPP (`GET /admin/menu`)
- **Komponen**: `Admin/Menus`
- **Props**:
```typescript
interface AdminMenusProps {
  categories: Array<{ id: number; name: string; slug: string }>;
  menus: Array<{
    id: number;
    categoryId: number;
    category: string;
    name: string;
    description: string;
    price: number; // Harga jual saat ini
    hpp: number; // HPP statis saat ini
    marginRp: number; // price - hpp
    marginPercent: number; // (marginRp / price) * 100
    image: string;
    isAvailable: boolean;
    showInCatalog: boolean;
  }>;
}
```

#### C. Laporan & Audit Transaksi (`GET /admin/laporan`)
- **Komponen**: `Admin/Reports`
- **Props**:
```typescript
interface AdminReportsProps {
  orders: Array<{
    id: number;
    code: string;
    table: string;
    customer: string;
    method: 'qris' | 'tunai';
    status: 'lunas' | 'menunggu_bayar' | 'dibatalkan' | 'gagal';
    paid: boolean;
    time: string;
    omzet: number; // Subtotal pesanan
    tax: number;
    total: number;
    hpp: number; // Dari data snapshot unit_hpp_snapshot
    profit: number; // omzet - hpp
    items: Array<{
      name: string;
      qty: number;
      unitPrice: number;
      unitHpp: number;
    }>;
  }>;
  summary: {
    totalRevenue: number;
    totalHpp: number;
    netProfit: number;
    taxCollected: number;
  };
  pagination: PaginationMeta;
}
```

#### D. Target Penjualan (`GET /admin/target`)
- **Komponen**: `Admin/Targets`
- **Props**:
```typescript
interface AdminTargetsProps {
  target: {
    id: number;
    month: string; // "2026-11"
    monthlyTarget: number; // 45000000
    currentRevenue: number; // 24800000
    realizationPercent: number; // 55.1
    remainingTarget: number; // 20200000
    remainingDays: number; // 14
    dailyNeeded: number; // 1442857
  };
  weeklyChart: Array<{
    week: string; // "M1", "M2", "M3", "M4"
    targetCumulative: number;
    actualCumulative: number;
  }>;
}
```

#### E. Pengaturan Sistem (`GET /admin/pengaturan`)
- **Komponen**: `Admin/Settings`
- **Props**:
```typescript
interface AdminSettingsProps {
  settings: {
    restaurantName: string;
    address: string;
    phone: string;
    taxEnabled: boolean;
    taxRatePercent: number; // default 10
    paymentDeadlineMinutes: number; // 15
  };
  tables: Array<{
    id: number;
    number: string;
    barcode: string;
    capacity: number;
    qrUrl: string;
  }>;
}
```

---

## 4. Kontrak Aksi Mutasi HTTP (State-Changing Actions)

Setiap aksi mutasi form dieksekusi via `router.post()`, `router.put()`, atau `router.patch()` di sisi frontend, dan divalidasi oleh `FormRequest` di sisi backend.

---

### [ACT-01] Pembuatan Pesanan Mandiri Pelanggan
- **Metode & URI**: `POST /meja/{table}/pesanan`
- **Tujuan**: Membuat tiket pesanan baru dari keranjang pelanggan, mengunci sesi meja, dan membuat snapshot harga & HPP.
- **Middleware**: `throttle:60,1`
- **Payload Request (JSON / Form Data)**:
```json
{
  "customer_name": "Fathi Afkar",
  "payment_method": "qris",
  "items": [
    {
      "menu_id": 1,
      "quantity": 2,
      "notes": "Pedas sedang, tanpa bawang"
    },
    {
      "menu_id": 5,
      "quantity": 1,
      "notes": "Es sedikit"
    }
  ]
}
```
- **Aturan Validasi (`CheckoutRequest`)**:
  - `customer_name`: `required|string|min:2|max:50`
  - `payment_method`: `required|in:qris,tunai`
  - `items`: `required|array|min:1`
  - `items.*.menu_id`: `required|integer|exists:menu_items,id`
  - `items.*.quantity`: `required|integer|min:1|max:99`
  - `items.*.notes`: `nullable|string|max:150`
- **Respon Sukses (Inertia Redirect)**:
  - Mengalihkan ke `GET /pesanan/{code}/bayar` dengan status HTTP `302 Found`.
  - Flash Session: `{ success: "Pesanan berhasil dibuat. Silakan selesaikan pembayaran." }`.
- **Respon Gagal (422)**:
  - Form error standard Inertia: `{ errors: { items: "Menu Nasi Goreng sedang habis." } }`.

---

### [ACT-02] Input Pesanan Manual oleh Kasir (Hardware Barcode Scanner)
- **Metode & URI**: `POST /kasir/pesanan`
- **Tujuan**: Kasir membuat pesanan manual untuk pelanggan tanpa smartphone.
- **Middleware**: `auth`, `role:kasir,admin`
- **Payload Request**:
```json
{
  "table_number": "07",
  "customer_name": "Bapak Rahmat (Offline)",
  "payment_method": "tunai",
  "cash_received": 100000,
  "items": [
    { "menu_id": 2, "quantity": 1, "notes": "Bungkus" }
  ]
}
```
- **Aturan Validasi (`ManualOrderRequest`)**:
  - `table_number`: `required|string|exists:dining_tables,number`
  - `customer_name`: `required|string|max:50`
  - `payment_method`: `required|in:tunai,qris`
  - `cash_received`: `required_if:payment_method,tunai|integer|min:0`
  - `items`: `required|array|min:1`
- **Respon Sukses (302 Redirect)**:
  - Status pesanan langsung `paid`, dicatat di histori, dipancarkan ke KDS dapur via Reverb, dan mengembalikan data struk untuk dicetak.

---

### [ACT-03] Penerimaan Pembayaran Tunai di Kasir
- **Metode & URI**: `POST /kasir/pesanan/{id}/pay-cash`
- **Tujuan**: Kasir mengonfirmasi penerimaan uang fisik pelanggan pada modal kalkulator tunai.
- **Middleware**: `auth`, `role:kasir,admin`
- **Header Opsional**: `Idempotency-Key: cash:{order_code}`
- **Payload Request**:
```json
{
  "cash_received": 100000
}
```
- **Aturan Validasi (`CashValidationRequest`)**:
  - `cash_received`: `required|integer|gte:total_bill`
- **Respon Sukses (JSON / Inertia Back)**:
```json
{
  "success": true,
  "order_code": "A-024",
  "total_bill": 63800,
  "cash_received": 100000,
  "change_due": 36200,
  "paid_at": "2026-11-16T15:20:00+07:00"
}
```
- **Aksi Ikutan Sistem**:
  - Mutasi status pesanan: `payment_status = 'paid'`, `kitchen_status = 'queued'`.
  - Pemicu event WebSocket: `OrderPaidEvent` dipancarkan di dalam `DB::afterCommit()`.

---

### [ACT-04] Pembaruan Progres Masakan oleh Dapur (KDS)
- **Metode & URI**: `PATCH /dapur/pesanan/{id}/status`
- **Tujuan**: Juru masak memperbarui status tiket dari Sedang Dimasak (`cooking`) menjadi Selesai (`done`).
- **Middleware**: `auth`, `role:dapur,kasir,admin`
- **Payload Request**:
```json
{
  "status": "done"
}
```
- **Aturan Validasi**:
  - `status`: `required|in:cooking,done`
- **Respon Sukses (200 OK / Inertia Back)**:
  - Status pesanan diperbarui menjadi `done`.
  - Event `KitchenStatusUpdatedEvent` dipancarkan seketika ke kasir dan pelanggan.

---

### [ACT-05] Konfirmasi Makanan Telah Disajikan ke Meja
- **Metode & URI**: `POST /kasir/pesanan/{id}/serve`
- **Tujuan**: Kasir/pelayan mengonfirmasi makanan di meja pelanggan telah disajikan.
- **Payload Request**: `{}` (tidak memerlukan body)
- **Respon Sukses**: `kitchen_status` berubah menjadi `served`.

---

### [ACT-06] Pembatalan Pesanan Belum Bayar oleh Kasir
- **Metode & URI**: `POST /kasir/pesanan/{id}/cancel`
- **Tujuan**: Kasir membatalkan pesanan tunai yang tidak kunjung dibayar.
- **Payload Request**:
```json
{
  "reason": "Pelanggan membatalkan pesanan di kasir"
}
```
- **Syarat Validasi**: `payment_status` harus bernilai `pending`. Pesanan yang sudah `paid` **DILARANG KERAS** dibatalkan tanpa prosedur otorisasi khusus.
- **Respon Sukses**: `payment_status` berubah menjadi `cancelled`.

---

### [ACT-07] Penutupan Sesi Meja oleh Kasir
- **Metode & URI**: `POST /kasir/meja/{sessionId}/close`
- **Tujuan**: Kasir menutup sesi meja setelah tamu selesai bersantap dan meja telah dibersihkan.
- **Payload Request**:
```json
{
  "force": false
}
```
- **Logika Validasi**:
  - Jika terdapat pesanan dengan `kitchen_status != 'served'` dan `force === false`:
    - Mengembalikan respons HTTP `409 Conflict`:
      ```json
      {
        "error": {
          "code": "UNSERVED_ORDERS_EXIST",
          "message": "Masih ada 1 pesanan yang belum selesai dimasak atau disajikan di meja ini.",
          "unserved_count": 1
        }
      }
      ```
  - Jika `force === true` atau seluruh pesanan telah disajikan:
    - `table_sessions.status` berubah menjadi `closed`.
    - Kartu meja kembali berstatus "Tersedia" (hijau).
    - Event `TableSessionUpdatedEvent` dipancarkan ke seluruh layar kasir.

---

### [ACT-08] Operasi CRUD Master Menu oleh Admin
- **Tambah Menu**: `POST /admin/menu`
- **Ubah Menu**: `PUT /admin/menu/{id}`
- **Hapus Menu (Soft Delete)**: `DELETE /admin/menu/{id}`
- **Toggle Ketersediaan**: `PATCH /admin/menu/{id}/toggle-availability`
- **Payload Form Data**:
```json
{
  "category_id": 1,
  "name": "Ayam Bakar Madu",
  "description": "Ayam bakar bumbu madu khas Nusantara",
  "price": 32000,
  "hpp": 14000,
  "is_available": true,
  "show_in_catalog": true
}
```
- **Integritas Historis**: Pembaruan `price` atau `hpp` hanya memperbarui nilai di tabel `menu_items`. Nilai `unit_price_snapshot` dan `unit_hpp_snapshot` pada pesanan masa lalu **TIDAK TERPENGARUH**.

---

### [ACT-09] Pembaruan Pengaturan Restoran & Tarif Pajak
- **Metode & URI**: `PUT /admin/pengaturan`
- **Payload Request**:
```json
{
  "restaurant_name": "MICRODINE Resto",
  "address": "Jl. Teuku Nyak Arief No. 12, Banda Aceh",
  "phone": "081234567890",
  "tax_enabled": true,
  "tax_rate_percent": 10,
  "payment_deadline_minutes": 15
}
```

---

## 5. Kontrak Webhook & Integrasi Gateway Eksternal

### 5.1 Webhook Payment Gateway Midtrans (QRIS)
- **Metode & URI**: `POST /api/v1/payments/midtrans/webhook`
- **CSRF Protection**: Dikecualikan (*exempt*) di `bootstrap/app.php`.
- **Payload Masuk (JSON dari Midtrans)**:
```json
{
  "transaction_time": "2026-11-16 15:20:10",
  "transaction_status": "settlement",
  "transaction_id": "8b5f3a12-78d1-4e2b-8a56-cfd1a0982341",
  "status_message": "Midtrans payment notification",
  "status_code": "200",
  "signature_key": "a1b2c3d4e5f6...",
  "payment_type": "qris",
  "order_id": "A-024",
  "merchant_id": "G123456789",
  "gross_amount": "63800.00",
  "fraud_status": "accept",
  "currency": "IDR"
}
```

#### Aturan Verifikasi Keamanan Webhook:
1. **Validasi Tanda Tangan Kriptografis (SHA-512 Signature)**:
   ```php
   $expectedSignature = hash('sha512', $orderId . $statusCode . $grossAmount . $serverKey);
   if ($request->input('signature_key') !== $expectedSignature) {
       abort(403, 'Invalid Midtrans signature.');
   }
   ```
2. **Penanganan Idempotensi**:
   ```sql
   -- Eksekusi dibungkus transaction + pessimistic lock
   SELECT * FROM orders WHERE order_code = ? FOR UPDATE;
   ```
   - Jika pesanan telah berstatus `payment_status = 'paid'`, handler segera mengembalikan respon `HTTP 200 OK` tanpa memicu event WebSocket ulang.
3. **Penyelarasan Nilai Transaksi (*Amount Guard*)**:
   - Nilai integer `(int) $grossAmount` harus sama persis dengan `orders.total_amount`. Jika tidak cocok, transaksi ditandai `failed` dan dicatat ke log peringatan fraud.
4. **Respon Balasan ke Midtrans**:
   - Berhasil: `HTTP 200 OK` dengan body `{"status": "ok"}`.
   - Gagal verifikasi: `HTTP 403 Forbidden`.

---

### 5.2 Endpoint Simulasi Demo Offline Hackathon
- **Metode & URI**: `POST /api/v1/payments/simulate/{orderCode}`
- **Tujuan**: Tombol dev mode untuk menyimulasikan notifikasi webhook pelunasan QRIS saat tidak ada akses internet saat penjurian.
- **Lingkungan**: Hanya aktif jika `config('app.env') === 'local'`.
- **Respon**: Mengubah status menjadi `paid` dan memancarkan event Reverb layaknya webhook nyata.

---

### 5.3 Endpoint Fallback Sinkronisasi Polling
- **Metode & URI**: `GET /api/v1/sync`
- **Tujuan**: Menyediakan data sinkronisasi jika koneksi WebSocket klien terputus (*reconnect polling* setiap 5 detik).
- **Query Params**: `?role=kasir` atau `?role=dapur` atau `?order_code=A-024`
- **Respon (JSON)**:
```json
{
  "server_time": "2026-11-16T15:20:15+07:00",
  "active_orders_hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
  "data": { ... }
}
```

---

## 6. Kontrak Siaran Real-Time (WebSockets / Laravel Reverb)

Komunikasi dua arah asinkron diorkestrasi oleh **Laravel Reverb** di sisi backend dan **Laravel Echo** di sisi frontend.

### 6.1 Daftar Saluran (*Channels*)
| Nama Saluran | Tipe | Otorisasi Akses | Tujuan Siaran |
| :--- | :---: | :--- | :--- |
| **`orders`** | Public | Terbuka untuk seluruh staf kasir & dapur | Siaran pesanan lunas, progres masak, dan pembatalan tiket. |
| **`tables`** | Public | Terbuka untuk kasir | Pembaruan status visual ketersediaan meja (Tersedia/Terisi). |
| **`order.{code}`** | Public / Signed | Bebas akses dengan kode pesanan valid | Pembaruan status langsung pada layar gawai pelanggan meja tersebut. |

---

### 6.2 Definisi Event & Payload JSON

#### A. Event `OrderPaid`
- **Saluran**: `orders`, `order.{code}`
- **Pemicu**: Webhook QRIS sukses tervalidasi atau Kasir klik "Konfirmasi Pembayaran Tunai".
- **Eksekusi**: Dipancarkan via `DB::afterCommit(new OrderPaidEvent($order))`.
- **Payload**:
```json
{
  "event": "OrderPaid",
  "data": {
    "order_id": 104,
    "order_code": "A-024",
    "table_number": "07",
    "customer_name": "Fathi Afkar",
    "payment_method": "qris",
    "paid_at": "2026-11-16T15:20:10+07:00",
    "total_amount": 63800,
    "items": [
      {
        "name": "Nasi Goreng Spesial",
        "quantity": 2,
        "notes": "Pedas sedang"
      },
      {
        "name": "Es Teh Manis",
        "quantity": 1,
        "notes": "Es sedikit"
      }
    ]
  }
}
```
- **Reaksi Frontend**:
  - Dapur: Menambahkan kartu tiket baru ke kolom aktif dengan animasi *pop-in* dan membunyikan bel audio (`sound.js`).
  - Kasir: Memindahkan kartu pesanan dari kolom *Menunggu Pembayaran* ke kolom *Diproses*.
  - Pelanggan: Mengubah status dari *Menunggu Bayar* ke *Diproses (Sedang Dimasak)*.

---

#### B. Event `KitchenStatusUpdated`
- **Saluran**: `orders`, `order.{code}`
- **Pemicu**: Koki dapur menekan tombol "Mulai Masak" atau "Tandai Selesai".
- **Payload**:
```json
{
  "event": "KitchenStatusUpdated",
  "data": {
    "order_code": "A-024",
    "table_number": "07",
    "kitchen_status": "done",
    "updated_at": "2026-11-16T15:32:00+07:00"
  }
}
```
- **Reaksi Frontend**:
  - Dapur: Menghapus tiket dari monitor antrean aktif.
  - Kasir: Tombol aksi pada kartu Kanban berubah menjadi "Tandai Diantar".
  - Pelanggan: Lencana status berubah menjadi "Selesai — Siap Disajikan".

---

#### C. Event `TableSessionUpdated`
- **Saluran**: `tables`
- **Pemicu**: Pembukaan sesi meja pertama kali atau Kasir klik "Tutup Sesi Meja".
- **Payload**:
```json
{
  "event": "TableSessionUpdated",
  "data": {
    "table_number": "07",
    "session_id": 42,
    "status": "closed",
    "updated_at": "2026-11-16T15:45:00+07:00"
  }
}
```
- **Reaksi Frontend**:
  - Kasir: Kartu Meja 07 seketika beralih warna dari merah "Terisi" kembali ke hijau "Tersedia".

---

#### D. Event `OrderCancelled`
- **Saluran**: `orders`, `order.{code}`
- **Pemicu**: Kasir menekan "Batalkan Pesanan" pada kolom pesanan pending.
- **Payload**:
```json
{
  "event": "OrderCancelled",
  "data": {
    "order_code": "A-024",
    "table_number": "07",
    "reason": "Dibatalkan oleh kasir",
    "cancelled_at": "2026-11-16T15:22:00+07:00"
  }
}
```
- **Reaksi Frontend**:
  - Kasir: Kartu pesanan terhapus dari Kanban antrean.
  - Pelanggan: Layar status menampilkan notifikasi pembatalan.

---

## 7. Definisi Tipe Domain TypeScript (Frontend Contract Reference)

Untuk kemudahan pengikatan komponen React (`resources/js/types/contracts.ts`), berikut adalah tipe antarmuka domain baku:

```typescript
// resources/js/types/contracts.ts

export type PaymentMethod = 'qris' | 'tunai';
export type PaymentStatus = 'menunggu_bayar' | 'diproses' | 'selesai' | 'dibatalkan' | 'kedaluwarsa';
export type KitchenStatus = 'queued' | 'cooking' | 'done' | 'served';
export type TableStatus = 'tersedia' | 'terisi';

export interface RestaurantSettings {
  name: string;
  address: string;
  phone?: string;
  taxEnabled: boolean;
  taxRatePercent: number;
  paymentDeadlineMinutes: number;
}

export interface MenuItem {
  id: number;
  categoryId: number;
  category: string;
  name: string;
  description: string;
  price: number;
  hpp?: number;
  marginRp?: number;
  marginPercent?: number;
  image: string;
  isAvailable: boolean;
  showInCatalog: boolean;
}

export interface OrderItem {
  id?: number;
  menuId: number;
  name: string;
  price: number;
  qty: number;
  notes?: string;
}

export interface Order {
  id: number;
  code: string;
  table: string;
  customer: string;
  method: PaymentMethod;
  status: PaymentStatus;
  kitchenStatus?: KitchenStatus;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  paidAt?: string;
  createdAt: string;
  minutesAgo?: number;
}

export interface TableItem {
  id: number;
  number: string;
  barcode: string;
  capacity: number;
  status: TableStatus;
  activeSession?: {
    id: number;
    startedAt: string;
    durationMinutes: number;
    customerName?: string;
    orderCode?: string;
    unservedCount: number;
  };
}

export interface PaginationMeta {
  currentPage: number;
  perPage: number;
  totalItems: number;
  totalPages: number;
}
```

---

## 8. Kebijakan Kompatibilitas & Perubahan Kontrak (Hyrum's Law Policy)

1. **Prinsip *Additive-Only***: Perubahan kontrak hanya boleh berupa **penambahan field opsional baru**, tidak boleh menghapus atau mengubah tipe data field yang sudah ada.
2. **Kepatuhan Terhadap Props Terpasang**: Komponen frontend yang telah terimplementasi di `resources/js/Pages` bergantung pada nama props yang terdokumentasi di bagian atas berkas. Controller Laravel dilarang mengubah kunci array props tanpa persetujuan tim.
3. **Penyembunyian Rahasia Finansial**: Nilai modal baku (`unit_hpp` / `hpp`) dilarang keras dipaparkan pada props rute pelanggan publik (`/meja/*` dan `/pesanan/*`). HPP hanya berhak diakses pada rute eksekutif admin (`/admin/*`).
