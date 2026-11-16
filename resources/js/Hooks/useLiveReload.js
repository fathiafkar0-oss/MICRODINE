import { router } from '@inertiajs/react';
import { useEffect } from 'react';

/**
 * Modul G (Real-Time) — dengarkan satu private channel Reverb lalu
 * `router.reload()` otomatis (hanya prop yang relevan) saat salah satu
 * event yang didaftarkan masuk. Dipakai di layar yang butuh update tanpa
 * refresh manual: Kitchen/Dashboard, Cashier/Dashboard, Cashier/Tables.
 *
 * Diam-diam tidak melakukan apa-apa jika `window.Echo` belum tersedia
 * (lihat resources/js/echo.js — terjadi saat VITE_REVERB_APP_KEY kosong),
 * supaya halaman tetap berfungsi normal tanpa live update di lingkungan
 * yang belum menjalankan `php artisan reverb:start`.
 *
 * @param {string} channelName - nama private channel, mis. "kitchen.kds".
 * @param {string[]} eventNames - nama event broadcast, mis. [".order.paid"].
 * @param {string[]} only - prop Inertia yang diminta ulang (partial reload).
 */
export default function useLiveReload(channelName, eventNames, only) {
    useEffect(() => {
        if (!window.Echo) return undefined;

        const channel = window.Echo.private(channelName);
        const reload = () => router.reload({ only });
        eventNames.forEach((eventName) => channel.listen(eventName, reload));

        return () => {
            window.Echo.leave(channelName);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [channelName]);
}
