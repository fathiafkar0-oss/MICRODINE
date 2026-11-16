/**
 * Fase frontend saja: pesanan terakhir pelanggan disimpan di localStorage supaya
 * halaman Pembayaran & Status bisa menampilkannya tanpa backend.
 * Setelah backend siap, data pesanan datang dari props `order`.
 */
import { orders as mockOrders } from '@/Data/mock/orders';

const KEY = 'microdine.lastOrder';

/**
 * Ambil pesanan untuk halaman pelanggan: props dari backend -> pesanan terakhir
 * di browser -> data contoh (default A-024).
 */
export function resolveOrder(code, orderProp) {
    if (orderProp) return orderProp;
    const saved = typeof window !== 'undefined' ? readLastOrder(code) : null;
    if (saved) return saved;
    const sample = mockOrders.find((order) => order.code === code) ?? mockOrders[3];
    return { ...sample, code, createdAt: Date.now() - 5 * 60 * 1000 - 18 * 1000 };
}

export function saveLastOrder(order) {
    try {
        window.localStorage.setItem(KEY, JSON.stringify(order));
    } catch {
        // abaikan (mode privat)
    }
}

export function readLastOrder(code) {
    try {
        const order = JSON.parse(window.localStorage.getItem(KEY));
        return order && order.code === code ? order : null;
    } catch {
        return null;
    }
}

export function updateLastOrder(code, changes) {
    const order = readLastOrder(code);
    if (order) saveLastOrder({ ...order, ...changes });
}
