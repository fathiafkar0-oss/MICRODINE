import { useEffect, useRef } from 'react';

/**
 * Panggil `onSeen` sekali ketika elemen terlihat ≥ 60% selama `delay` ms
 * (mis. untuk mencatat menu yang benar-benar dilihat pelanggan, bukan sekadar terlewat saat menggulir).
 */
export default function useSeenOnScreen(onSeen, delay = 1000) {
    const ref = useRef(null);
    const callback = useRef(onSeen);
    callback.current = onSeen;

    useEffect(() => {
        const element = ref.current;
        if (!element || typeof IntersectionObserver === 'undefined') return undefined;
        let timer;
        const observer = new IntersectionObserver(
            ([entry]) => {
                clearTimeout(timer);
                if (entry.isIntersecting) {
                    timer = setTimeout(() => {
                        callback.current();
                        observer.disconnect();
                    }, delay);
                }
            },
            { threshold: 0.6 },
        );
        observer.observe(element);
        return () => {
            clearTimeout(timer);
            observer.disconnect();
        };
    }, [delay]);

    return ref;
}
