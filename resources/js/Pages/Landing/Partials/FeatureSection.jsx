import { BarChart3, ChefHat, QrCode } from 'lucide-react';

import Reveal from '@/Components/Shared/Reveal';

const FEATURES = [
    { icon: QrCode, title: 'Pesan dari Meja', text: 'Pelanggan memindai QR di meja, memilih hidangan, dan membayar dari ponselnya sendiri.' },
    { icon: ChefHat, title: 'Kasir & Dapur Selaras', text: 'Setiap pesanan langsung tampil di antrean kasir dan dapur, tanpa kertas yang tercecer.' },
    { icon: BarChart3, title: 'Buku Kas Harian', text: 'Omzet, modal (HPP), dan laba tercatat rapi di setiap transaksi.' },
];

/** Tiga keunggulan dengan ikon garis emas. */
export default function FeatureSection() {
    return (
        <section id="fitur" className="py-20 sm:py-24">
            <div className="mx-auto grid max-w-6xl gap-14 px-4 sm:grid-cols-3 sm:gap-10 sm:px-6">
                {FEATURES.map(({ icon: Icon, title, text }, index) => (
                    <Reveal key={title} delay={index * 150} className="group text-center">
                        <Icon className="mx-auto h-12 w-12 text-gold transition-transform duration-500 group-hover:-translate-y-1 group-hover:scale-110" strokeWidth={1} aria-hidden="true" />
                        <h3 className="mt-6 font-display text-2xl font-semibold uppercase tracking-[0.06em] text-gold-soft">{title}</h3>
                        <p className="mx-auto mt-3 max-w-xs text-[15px] leading-relaxed">{text}</p>
                    </Reveal>
                ))}
            </div>
        </section>
    );
}
