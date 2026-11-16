/** Tanggal panjang, mis. "Senin, 16 November 2026". */
export function formatLongDate(date = new Date()) {
    return date.toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
}

/** Jam:menit sekarang, mis. "12:04". */
export function formatTime(date = new Date()) {
    return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace('.', ':');
}

/** Hitung mundur detik -> "09:42". */
export function formatCountdown(seconds) {
    const safe = Math.max(0, seconds);
    return `${String(Math.floor(safe / 60)).padStart(2, '0')}:${String(safe % 60).padStart(2, '0')}`;
}

/** Nama hari singkat, indeks 0 = Minggu. */
export const SHORT_DAY_NAMES = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
