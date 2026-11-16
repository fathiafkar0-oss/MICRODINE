import { Link } from '@inertiajs/react';

import { cx } from '@/Utils/classNames';

const VARIANTS = {
    gold: 'bg-gold text-obsidian shadow-[0_8px_18px_-10px_rgba(204,158,74,0.9)] hover:bg-gold-hover',
    navy: 'bg-navy text-white shadow-[0_8px_18px_-10px_rgba(10,29,75,0.8)] hover:bg-navy-hover',
    outline: 'border border-line-strong bg-panel text-ink hover:border-gold/60 hover:bg-raised',
    ghost: 'text-soft hover:bg-raised hover:text-ink',
    danger: 'bg-danger-tint text-danger hover:bg-danger hover:text-white',
};

const SIZES = {
    sm: 'h-9 rounded-[11px] px-3.5 text-[13px]',
    md: 'h-11 rounded-[13px] px-5 text-sm',
    lg: 'h-14 rounded-[16px] px-6 text-base',
};

/**
 * Tombol MICRODINE: sudut membulat ala iOS, mengecil sedikit saat ditekan.
 * Isi `href` untuk tautan Inertia, selebihnya berperilaku seperti <button>.
 */
export default function Button({ variant = 'gold', size = 'md', href, block = false, className = '', children, ...props }) {
    const classes = cx(
        'inline-flex items-center justify-center gap-2 font-bold transition-[background-color,border-color,color,box-shadow,transform] duration-200 ease-ios active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100',
        VARIANTS[variant],
        SIZES[size],
        block && 'w-full',
        className,
    );

    if (href) {
        return (
            <Link href={href} className={classes} {...props}>
                {children}
            </Link>
        );
    }

    return (
        <button type="button" className={classes} {...props}>
            {children}
        </button>
    );
}
