/** Fungsi bantu seputar meja: nomor berikutnya, token QR, status terisi, URL QR. */

const TOKEN_CHARS = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789';

/** Batas nomor meja mengikuti route /meja/{table} yang dibatasi 2 digit. */
export const MAX_TABLE_NUMBER = 99;

/** Nomor dua digit, mis. 7 → "07". */
export const padTableNumber = (value) => String(Number(value)).padStart(2, '0');

/** Nomor kosong terkecil berikutnya (melewati nomor yang sudah dipakai, termasuk meja nonaktif). */
export function nextTableNumber(tables) {
    const used = new Set(tables.map((table) => Number(table.number)));
    for (let number = 1; number <= MAX_TABLE_NUMBER; number += 1) {
        if (!used.has(number)) return padTableNumber(number);
    }
    return null;
}

/** Token acak 5 karakter untuk URL QR. Backend nanti membuatnya di server (Str::random). */
export function makeQrToken(length = 5) {
    return Array.from({ length }, () => TOKEN_CHARS[Math.floor(Math.random() * TOKEN_CHARS.length)]).join('');
}

/** URL yang dicetak menjadi QR meja. */
export const tableQrUrl = (appUrl, table) => `${appUrl}/meja/${table.number}${table.qrToken ? `?k=${table.qrToken}` : ''}`;

/** Gabungan daftar area bawaan + area yang sudah dipakai meja, tanpa duplikat. */
export const listAreas = (tables, defaults = []) => [...new Set([...defaults, ...tables.map((table) => table.area)])];

/**
 * Fase frontend: status meja diturunkan dari pesanan aktif (meja dengan pesanan = Terisi).
 * Backend nanti mengirim status & sesi langsung dari tabel table_sessions.
 */
export function withSessions(tables, orders) {
    return tables.map((table) => {
        const active = orders.filter((order) => order.table === table.number);
        const oldest = [...active].sort((a, b) => b.minutesAgo - a.minutesAgo)[0];
        return {
            ...table,
            status: active.length ? 'terisi' : 'tersedia',
            session: oldest ? { code: oldest.code, customer: oldest.customer, minutes: oldest.minutesAgo } : null,
        };
    });
}
