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
        <div className={cx('flex items-center gap-3 rounded-[18px] border bg-panel px-4 py-3.5 shadow-[var(--shadow-soft)]', highlight ? 'border-gold/70 ring-1 ring-gold/20' : 'border-line', className)}>
            {Icon && (
                <span className={cx('hidden h-10 w-10 shrink-0 place-items-center rounded-[12px] sm:grid', tile)}>
                    <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
            )}
            <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-faint">{label}</p>
                <p className="truncate text-lg font-extrabold tabular-nums text-navy">{value}</p>
                {hint && <p className="text-xs text-faint">{hint}</p>}
            </div>
        </div>
    );
}
