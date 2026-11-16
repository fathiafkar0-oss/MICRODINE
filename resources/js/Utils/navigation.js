/**
 * Cari tautan menu yang aktif: awalan URL terpanjang yang cocok.
 * Contoh: URL /kasir/meja -> aktif "/kasir/meja", bukan "/kasir".
 */
export function findActiveHref(url, sections) {
    const path = url.split('?')[0];
    return sections
        .flatMap((section) => section.items.map((item) => item.href))
        .filter((href) => path === href || path.startsWith(`${href}/`))
        .sort((a, b) => b.length - a.length)[0];
}

/** Gabungkan item semua bagian menu tanpa duplikat (untuk navigasi bawah ponsel). */
export function flattenNav(sections) {
    const seen = new Set();
    return sections
        .flatMap((section) => section.items)
        .filter((item) => {
            if (seen.has(item.href)) return false;
            seen.add(item.href);
            return true;
        });
}
