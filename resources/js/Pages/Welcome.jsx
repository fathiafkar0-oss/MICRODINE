import { Head, Link } from '@inertiajs/react';
import { ArrowRight, ChefHat, QrCode, Receipt, ShieldCheck } from 'lucide-react';

import Logo from '@/Components/Shared/Logo';
import Button from '@/Components/UI/Button';
import hero from '@images/menu/food.jpg';

const FEATURES = [
    { icon: QrCode, title: 'Scan QR di meja', text: 'Pelanggan memesan dari ponsel; teman semeja masuk ke sesi yang sama.' },
    { icon: ShieldCheck, title: 'Bayar di awal', text: 'Pesanan masuk dapur setelah lunas lewat QRIS atau tunai di kasir.' },
    { icon: ChefHat, title: 'Antrean real-time', text: 'Kasir dan dapur melihat pesanan baru tanpa memuat ulang halaman.' },
    { icon: Receipt, title: 'Laba akurat', text: 'HPP dikunci di setiap transaksi, laporan lama tidak berubah.' },
];

/**
 * Halaman awal. Untuk demo, tersedia jalan pintas ke alur pelanggan (Meja 07) dan portal staf.
 * Route: GET /
 */
export default function Welcome() {
    return (
        <div className="min-h-dvh bg-canvas">
            <Head title="Platform Manajemen Restoran" />
            <header className="bg-navy text-white">
                <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 md:px-8">
                    <Logo subtitle="Restoran skala mikro" />
                    <Button href="/staf/masuk" variant="gold" size="sm">
                        Masuk Staf
                    </Button>
                </div>
                <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 pb-14 pt-8 md:grid-cols-[1.1fr_1fr] md:px-8 md:pb-20 md:pt-12">
                    <div>
                        <p className="text-sm font-bold uppercase tracking-[0.16em] text-gold-soft">Kasir · Self-ordering · Laporan</p>
                        <h1 className="mt-3 text-4xl font-extrabold leading-[1.1] md:text-5xl">Pesan dari meja, bayar di awal, laba tercatat rapi.</h1>
                        <p className="mt-4 max-w-xl text-white/80">
                            MICRODINE menyatukan pemesanan QR, pembayaran QRIS & tunai, antrean dapur real-time, dan laporan omzet–HPP–laba dalam satu platform
                            untuk usaha kuliner skala mikro.
                        </p>
                        <div className="mt-7 flex flex-wrap gap-3">
                            <Button href="/meja/07" size="lg">
                                Coba sebagai Pelanggan (Meja 07)
                                <ArrowRight className="h-4 w-4" aria-hidden="true" />
                            </Button>
                            <Button href="/staf/masuk" variant="outline" size="lg" className="border-white/30 bg-transparent text-white hover:bg-white/10">
                                Portal Staf
                            </Button>
                        </div>
                    </div>
                    <img src={hero} alt="Hidangan khas Nusantara di meja restoran" className="aspect-[16/10] w-full rounded-3xl object-cover shadow-2xl" />
                </div>
            </header>

            <main className="mx-auto max-w-6xl px-5 py-12 md:px-8">
                <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {FEATURES.map(({ icon: Icon, title, text }) => (
                        <li key={title} className="rounded-2xl border border-line bg-panel p-5">
                            <span className="grid h-11 w-11 place-items-center rounded-xl bg-gold text-obsidian">
                                <Icon className="h-5 w-5" aria-hidden="true" />
                            </span>
                            <h2 className="mt-4 font-extrabold text-navy">{title}</h2>
                            <p className="mt-1 text-sm leading-relaxed text-soft">{text}</p>
                        </li>
                    ))}
                </ul>
                <p className="mt-10 text-center text-xs text-faint">
                    Dibuat untuk hackathon ·{' '}
                    <Link href="/dapur" className="underline underline-offset-2">
                        Layar dapur
                    </Link>
                </p>
            </main>
        </div>
    );
}
