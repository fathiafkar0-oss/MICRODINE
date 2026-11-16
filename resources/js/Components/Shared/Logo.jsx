import { ChefHat } from 'lucide-react';

import { cx } from '@/Utils/classNames';

/**
 * Logo MICRODINE untuk halaman aplikasi: cincin emas berikon topi koki + nama serif
 * + nama portal kecil berhuruf kapital (mis. "PORTAL KASIR").
 */
export default function Logo({ subtitle, size = 'md', light = true, className = '' }) {
    const ring = size === 'lg' ? 'h-12 w-12' : 'h-10 w-10';
    const icon = size === 'lg' ? 'h-[22px] w-[22px]' : 'h-[18px] w-[18px]';

    return (
        <div className={cx('flex items-center gap-3', className)}>
            <span className={cx('grid shrink-0 place-items-center rounded-full border border-gold/80', light ? 'bg-white/[0.04]' : 'bg-gold-tint', ring)}>
                <ChefHat className={cx('text-gold', icon)} strokeWidth={1.5} aria-hidden="true" />
            </span>
            <span className="flex flex-col leading-tight">
                <span className={cx('font-display font-semibold tracking-[0.14em]', size === 'lg' ? 'text-2xl' : 'text-xl', light ? 'text-ivory' : 'text-navy')}>MICRODINE</span>
                {subtitle && <span className={cx('mt-0.5 text-[10px] font-semibold uppercase tracking-[0.22em]', light ? 'text-gold-soft/80' : 'text-faint')}>{subtitle}</span>}
            </span>
        </div>
    );
}
