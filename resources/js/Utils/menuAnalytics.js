/**
 * Perhitungan Analisis Menu: peringkat, konversi keranjang → beli, dan matriks menu
 * (metode menu engineering Kasavana & Smith: laku/tidak × untung besar/kecil).
 */

/** Gabungkan baris statistik dengan data menu + hitung margin & konversi. */
export function buildMenuStats(rows, menus) {
    const byId = Object.fromEntries(menus.map((menu) => [menu.id, menu]));
    return rows
        .filter((row) => byId[row.menuId])
        .map((row) => {
            const menu = byId[row.menuId];
            return {
                ...row,
                menu,
                unitMargin: menu.price - menu.hpp,
                marginRate: (menu.price - menu.hpp) / menu.price,
                conversion: row.addedToCart > 0 ? Math.min(row.sold / row.addedToCart, 1) : null,
            };
        });
}

export const RANKING_METRICS = {
    sold: { label: 'Terlaris', unit: 'porsi', description: 'Porsi terjual dari pesanan lunas' },
    revenue: { label: 'Omzet', unit: 'rupiah', description: 'Omzet sebelum pajak' },
    profit: { label: 'Laba', unit: 'rupiah', description: 'Laba kotor (harga − HPP)' },
    addedToCart: { label: 'Diminati', unit: 'kali', description: 'Berapa kali ditambahkan ke keranjang' },
};

/** Urutkan dari terbesar untuk metrik tertentu. */
export const rankBy = (stats, metric) => [...stats].sort((a, b) => b[metric] - a[metric]);

/** ID menu terlaris (dipakai untuk label "Terlaris" di halaman pelanggan). */
export const bestSellerIds = (rows, count = 3) =>
    [...rows]
        .sort((a, b) => b.sold - a.sold)
        .slice(0, count)
        .map((row) => row.menuId);

export const MATRIX_GROUPS = {
    bintang: { title: 'Bintang', subtitle: 'Laku & untung besar', advice: 'Pertahankan kualitas dan tampilkan paling atas di menu.', tone: 'gold' },
    andalan: { title: 'Andalan', subtitle: 'Laku tapi untung tipis', advice: 'Pertimbangkan naikkan harga sedikit atau tekan HPP.', tone: 'info' },
    potensi: { title: 'Potensi', subtitle: 'Untung besar tapi jarang dipesan', advice: 'Promosikan: foto lebih menarik, label rekomendasi, atau paket.', tone: 'success' },
    evaluasi: { title: 'Evaluasi', subtitle: 'Jarang dipesan & untung tipis', advice: 'Ubah resep/harga, gabungkan ke paket, atau pertimbangkan dihapus.', tone: 'neutral' },
};

/**
 * Klasifikasi menu:
 * - Laku     : porsi ≥ 70% dari rata-rata porsi per menu (aturan 70% Kasavana & Smith)
 * - Untung besar : laba per porsi ≥ rata-rata tertimbang laba per porsi
 */
export function classifyMenus(stats) {
    const totalSold = stats.reduce((sum, row) => sum + row.sold, 0);
    const popularThreshold = stats.length ? (totalSold / stats.length) * 0.7 : 0;
    const averageMargin = totalSold ? stats.reduce((sum, row) => sum + row.unitMargin * row.sold, 0) / totalSold : 0;

    const groups = { bintang: [], andalan: [], potensi: [], evaluasi: [] };
    stats.forEach((row) => {
        const popular = row.sold >= popularThreshold;
        const profitable = row.unitMargin >= averageMargin;
        const key = popular ? (profitable ? 'bintang' : 'andalan') : profitable ? 'potensi' : 'evaluasi';
        groups[key].push(row);
    });
    Object.values(groups).forEach((list) => list.sort((a, b) => b.sold - a.sold));
    return { groups, popularThreshold, averageMargin };
}

/** Temuan otomatis yang layak ditindaklanjuti pemilik (maksimal `limit` per jenis). */
export function findInsights(stats, limit = 3) {
    const lowConversion = stats
        .filter((row) => row.menu.available && row.addedToCart >= 10 && row.conversion !== null && row.conversion < 0.6)
        .sort((a, b) => a.conversion - b.conversion)
        .slice(0, limit);
    const wantedButSoldOut = stats
        .filter((row) => !row.menu.available && row.views >= 10)
        .sort((a, b) => b.views - a.views)
        .slice(0, limit);
    return { lowConversion, wantedButSoldOut };
}
