import { cx } from '@/Utils/classNames';

/** Sakelar bergaya iPhone dengan label di kiri (mis. "Ingat saya di perangkat ini"). */
export default function IosSwitch({ checked, onChange, label, className = '' }) {
    return (
        <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)} className={cx('flex w-full items-center justify-between gap-4 text-left text-sm text-soft', className)}>
            {label}
            <span className={cx('relative h-[31px] w-[51px] shrink-0 rounded-full transition-colors duration-300', checked ? 'bg-navy' : 'bg-navy/15')}>
                <span
                    className={cx(
                        'absolute top-[2px] h-[27px] w-[27px] rounded-full bg-white shadow-[0_3px_8px_rgba(0,0,0,0.15),0_1px_1px_rgba(0,0,0,0.12)] transition-[left] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]',
                        checked ? 'left-[22px]' : 'left-[2px]',
                    )}
                />
            </span>
        </button>
    );
}
