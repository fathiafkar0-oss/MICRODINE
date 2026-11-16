import { useEffect, useRef, useState } from 'react';

/**
 * Menandai elemen "terlihat" saat pertama kali masuk layar (sekali saja, tidak berulang).
 *   const [ref, visible] = useReveal();
 *   <section ref={ref} className={visible ? 'opacity-100' : 'opacity-0'}>
 * Jika browser tidak mendukung IntersectionObserver, elemen langsung ditampilkan.
 */
export default function useReveal({ threshold = 0.15, rootMargin = '0px 0px -8% 0px' } = {}) {
    const ref = useRef(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const element = ref.current;
        if (!element || typeof IntersectionObserver === 'undefined') {
            setVisible(true);
            return undefined;
        }
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setVisible(true);
                    observer.disconnect();
                }
            },
            { threshold, rootMargin },
        );
        observer.observe(element);
        return () => observer.disconnect();
    }, [threshold, rootMargin]);

    return [ref, visible];
}
