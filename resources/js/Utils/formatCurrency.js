/** Format angka menjadi Rupiah, mis. 63800 -> "Rp 63.800". */
export function formatCurrency(value) {
    return `Rp ${Math.round(Number(value) || 0).toLocaleString('id-ID')}`;
}

/** Persentase gaya Indonesia, mis. 0.337 -> "34%" atau "33,7%" (digits = 1). */
export function formatPercent(ratio, digits = 0) {
    return `${(ratio * 100).toLocaleString('id-ID', {
        minimumFractionDigits: digits,
        maximumFractionDigits: digits,
    })}%`;
}

/** Ubah teks input jadi angka (hanya digit), mis. "33.000" -> 33000. */
export function parseCurrencyInput(text) {
    return Number(String(text).replace(/\D/g, '')) || 0;
}

/** Jumlah item pada daftar pesanan. */
export function countItems(items = []) {
    return items.reduce((sum, item) => sum + item.qty, 0);
}

/**
 * Hitung tagihan. Pajak daerah (PBJT/PB1) bisa dimatikan admin, jadi tarifnya
 * dikirim sebagai parameter (0 = tidak dipungut).
 * Omzet & laba di laporan memakai `subtotal` (sebelum pajak).
 */
export function calculateBill(items = [], taxRate = 0) {
    const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
    const tax = Math.round(subtotal * taxRate);
    return { subtotal, tax, total: subtotal + tax };
}

/** Total HPP dari snapshot item pesanan. */
export function calculateCost(items = []) {
    return items.reduce((sum, item) => sum + item.hpp * item.qty, 0);
}
