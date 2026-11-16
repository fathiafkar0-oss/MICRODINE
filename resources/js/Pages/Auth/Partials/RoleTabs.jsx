import { cx } from '@/Utils/classNames';

/** Kurva gerak khas iOS: cepat di awal, mendarat sangat lembut. */
const IOS_EASE = 'ease-[cubic-bezier(0.32,0.72,0,1)]';

/** Pilihan peran bergaya segmented control iPhone: "pil" putih meluncur ke tab aktif. */
export default function RoleTabs({ roles, value, onChange }) {
    const index = Math.max(0, roles.findIndex((role) => role.id === value));

    return (
        <div className="relative grid rounded-[14px] bg-navy/[0.06] p-1" style={{ gridTemplateColumns: `repeat(${roles.length}, minmax(0, 1fr))` }} role="tablist" aria-label="Masuk sebagai">
            <span
                aria-hidden="true"
                className={cx('absolute bottom-1 top-1 rounded-[10px] bg-white shadow-[0_3px_8px_rgba(10,29,75,0.12),0_1px_1px_rgba(10,29,75,0.06)] transition-[left] duration-500', IOS_EASE)}
                style={{ width: `calc((100% - 8px) / ${roles.length})`, left: `calc(4px + (100% - 8px) * ${index} / ${roles.length})` }}
            />
            {roles.map(({ id, label, icon: Icon }) => {
                const selected = id === value;
                return (
                    <button
                        key={id}
                        type="button"
                        role="tab"
                        aria-selected={selected}
                        onClick={() => onChange(id)}
                        className={cx(
                            'relative z-[1] flex h-10 items-center justify-center gap-2 rounded-[10px] text-[13px] font-semibold transition-colors duration-300 active:scale-[0.97]',
                            selected ? 'text-navy' : 'text-soft hover:text-navy',
                        )}
                    >
                        <Icon className={cx('h-4 w-4 transition-colors duration-300', selected ? 'text-gold' : 'text-faint')} strokeWidth={1.7} aria-hidden="true" />
                        {label}
                    </button>
                );
            })}
        </div>
    );
}
