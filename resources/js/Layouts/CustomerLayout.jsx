import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Utensils } from 'lucide-react';

import { cx } from '@/Utils/classNames';

/**
 * Kerangka halaman pelanggan (mobile-first, lebar maks. 480px di layar besar).
 * - `header` menggantikan header bawaan (judul + tombol kembali + pil meja)
 * - `bottom` berisi tombol aksi yang menempel di bawah layar
 */
export default function CustomerLayout({ title, table, backHref, header, bottom, className = '', children }) {
    return (
        <div className="min-h-dvh bg-canvas">
            <Head title={title} />
            <div className={cx('mx-auto flex min-h-dvh w-full max-w-[480px] flex-col', bottom && 'pb-28')}>
                {header ?? (
                    <header className="sticky top-0 z-30 flex items-center justify-between gap-3 bg-canvas/95 px-5 pb-3 pt-5 backdrop-blur">
                        <div className="flex min-w-0 items-center gap-3">
                            {backHref && (
                                <Link href={backHref} aria-label="Kembali" className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-panel text-navy shadow-[var(--shadow-soft)] transition hover:bg-raised active:scale-95">
                                    <ArrowLeft className="h-5 w-5" />
                                </Link>
                            )}
                            <h1 className="truncate font-display text-[1.75rem] font-semibold leading-none text-navy">{title}</h1>
                        </div>
                        {table && <TablePill number={table} />}
                    </header>
                )}
                <main className={cx('flex-1 animate-page-fade px-5', className)}>{children}</main>
            </div>
            {bottom && (
                <div className="fixed inset-x-0 bottom-0 z-40 animate-sheet-in border-t border-line/80 bg-panel/85 backdrop-blur-xl backdrop-saturate-150">
                    <div className="mx-auto w-full max-w-[480px] px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-3">{bottom}</div>
                </div>
            )}
        </div>
    );
}

/** Pil "Meja 07" putih di header pelanggan. */
export function TablePill({ number, className = '' }) {
    return (
        <span className={cx('inline-flex shrink-0 items-center gap-1.5 rounded-full bg-panel px-3 py-1.5 text-sm font-bold text-navy shadow-[var(--shadow-soft)] ring-1 ring-gold/25', className)}>
            <Utensils className="h-4 w-4 text-gold" aria-hidden="true" />
            Meja {number}
        </span>
    );
}
