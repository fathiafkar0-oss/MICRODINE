import { ChefHat } from 'lucide-react';

import { cx } from '@/Utils/classNames';

/**
 * Logo bergaya klasik: cincin emas + nama merek serif.
 * Dipakai di halaman awal dan portal karyawan (halaman aplikasi memakai `Logo`).
 */
export default function ClassicLogo({ size = 'md', tone = 'light', className = '' }) {
    return (
        <span className={cx('flex items-center gap-3', tone === 'light' ? 'text-ivory' : 'text-navy', className)}>
            <span className={cx('grid shrink-0 place-items-center rounded-full border border-gold/80', size === 'md' ? 'h-11 w-11' : 'h-10 w-10')}>
                <ChefHat className="h-[18px] w-[18px] text-gold" strokeWidth={1.4} aria-hidden="true" />
            </span>
            <span className={cx('font-display font-semibold tracking-[0.14em]', size === 'md' ? 'text-2xl' : 'text-xl')}>MICRODINE</span>
        </span>
    );
}
