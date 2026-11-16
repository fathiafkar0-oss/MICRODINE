import { cx } from '@/Utils/classNames';

const PADDING = { none: '', sm: 'p-3', md: 'p-4', lg: 'p-5' };

/**
 * Kartu putih gading bersudut besar.
 * variant: 'outline' (bergaris, untuk halaman staf) | 'plain' (tanpa garis, untuk halaman pelanggan)
 */
export default function Card({ as: Tag = 'section', variant = 'outline', padding = 'lg', className = '', children, ...props }) {
    return (
        <Tag className={cx('rounded-[20px] bg-panel', variant === 'outline' ? 'border border-line' : 'shadow-[0_1px_0_rgba(23,23,33,0.04)]', PADDING[padding], className)} {...props}>
            {children}
        </Tag>
    );
}

/** Judul kartu dengan ikon opsional, keterangan, dan aksi di kanan. */
export function CardHeader({ icon: Icon, title, subtitle, action, className = '' }) {
    return (
        <div className={cx('mb-4 flex flex-wrap items-start justify-between gap-3', className)}>
            <div className="flex items-center gap-2.5">
                {Icon && (
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gold-tint text-warn">
                        <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
                    </span>
                )}
                <div>
                    <h2 className="font-extrabold text-navy">{title}</h2>
                    {subtitle && <p className="text-xs text-faint">{subtitle}</p>}
                </div>
            </div>
            {action}
        </div>
    );
}
