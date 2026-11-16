import useReveal from '@/Hooks/useReveal';
import { cx } from '@/Utils/classNames';

const HIDDEN = {
    up: 'translate-y-8 opacity-0',
    left: '-translate-x-8 opacity-0',
    right: 'translate-x-8 opacity-0',
    fade: 'opacity-0',
};

/**
 * Bungkus elemen agar muncul halus (naik/geser + memudar) saat di-scroll ke layar.
 *   <Reveal>...</Reveal>
 *   <Reveal from="left" delay={150}>...</Reveal>
 * `delay` (ms) dipakai untuk efek bergantian pada daftar kartu: delay={index * 120}.
 */
export default function Reveal({ as: Tag = 'div', from = 'up', delay = 0, className = '', children, ...props }) {
    const [ref, visible] = useReveal();

    return (
        <Tag
            ref={ref}
            style={{ transitionDelay: visible ? `${delay}ms` : '0ms' }}
            className={cx('transition duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform', visible ? 'translate-x-0 translate-y-0 opacity-100' : HIDDEN[from], className)}
            {...props}
        >
            {children}
        </Tag>
    );
}
