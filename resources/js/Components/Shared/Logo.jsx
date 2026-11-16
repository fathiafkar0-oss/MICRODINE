import { ChefHat } from 'lucide-react';

import { cx } from '@/Utils/classNames';

/** Logo MICRODINE: ubin emas berikon topi koki + nama merek. */
export default function Logo({ subtitle, size = 'md', light = true, className = '' }) {
    const tile = size === 'lg' ? 'h-12 w-12 rounded-xl' : 'h-10 w-10 rounded-[10px]';
    const icon = size === 'lg' ? 'h-6 w-6' : 'h-5 w-5';

    return (
        <div className={cx('flex items-center gap-3', className)}>
            <span className={cx('grid shrink-0 place-items-center bg-gold text-obsidian', tile)}>
                <ChefHat className={icon} aria-hidden="true" />
            </span>
            <span className="flex flex-col leading-tight">
                <span className={cx('font-extrabold tracking-wide', size === 'lg' ? 'text-xl' : 'text-[15px]', light ? 'text-white' : 'text-navy')}>
                    MICRODINE
                </span>
                {subtitle && <span className={cx('text-xs', light ? 'text-white/70' : 'text-faint')}>{subtitle}</span>}
            </span>
        </div>
    );
}
