import { useEffect, useState } from 'react';

import { formatCountdown } from '@/Utils/formatDate';

/** Hitung mundur ke `deadline` (timestamp ms). Mengembalikan sisa detik & label "09:42". */
export default function useCountdown(deadline) {
    const [now, setNow] = useState(() => Date.now());

    useEffect(() => {
        const timer = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(timer);
    }, []);

    const secondsLeft = Math.max(0, Math.floor((deadline - now) / 1000));
    return { secondsLeft, label: formatCountdown(secondsLeft), expired: secondsLeft === 0 };
}
