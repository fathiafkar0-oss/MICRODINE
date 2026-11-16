import { useId } from 'react';

/**
 * Kolom isian bergaya iOS: sudut membulat, latar putih lembut,
 * cincin fokus emas yang halus. Khusus portal karyawan.
 */
export default function LoginField({ label, icon: Icon, trailing, className = '', ...props }) {
    const id = useId();

    return (
        <div className={className}>
            <label htmlFor={id} className="ml-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-soft">
                {label}
            </label>
            <div className="group mt-2 flex h-[52px] items-center gap-3 rounded-[14px] border border-ivory-line bg-white px-4 shadow-[inset_0_1px_2px_rgba(10,29,75,0.04)] transition-[border-color,box-shadow] duration-300 hover:border-line-strong focus-within:border-gold focus-within:shadow-[0_0_0_4px_rgba(204,158,74,0.18)] has-[[aria-invalid=true]]:border-crimson/60 has-[[aria-invalid=true]]:shadow-[0_0_0_4px_rgba(158,14,24,0.08)]">
                {Icon && <Icon className="h-[18px] w-[18px] shrink-0 text-faint transition-colors duration-300 group-focus-within:text-gold" strokeWidth={1.6} aria-hidden="true" />}
                <input id={id} className="h-full min-w-0 flex-1 bg-transparent text-[15px] text-ink outline-none placeholder:text-faint/70" {...props} />
                {trailing}
            </div>
        </div>
    );
}
