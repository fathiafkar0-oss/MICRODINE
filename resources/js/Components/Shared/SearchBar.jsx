import { Search, X } from 'lucide-react';

import { cx } from '@/Utils/classNames';

/**
 * Kolom pencarian dengan ikon kaca pembesar dan tombol hapus.
 * size: 'sm' (toolbar staf) | 'lg' (halaman pelanggan)
 */
export default function SearchBar({ value, onChange, placeholder = 'Cari...', label = 'Cari', size = 'sm', className = '' }) {
    return (
        <label
            className={cx(
                'flex items-center gap-2 border bg-panel transition focus-within:border-navy',
                size === 'lg' ? 'h-12 rounded-2xl border-line-strong px-4' : 'h-10 rounded-xl border-line px-3',
                className,
            )}
        >
            <Search className={cx('shrink-0 text-faint', size === 'lg' ? 'h-[18px] w-[18px]' : 'h-4 w-4')} aria-hidden="true" />
            <span className="sr-only">{label}</span>
            <input
                type="search"
                value={value}
                onChange={(event) => onChange(event.target.value)}
                placeholder={placeholder}
                className={cx('h-full min-w-0 flex-1 bg-transparent outline-none placeholder:text-faint [&::-webkit-search-cancel-button]:hidden', size === 'lg' ? 'text-[15px]' : 'text-sm')}
            />
            {value && (
                <button type="button" onClick={() => onChange('')} aria-label="Hapus pencarian" className="grid h-6 w-6 place-items-center rounded-full text-faint hover:bg-raised hover:text-ink">
                    <X className="h-3.5 w-3.5" />
                </button>
            )}
        </label>
    );
}
