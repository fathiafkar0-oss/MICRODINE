import { cx } from '@/Utils/classNames';

/**
 * Deretan tombol pil untuk memfilter (kategori menu, status pesanan, ...).
 * options: ['Semua', 'Makanan'] atau [{ value, label, count }]
 */
export default function FilterChips({ options, value, onChange, label, scrollable = false, className = '' }) {
    const normalized = options.map((option) => (typeof option === 'string' ? { value: option, label: option } : option));

    return (
        <div className={cx('flex gap-2', scrollable ? 'scrollbar-none overflow-x-auto' : 'flex-wrap', className)} role="group" aria-label={label}>
            {normalized.map((option) => (
                <button
                    key={option.value}
                    type="button"
                    onClick={() => onChange(option.value)}
                    aria-pressed={value === option.value}
                    className={cx(
                        'h-9 shrink-0 rounded-full border px-4 text-sm font-semibold transition',
                        value === option.value ? 'border-navy bg-navy text-white' : 'border-line-strong bg-panel text-navy hover:bg-raised',
                    )}
                >
                    {option.label}
                    {option.count !== undefined && <span className="ml-1 opacity-70">({option.count})</span>}
                </button>
            ))}
        </div>
    );
}

/** Pilihan segmen kecil (mis. Semua / Tunai / QRIS). */
export function SegmentedControl({ options, value, onChange, label, className = '' }) {
    return (
        <div className={cx('flex overflow-hidden rounded-xl border border-line-strong', className)} role="group" aria-label={label}>
            {options.map((option) => (
                <button
                    key={option.value}
                    type="button"
                    aria-pressed={value === option.value}
                    onClick={() => onChange(option.value)}
                    className={cx(
                        'h-10 flex-1 whitespace-nowrap border-l border-line-strong px-4 text-sm font-semibold first:border-l-0',
                        value === option.value ? 'bg-gold text-obsidian' : 'bg-panel text-navy hover:bg-raised',
                    )}
                >
                    {option.label}
                </button>
            ))}
        </div>
    );
}
