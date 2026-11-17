import { router } from '@inertiajs/react';
import { useEffect, useRef } from 'react';

/**
 * Modul G (Real-Time) — dengarkan satu private channel Reverb dan dukung
 * polling fallback otomatis setiap 3 detik (ARCHITECTURE.md Bab 6.3)
 * agar antrean kasir dan dapur tetap sinkron seketika di semua kondisi,
 * baik saat `php artisan reverb:start` aktif maupun saat demo dengan
 * `php artisan serve` standar.
 *
 * @param {string} channelName - nama private channel, mis. "kitchen.kds".
 * @param {string[]} eventNames - nama event broadcast, mis. [".order.paid"].
 * @param {string[]} only - prop Inertia yang diminta ulang (partial reload).
 */
export default function useLiveReload(channelName, eventNames, only) {
    const isReloadingRef = useRef(false);

    useEffect(() => {
        const reload = () => {
            if (isReloadingRef.current || (typeof document !== 'undefined' && document.hidden)) return;
            isReloadingRef.current = true;
            router.reload({
                only,
                preserveScroll: true,
                preserveState: true,
                onFinish: () => {
                    isReloadingRef.current = false;
                },
            });
        };

        // 1. WebSocket Reverb (jika server reverb berjalan)
        let channel = null;
        if (window.Echo) {
            try {
                channel = window.Echo.private(channelName);
                eventNames.forEach((eventName) => channel.listen(eventName, reload));
            } catch {
                // fall through to interval polling
            }
        }

        // 2. Polling fallback setiap 3 detik (ARCHITECTURE.md Bab 6.3)
        const interval = setInterval(reload, 3000);

        return () => {
            clearInterval(interval);
            if (channel && window.Echo) {
                try {
                    window.Echo.leave(channelName);
                } catch {
                    // ignore
                }
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [channelName]);
}
