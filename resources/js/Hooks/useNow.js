import { useEffect, useState } from 'react';

/** Waktu sekarang yang diperbarui berkala (default tiap 30 detik), untuk jam di layar. */
export default function useNow(intervalMs = 30000) {
    const [now, setNow] = useState(() => new Date());

    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), intervalMs);
        return () => clearInterval(timer);
    }, [intervalMs]);

    return now;
}
