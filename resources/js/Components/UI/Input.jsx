import { useId } from 'react';

import { cx } from '@/Utils/classNames';

const FIELD = 'flex items-center gap-2.5 rounded-xl border border-line-strong bg-raised px-3.5 transition focus-within:border-navy';
const SIZES = { sm: 'h-10 text-sm', md: 'h-11 text-[15px]', lg: 'h-12 text-[15px]' };

/** Label + teks bantuan + pesan error, dipakai bersama Input/Select/Textarea. */
function Field({ id, label, hint, error, labelClassName = '', className = '', children }) {
    return (
        <div className={className}>
            {label && (
                <label htmlFor={id} className={cx('mb-1.5 block text-sm font-bold', labelClassName)}>
                    {label}
                </label>
            )}
            {children}
            {error ? <p className="mt-1.5 text-xs font-semibold text-danger">{error}</p> : hint && <p className="mt-1.5 text-xs text-faint">{hint}</p>}
        </div>
    );
}

/**
 * Input teks MICRODINE.
 *   <Input label="Nama pemesan" icon={User} placeholder="Mis. Andi" />
 *   <Input label="Harga jual" prefix="Rp" currency value={price} onValueChange={setPrice} />
 * `currency` = tampil 33.000, nilai yang dikirim ke onValueChange berupa angka 33000.
 */
export default function Input({
    id,
    label,
    hint,
    error,
    icon: Icon,
    prefix,
    trailing,
    size = 'md',
    currency = false,
    value,
    onChange,
    onValueChange,
    className = '',
    fieldClassName = '',
    labelClassName = '',
    inputClassName = '',
    ...props
}) {
    const autoId = useId();
    const inputId = id ?? autoId;
    const shown = currency ? (Number(value) ? Number(value).toLocaleString('id-ID') : '') : value;

    const handleChange = (event) => {
        if (currency) {
            onValueChange?.(Number(event.target.value.replace(/\D/g, '')) || 0);
            return;
        }
        onChange?.(event);
        onValueChange?.(event.target.value);
    };

    return (
        <Field id={inputId} label={label} hint={hint} error={error} className={className} labelClassName={labelClassName}>
            <div className={cx(FIELD, SIZES[size], error && 'border-danger', fieldClassName)}>
                {Icon && <Icon className="h-[18px] w-[18px] shrink-0 text-faint" aria-hidden="true" />}
                {prefix && <span className="text-sm font-semibold text-faint">{prefix}</span>}
                <input
                    id={inputId}
                    value={shown}
                    onChange={handleChange}
                    inputMode={currency ? 'numeric' : props.inputMode}
                    aria-invalid={Boolean(error) || undefined}
                    className={cx('h-full min-w-0 flex-1 bg-transparent text-ink outline-none placeholder:text-faint', inputClassName)}
                    {...props}
                />
                {trailing}
            </div>
        </Field>
    );
}

/** Dropdown dengan gaya yang sama dengan Input. */
export function Select({ id, label, hint, error, size = 'md', className = '', children, ...props }) {
    const autoId = useId();
    const selectId = id ?? autoId;
    return (
        <Field id={selectId} label={label} hint={hint} error={error} className={className}>
            <select id={selectId} className={cx(FIELD, SIZES[size], 'w-full font-semibold text-navy outline-none')} {...props}>
                {children}
            </select>
        </Field>
    );
}

/** Area teks beberapa baris. */
export function Textarea({ id, label, hint, error, rows = 3, className = '', ...props }) {
    const autoId = useId();
    const areaId = id ?? autoId;
    return (
        <Field id={areaId} label={label} hint={hint} error={error} className={className}>
            <textarea id={areaId} rows={rows} className="w-full rounded-xl border border-line-strong bg-raised px-3.5 py-2.5 text-[15px] outline-none focus:border-navy" {...props} />
        </Field>
    );
}
