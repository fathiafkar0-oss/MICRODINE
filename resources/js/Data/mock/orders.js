/**
 * DATA CONTOH (mock) — fase frontend.
 * Angka dibuat sama dengan mockup di proposal (BAB II 2.3).
 * Backend cukup mengirim props dengan bentuk yang sama; halaman otomatis memakai props itu.
 */
import { menuById } from '@/Data/mock/menus';

/** Item pesanan menyimpan snapshot harga & HPP saat transaksi dibuat. */
function item(menuId, qty, note = '') {
    const menu = menuById[menuId];
    return { menuId, name: menu.name, price: menu.price, hpp: menu.hpp, qty, note };
}

/**
 * Pesanan aktif hari ini. `minutesAgo` = umur pesanan (dipakai untuk label "8 mnt").
 * source: 'qr' (pelanggan scan QR) | 'kasir' (pesanan manual via barcode meja)
 * sequence: urutan pesanan dalam satu sesi meja (1 = pesanan pertama, 2+ = pesanan tambahan).
 *           Tidak ditulis = 1. Backend: dihitung dari orders.table_session_id.
 */
export const orders = [
    { code: 'A-028', table: '04', customer: 'Dewi', source: 'qr', method: 'qris', status: 'diproses', sequence: 2, minutesAgo: 2, time: '12:10', paidAt: '12:10', items: [item('M-016', 2)] },
    { code: 'A-027', table: '08', customer: 'Sinta', source: 'qr', method: 'tunai', status: 'menunggu_bayar', minutesAgo: 1, time: '12:11', items: [item('M-012', 1), item('M-017', 1)] },
    { code: 'A-026', table: '03', customer: 'Budi', source: 'kasir', method: 'tunai', status: 'menunggu_bayar', minutesAgo: 4, time: '12:08', items: [item('M-011', 2), item('M-016', 1)] },
    { code: 'A-025', table: '12', customer: 'Rara', source: 'qr', method: 'tunai', status: 'menunggu_bayar', minutesAgo: 6, time: '12:06', items: [item('M-013', 1)] },
    { code: 'A-024', table: '07', customer: 'Andi', source: 'qr', method: 'qris', status: 'diproses', minutesAgo: 8, time: '12:04', paidAt: '12:04', items: [item('M-010', 1, 'Tanpa bawang goreng, pedas sedang'), item('M-011', 1), item('M-016', 1, 'Es sedikit')] },
    { code: 'A-023', table: '04', customer: 'Dewi', source: 'qr', method: 'tunai', status: 'diproses', minutesAgo: 12, time: '11:58', paidAt: '11:59', items: [item('M-010', 2), item('M-017', 2)] },
    { code: 'A-022', table: '01', customer: 'Yoga', source: 'qr', method: 'qris', status: 'selesai', minutesAgo: 18, time: '11:51', paidAt: '11:51', items: [item('M-012', 1), item('M-016', 1)] },
    { code: 'A-021', table: '10', customer: 'Fajar', source: 'kasir', method: 'tunai', status: 'selesai', minutesAgo: 25, time: '11:44', paidAt: '11:45', items: [item('M-015', 2)] },
];

/** Riwayat pesanan yang sudah lewat hari ini (ditambah pesanan aktif di atas). */
export const pastOrders = [
    { code: 'A-020', table: '05', customer: 'Lina', source: 'qr', method: 'qris', status: 'diantar', time: '11:30', paidAt: '11:31', items: [item('M-011', 1), item('M-010', 1), item('M-016', 1)] },
    { code: 'A-019', table: '02', customer: 'Rudi', source: 'qr', method: 'qris', status: 'gagal', time: '11:12', items: [item('M-010', 1), item('M-015', 1)] },
    { code: 'A-018', table: '09', customer: 'Maya', source: 'qr', method: 'tunai', status: 'dibatalkan', time: '10:58', items: [item('M-013', 1), item('M-017', 1)] },
    { code: 'A-017', table: '06', customer: 'Hendra', source: 'kasir', method: 'tunai', status: 'diantar', time: '10:41', paidAt: '10:41', items: [item('M-012', 2), item('M-016', 2)] },
    { code: 'A-016', table: '11', customer: 'Tika', source: 'qr', method: 'qris', status: 'diantar', time: '10:22', paidAt: '10:23', items: [item('M-013', 2), item('M-015', 1)] },
    { code: 'A-015', table: '01', customer: 'Bayu', source: 'qr', method: 'tunai', status: 'diantar', time: '10:05', paidAt: '10:06', items: [item('M-010', 1), item('M-017', 1)] },
];
