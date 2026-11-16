import { Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';

import LiveBadge from '@/Components/Shared/LiveBadge';
import { formatLongDate } from '@/Utils/formatDate';

/**
 * Kerangka layar dapur (Kitchen Display System): layar penuh tanpa sidebar,
 * header navy berisi judul + `summary` (kartu ringkasan), teks besar agar terbaca dari jauh.
 */
export default function KitchenLayout({ title = 'Antrean Dapur', summary, children }) {
    return (
        <div className="min-h-dvh bg-canvas">
            <Head title="Layar Dapur" />
            <header className="bg-navy px-5 pb-6 pt-5 text-white md:px-8">
                <div className="mx-auto max-w-[1500px]">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                            <Link href="/kasir" className="mb-2 inline-flex items-center gap-1.5 text-xs font-semibold text-white/70 hover:text-white">
                                <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
                                Kembali ke kasir
                            </Link>
                            <h1 className="text-3xl font-extrabold">{title}</h1>
                            <p className="text-sm text-white/75">{formatLongDate()} · Shift pagi</p>
                        </div>
                        <LiveBadge />
                    </div>
                    {summary && <div className="mt-5">{summary}</div>}
                </div>
            </header>
            <main className="mx-auto max-w-[1500px] px-5 py-6 md:px-8">{children}</main>
        </div>
    );
}
