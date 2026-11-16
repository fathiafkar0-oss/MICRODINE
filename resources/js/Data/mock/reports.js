/**
 * DATA CONTOH (mock) — fase frontend.
 * Angka dibuat sama dengan mockup di proposal (BAB II 2.3).
 * Backend cukup mengirim props dengan bentuk yang sama; halaman otomatis memakai props itu.
 */
/** Ringkasan bisnis untuk dasbor admin (angka dari mockup proposal). */
export const dashboard = {
    today: { omzet: 4250000, hpp: 2590000, transactions: 68, omzetGrowth: 0.12, transactionGrowth: 9 },
    payment: { qris: 2635000, tunai: 1615000 },
    trend: [
        { label: '26', omzet: 2650000, laba: 1010000 },
        { label: '27', omzet: 3050000, laba: 1170000 },
        { label: '28', omzet: 2480000, laba: 950000 },
        { label: '29', omzet: 3350000, laba: 1290000 },
        { label: '30', omzet: 3720000, laba: 1430000 },
        { label: '31', omzet: 4420000, laba: 1700000 },
        { label: '1', omzet: 4570000, laba: 1760000 },
        { label: '2', omzet: 2900000, laba: 1110000 },
        { label: '3', omzet: 2800000, laba: 1080000 },
        { label: '4', omzet: 2890000, laba: 1110000 },
        { label: '5', omzet: 3600000, laba: 1390000 },
        { label: '6', omzet: 3970000, laba: 1530000 },
        { label: '7', omzet: 4800000, laba: 1850000 },
        { label: '8', omzet: 4250000, laba: 1660000 },
    ],
    topMenus: [
        { menuId: 'M-010', sold: 24, profit: 324000 },
        { menuId: 'M-011', sold: 18, profit: 252000 },
        { menuId: 'M-016', sold: 41, profit: 156000 },
        { menuId: 'M-012', sold: 11, profit: 138000 },
    ],
};

/** Target penjualan bulan berjalan (lihat mockup Gambar 2.10). */
export const salesTarget = {
    month: 'November 2026',
    monthlyTarget: 45000000,
    daysInMonth: 30,
    dailyTarget: 1500000,
    // Omzet lunas per hari (sebelum pajak), dari tanggal 1 sampai hari ini
    daily: [1420000, 1650000, 1210000, 1300000, 1280000, 1470000, 1540000, 1620000, 1180000, 1250000, 1260000],
    weeks: [
        { label: 'Minggu 1', range: '1–7 Nov', target: 10500000 },
        { label: 'Minggu 2', range: '8–14 Nov', target: 10500000 },
        { label: 'Minggu 3', range: '15–21 Nov', target: 10500000 },
        { label: 'Minggu 4', range: '22–30 Nov', target: 13500000 },
    ],
};
