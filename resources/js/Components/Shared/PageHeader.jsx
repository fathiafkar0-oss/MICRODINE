import { cx } from '@/Utils/classNames';

/**
 * Judul halaman staf: label kecil emas (opsional), judul serif klasik, keterangan, dan aksi di kanan.
 */
export default function PageHeader({ eyebrow, title, subtitle, actions, className = '' }) {
    return (
        <div className={cx('mb-7 flex flex-wrap items-end justify-between gap-4', className)}>
            <div>
                {eyebrow && <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-gold">{eyebrow}</p>}
                <h1 className="font-display text-[2.1rem] font-semibold leading-[1.05] text-navy md:text-[2.5rem]">{title}</h1>
                {subtitle && <p className="mt-1.5 text-sm text-faint">{subtitle}</p>}
            </div>
            {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
        </div>
    );
}
