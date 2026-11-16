/**
 * Fase frontend saja: pesanan pelanggan disimpan di localStorage per meja (sesi meja),
 * supaya halaman Checkout, Pembayaran & Status bisa berjalan tanpa backend.
 *
 *   microdine.session.{meja} = { customer, method, orders: [order, ...] }
 *
 * Pesanan ke-2 dst. di meja yang sama = pesanan TAMBAHAN (`sequence` 2, 3, ...). Tetap bayar di awal.
 * Setelah backend siap: data datang dari props `order` & `sessionOrders` (orders.table_session_id),
 * dan nomor pesanan dibuat server.
 */
import { orders as mockOrders, pastOrders as mockPastOrders } from '@/Data/mock/orders';

const sessionKey = (table) => `microdine.session.${table}`;
const emptySession = { customer: '', method: 'qris', orders: [] };

function read(key, fallback) {
    try {
        return JSON.parse(window.localStorage.getItem(key)) ?? fallback;
    } catch {
        return fallback;
    }
}

function write(key, value) {
    try {
        window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
        // abaikan (mode privat / penyimpanan diblokir)
    }
}

/** Semua kunci sesi meja yang tersimpan di browser ini. */
function storedSessions() {
    if (typeof window === 'undefined') return [];
    try {
        return Object.keys(window.localStorage)
            .filter((key) => key.startsWith('microdine.session.'))
            .map((key) => read(key, emptySession));
    } catch {
        return [];
    }
}

/** Sesi meja yang tersimpan (nama & metode terakhir + daftar pesanan). */
export function readTableSession(table) {
    if (typeof window === 'undefined') return emptySession;
    return { ...emptySession, ...read(sessionKey(table), emptySession) };
}

/**
 * Pesanan di sesi meja: yang tersimpan di browser, digabung dengan data contoh untuk meja itu
 * (agar demo langsung terlihat "pesanan sebelumnya"). Diurutkan sesuai `sequence`.
 */
export function sessionOrders(table) {
    const stored = readTableSession(table).orders;
    const storedCodes = new Set(stored.map((order) => order.code));
    const sample = mockOrders.filter((order) => order.table === table && !storedCodes.has(order.code));
    return [...sample, ...stored].sort((a, b) => (a.sequence ?? 1) - (b.sequence ?? 1));
}

/** Nomor antrean berikutnya (fase frontend). Backend yang membuat nomor sebenarnya. */
export function nextOrderCode() {
    const codes = [...mockOrders, ...mockPastOrders, ...storedSessions().flatMap((session) => session.orders ?? [])].map((order) => Number(order.code.split('-')[1]) || 0);
    return `A-${String(Math.max(0, ...codes) + 1).padStart(3, '0')}`;
}

/** Simpan / perbarui pesanan di sesi mejanya, sekaligus mengingat nama & metode bayar terakhir. */
export function saveOrder(order) {
    if (typeof window === 'undefined') return;
    const session = readTableSession(order.table);
    const exists = session.orders.some((item) => item.code === order.code);
    const orders = exists ? session.orders.map((item) => (item.code === order.code ? { ...item, ...order } : item)) : [...session.orders, order];
    write(sessionKey(order.table), { customer: order.customer || session.customer, method: order.method || session.method, orders });
}

/** Cari pesanan tersimpan berdasarkan kode di semua sesi meja. */
export function findStoredOrder(code) {
    for (const session of storedSessions()) {
        const found = (session.orders ?? []).find((order) => order.code === code);
        if (found) return found;
    }
    return null;
}

/**
 * Ambil pesanan untuk halaman pelanggan: props dari backend -> pesanan tersimpan di browser
 * -> data contoh (default A-024).
 */
export function resolveOrder(code, orderProp) {
    if (orderProp) return orderProp;
    const saved = typeof window !== 'undefined' ? findStoredOrder(code) : null;
    if (saved) return saved;
    const sample = mockOrders.find((order) => order.code === code) ?? mockOrders.find((order) => order.code === 'A-024');
    return { ...sample, code, createdAt: Date.now() - 5 * 60 * 1000 - 18 * 1000 };
}
