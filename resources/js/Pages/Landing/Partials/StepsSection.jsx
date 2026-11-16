import { ScanLine, Utensils, Wallet } from 'lucide-react';

import heroImage from '@images/hero-restoran.jpg';
import specialImage from '@images/menu/makanan-3.jpg';
import receiptImage from '@images/resto3.jpg';

import { Kicker, SectionTitle } from '@/Pages/Landing/Partials/shared';

const STEPS = [
    { image: heroImage, position: 'object-[80%_50%]', icon: ScanLine, title: 'Pindai QR di Meja', text: 'Nomor meja terbaca otomatis; tidak perlu memanggil pelayan.' },
    { image: specialImage, position: 'object-center', icon: Utensils, title: 'Pilih Hidangan', text: 'Lihat foto dan harga, lalu tambahkan catatan seperti “tanpa bawang”.' },
    { image: receiptImage, position: 'object-center', icon: Wallet, title: 'Bayar QRIS atau Tunai', text: 'Bayar dari ponsel atau di kasir, lalu ikuti status pesanan Anda.' },
];
const ROMAN = ['I', 'II', 'III'];

/** Cara memesan dalam tiga langkah bernomor romawi. */
export default function StepsSection() {
    return (
        <section id="cara-pesan" className="bg-navy-soft py-20 sm:py-24">
            <div className="mx-auto max-w-6xl px-4 sm:px-6">
                <div className="text-center">
                    <Kicker>Cara memesan</Kicker>
                    <SectionTitle className="mt-3 text-ivory">Cukup Tiga Langkah</SectionTitle>
                </div>
                <ol className="mt-14 grid gap-6 sm:grid-cols-3">
                    {STEPS.map(({ image, position, icon: Icon, title, text }, index) => (
                        <li key={title} className="border border-gold/25 bg-navy">
                            <div className="relative h-48 overflow-hidden">
                                <img src={image} alt="" aria-hidden="true" loading="lazy" className={`h-full w-full object-cover ${position}`} />
                                <span className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full border border-gold bg-navy">
                                    <Icon className="h-[18px] w-[18px] text-gold" strokeWidth={1.4} aria-hidden="true" />
                                </span>
                            </div>
                            <div className="p-6">
                                <p className="font-display text-3xl font-semibold text-gold">{ROMAN[index]}.</p>
                                <h3 className="mt-1 font-display text-2xl font-semibold text-ivory">{title}</h3>
                                <p className="mt-2 text-[15px] leading-relaxed">{text}</p>
                            </div>
                        </li>
                    ))}
                </ol>
            </div>
        </section>
    );
}
