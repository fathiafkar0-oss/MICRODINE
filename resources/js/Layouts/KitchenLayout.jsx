import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowLeft, LogOut } from 'lucide-react';

import LiveBadge from '@/Components/Shared/LiveBadge';
import { formatLongDate } from '@/Utils/formatDate';

/**
 * Kerangka layar dapur (Kitchen Display System): layar penuh tanpa sidebar,
 * header navy berisi judul + `summary` (kartu ringkasan), teks besar agar terbaca dari jauh.
 */
export default function KitchenLayout({ title = 'Antrean Dapur', summary, children }) {
    const { auth } = usePage().props;
    const user = auth?.user;

    return (
        <div className="min-h-dvh bg-canvas">
            <Head title="Layar Dapur" />
            <header className="border-b border-gold/25 bg-gradient-to-br from-navy to-navy-deep px-5 pb-7 pt-5 text-white md:px-8">
                <div className="mx-auto max-w-[1500px]">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                            {user?.role !== 'dapur' ? (
                                <Link href="/kasir" className="group mb-3 inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/60 transition-colors hover:text-gold-soft">
                                    <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" aria-hidden="true" />
                                    Kembali ke kasir
                                </Link>
                            ) : null}
                            <h1 className="animate-page-in font-display text-[2.6rem] font-semibold leading-none">{title}</h1>
                            <p className="mt-2 text-sm text-white/70">{formatLongDate()} · {user?.name ?? 'Staf Dapur'}</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <LiveBadge />
                            <Link
                                href="/logout"
                                method="post"
                                as="button"
                                aria-label="Keluar"
                                title="Keluar"
                                className="grid h-8 w-8 place-items-center rounded-lg border border-white/20 bg-white/5 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                            >
                                <LogOut className="h-4 w-4" />
                            </Link>
                        </div>
                    </div>
                    {summary && <div className="mt-6">{summary}</div>}
                </div>
            </header>
            <main className="mx-auto max-w-[1500px] animate-page-in px-5 py-7 md:px-8">{children}</main>
        </div>
    );
}
