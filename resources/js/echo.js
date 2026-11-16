import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

/**
 * Modul G (Real-Time) — klien WebSocket Laravel Reverb.
 *
 * Otorisasi private channel (lihat routes/channels.php) memakai meta tag
 * `csrf-token` di resources/views/app.blade.php + cookie sesi staf yang
 * sedang login (dikirim otomatis karena permintaan ke `/broadcasting/auth`
 * sama origin dengan halaman).
 *
 * Variabel VITE_REVERB_* diisi dari .env (lihat .env.example). Jika belum
 * diisi (mis. di sandbox tanpa `php artisan reverb:start` berjalan), Echo
 * tetap dibuat tapi koneksi WebSocket akan gagal diam-diam — halaman yang
 * memanggil `window.Echo` tetap berfungsi normal, hanya tanpa live update.
 */
window.Pusher = Pusher;

// Jangan buka koneksi WebSocket kalau VITE_REVERB_APP_KEY belum diisi (mis.
// build tanpa `php artisan reverb:start` berjalan) — biarkan window.Echo
// kosong, halaman yang memanggilnya (lihat Hooks/useLiveReload.js) cukup
// mengecek `window.Echo` sebelum subscribe.
if (import.meta.env.VITE_REVERB_APP_KEY) {
    window.Echo = new Echo({
        broadcaster: 'reverb',
        key: import.meta.env.VITE_REVERB_APP_KEY,
        wsHost: import.meta.env.VITE_REVERB_HOST,
        wsPort: import.meta.env.VITE_REVERB_PORT ?? 80,
        wssPort: import.meta.env.VITE_REVERB_PORT ?? 443,
        forceTLS: (import.meta.env.VITE_REVERB_SCHEME ?? 'https') === 'https',
        enabledTransports: ['ws', 'wss'],
    });
}

export default window.Echo;
