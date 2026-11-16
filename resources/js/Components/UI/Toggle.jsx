import { cx } from '@/Utils/classNames';

/** Sakelar aktif/nonaktif dengan label teks di sebelahnya. */
export default function Toggle({ checked, onChange, label, onLabel = 'Aktif', offLabel = 'Nonaktif' }) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            aria-label={label}
            onClick={() => onChange(!checked)}
            className="inline-flex items-center gap-2 text-[13px] font-semibold"
        >
            <span className={cx('relative h-6 w-11 rounded-full transition', checked ? 'bg-success' : 'bg-line-strong')}>
                <span className={cx('absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all', checked ? 'left-[22px]' : 'left-0.5')} />
            </span>
            <span className={checked ? 'text-success' : 'text-faint'}>{checked ? onLabel : offLabel}</span>
        </button>
    );
}
