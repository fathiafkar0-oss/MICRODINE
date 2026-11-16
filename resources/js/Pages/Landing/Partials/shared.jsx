import { Link } from '@inertiajs/react';
import { ArrowUpRight, ChefHat } from 'lucide-react';

import { cx } from '@/Utils/classNames';

/** Tujuan tombol di halaman awal. Meja 07 dipakai sebagai meja demo. */
export const LINKS = { order: '/meja/07', staff: '/staf/masuk' };

/** Teks miring emas di atas judul, diapit dua garis tipis. */
export function Kicker({ children, className = 'text-gold' }) {
    return (
        <p className={cx('flex items-center justify-center gap-3 font-script text-2xl sm:text-[1.75rem]', className)}>
            <span className="h-px w-8 bg-current opacity-60" aria-hidden="true" />
            {children}
            <span className="h-px w-8 bg-current opacity-60" aria-hidden="true" />
        </p>
    );
}

/** Judul bagian dengan huruf serif. */
export function SectionTitle({ as: Tag = 'h2', className = '', children }) {
    return <Tag className={cx('font-display text-4xl font-semibold leading-[1.08] sm:text-[3.25rem]', className)}>{children}</Tag>;
}

const BUTTON_VARIANTS = {
    crimson: 'bg-crimson text-ivory hover:bg-crimson-dark',
    outlineLight: 'border border-ivory/70 text-ivory hover:bg-ivory hover:text-navy',
    outlineNavy: 'border border-navy text-navy hover:bg-navy hover:text-ivory',
};

/** Tombol bersudut tegas dengan huruf kapital renggang (gaya halaman awal, bukan gaya aplikasi). */
export function LandingButton({ href, variant = 'crimson', className = '', children }) {
    return (
        <Link
            href={href}
            className={cx(
                'inline-flex items-center justify-center gap-2 px-7 py-3.5 text-[13px] font-semibold uppercase tracking-[0.2em] transition-colors',
                BUTTON_VARIANTS[variant],
                className,
            )}
        >
            {children}
            <ArrowUpRight className="h-4 w-4" strokeWidth={1.6} aria-hidden="true" />
        </Link>
    );
}

/** Logo bulat bergaris emas + nama merek serif. */
export function LandingLogo({ size = 'md' }) {
    return (
        <span className="flex items-center gap-3 text-ivory">
            <span className={cx('grid place-items-center rounded-full border border-gold/80', size === 'md' ? 'h-11 w-11' : 'h-10 w-10')}>
                <ChefHat className="h-[18px] w-[18px] text-gold" strokeWidth={1.4} aria-hidden="true" />
            </span>
            <span className={cx('font-display font-semibold tracking-[0.14em]', size === 'md' ? 'text-2xl' : 'text-xl')}>MICRODINE</span>
        </span>
    );
}
