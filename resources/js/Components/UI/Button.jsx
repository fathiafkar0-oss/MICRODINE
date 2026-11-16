import { Link } from '@inertiajs/react';

import { cx } from '@/Utils/classNames';

const VARIANTS = {
    gold: 'bg-gold text-obsidian hover:bg-gold-hover',
    navy: 'bg-navy text-white hover:bg-navy-hover',
    outline: 'border border-line-strong bg-panel text-ink hover:bg-raised',
    ghost: 'text-soft hover:bg-raised hover:text-ink',
    danger: 'bg-danger-tint text-danger hover:bg-danger hover:text-white',
};

const SIZES = {
    sm: 'h-9 px-3.5 text-[13px]',
    md: 'h-11 px-5 text-sm',
    lg: 'h-14 px-6 text-base',
};

/**
 * Tombol MICRODINE. Bentuk pil sesuai mockup proposal.
 * Isi `href` untuk tautan Inertia, selebihnya berperilaku seperti <button>.
 */
export default function Button({ variant = 'gold', size = 'md', href, block = false, className = '', children, ...props }) {
    const classes = cx(
        'inline-flex items-center justify-center gap-2 rounded-full font-bold transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50',
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
