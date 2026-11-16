/**
 * Pencatatan minat pelanggan terhadap menu (sumber data "Paling diminati" di Analisis Menu).
 *   type 'lihat'     : kartu menu tampil di layar ≥ 1 detik
 *   type 'keranjang' : menu ditambahkan ke keranjang
 * Setiap menu hanya dicatat sekali per jenis per sesi browser (agar tekan berulang tidak menggelembungkan angka).
 *
 * Fase frontend: hanya disimpan di localStorage ('microdine.interactions') untuk demo.
 * Backend: set SEND_TO_SERVER = true → POST /meja/{table}/interaksi { menu_id, type }
 * (disimpan ke tabel menu_interactions: menu_id, type, table_session_id, created_at).
 */
const SEND_TO_SERVER = false;
const SEEN_KEY = 'microdine.interactions.seen';
const LOG_KEY = 'microdine.interactions';

function readJson(storage, key, fallback) {
    try {
        return JSON.parse(storage.getItem(key)) ?? fallback;
    } catch {
        return fallback;
    }
}

export function trackMenuInteraction(table, menuId, type) {
    if (typeof window === 'undefined') return;
    try {
        const seen = readJson(window.sessionStorage, SEEN_KEY, []);
        const key = `${table}:${menuId}:${type}`;
        if (seen.includes(key)) return;
        window.sessionStorage.setItem(SEEN_KEY, JSON.stringify([...seen, key]));

        if (SEND_TO_SERVER) {
            fetch(`/meja/${table}/interaksi`, {
                method: 'POST',
                keepalive: true,
                headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
                body: JSON.stringify({ menu_id: menuId, type }),
            }).catch(() => {});
            return;
        }
        const log = readJson(window.localStorage, LOG_KEY, []);
        window.localStorage.setItem(LOG_KEY, JSON.stringify([...log.slice(-199), { table, menuId, type, at: new Date().toISOString() }]));
    } catch {
        // Penyimpanan browser bisa diblokir (mode privat); pencatatan minat bukan fitur wajib.
    }
}
