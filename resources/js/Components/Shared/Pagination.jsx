import { ChevronLeft, ChevronRight } from 'lucide-react';

import { cx } from '@/Utils/classNames';

/** Nomor halaman yang ditampilkan: 1 … 4 5 6 … 20 */
function pageList(page, total) {
    if (total <= 7) return Array.from({ length: total }, (_, index) => index + 1);
    const pages = new Set([1, total, page - 1, page, page + 1]);
    const sorted = [...pages].filter((number) => number >= 1 && number <= total).sort((a, b) => a - b);
    return sorted.flatMap((number, index) => (index && number - sorted[index - 1] > 1 ? ['…', number] : [number]));
}

/** Navigasi halaman tabel. Backend Laravel: isi dari paginator (current_page, last_page). */
export default function Pagination({ page, totalPages, onChange, summary }) {
    const button = 'grid h-8 min-w-8 place-items-center rounded-lg px-2 text-sm font-bold transition';

    return (
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-faint">
            {summary && <span>{summary}</span>}
            {totalPages > 1 && (
                <nav className="flex items-center gap-1.5" aria-label="Halaman">
                    <button type="button" onClick={() => onChange(page - 1)} disabled={page === 1} aria-label="Halaman sebelumnya" className={cx(button, 'border border-line-strong bg-panel text-navy disabled:opacity-40')}>
                        <ChevronLeft className="h-4 w-4" />
                    </button>
                    {pageList(page, totalPages).map((number, index) =>
                        number === '…' ? (
                            <span key={`gap-${index}`} className="px-1">
                                …
                            </span>
                        ) : (
                            <button
                                key={number}
                                type="button"
                                aria-current={page === number ? 'page' : undefined}
                                onClick={() => onChange(number)}
                                className={cx(button, page === number ? 'bg-navy text-white' : 'border border-line-strong bg-panel text-navy hover:bg-raised')}
                            >
                                {number}
                            </button>
                        ),
                    )}
                    <button type="button" onClick={() => onChange(page + 1)} disabled={page === totalPages} aria-label="Halaman berikutnya" className={cx(button, 'border border-line-strong bg-panel text-navy disabled:opacity-40')}>
                        <ChevronRight className="h-4 w-4" />
                    </button>
                </nav>
            )}
        </div>
    );
}
