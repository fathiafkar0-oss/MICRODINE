/**
 * DATA CONTOH (mock) — fase frontend.
 * Angka dibuat sama dengan mockup di proposal (BAB II 2.3).
 * Backend cukup mengirim props dengan bentuk yang sama; halaman otomatis memakai props itu.
 *
 * isActive : meja nonaktif tidak tampil di kasir dan QR-nya menolak pesanan baru (tidak dihapus agar histori aman)
 * qrToken  : kode acak di URL QR (/meja/07?k=...) agar nomor meja tidak bisa ditebak dari luar restoran
 */
export const tableAreas = ['Area dalam', 'Teras', 'VIP'];

export const tables = [
    { id: 1, number: '01', seats: 4, area: 'Area dalam', isActive: true, qrToken: 'k7Qm2' },
    { id: 2, number: '02', seats: 4, area: 'Area dalam', isActive: true, qrToken: 'Rt8vX' },
    { id: 3, number: '03', seats: 2, area: 'Area dalam', isActive: true, qrToken: 'p3NcL' },
    { id: 4, number: '04', seats: 4, area: 'Area dalam', isActive: true, qrToken: 'Wd5zH' },
    { id: 5, number: '05', seats: 4, area: 'Area dalam', isActive: true, qrToken: 'b9JsE' },
    { id: 6, number: '06', seats: 2, area: 'Area dalam', isActive: true, qrToken: 'Ty4aK' },
    { id: 7, number: '07', seats: 4, area: 'Area dalam', isActive: true, qrToken: 'x8F2q' },
    { id: 8, number: '08', seats: 4, area: 'Area dalam', isActive: true, qrToken: 'Gm6uP' },
    { id: 9, number: '09', seats: 2, area: 'Teras', isActive: true, qrToken: 'n2VhY' },
    { id: 10, number: '10', seats: 4, area: 'Teras', isActive: true, qrToken: 'Lc7eS' },
    { id: 11, number: '11', seats: 4, area: 'Teras', isActive: true, qrToken: 'h5RwD' },
    { id: 12, number: '12', seats: 2, area: 'Teras', isActive: true, qrToken: 'Zq3tM' },
    { id: 13, number: '14', seats: 6, area: 'VIP', isActive: false, qrToken: 'e6XbN' },
];
