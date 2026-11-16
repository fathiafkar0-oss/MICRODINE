import { cx } from '@/Utils/classNames';

/** Kartu angka ringkas (ikon dalam ubin + label + nilai). */
export default function StatCard({ icon: Icon, label, value, hint, tone = 'neutral', highlight = false, className = '' }) {
    const tile = {
        neutral: 'bg-raised text-soft',
        warn: 'bg-warn-tint text-warn',
        info: 'bg-info-tint text-info',
        success: 'bg-success-tint text-success',
        gold: 'bg-gold-tint text-warn',
    }[tone];

    return (
        <div className={cx('flex items-center gap-3 rounded-2xl border bg-panel px-4 py-3.5', highlight ? 'border-gold' : 'border-line', className)}>
            {Icon && (
                <span className={cx('grid h-10 w-10 shrink-0 place-items-center rounded-xl', tile)}>
                    <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
            )}
            <div className="min-w-0">
                <p className="text-xs text-faint">{label}</p>
                <p className="truncate text-lg font-extrabold text-navy">{value}</p>
                {hint && <p className="text-xs text-faint">{hint}</p>}
            </div>
        </div>
    );
}
