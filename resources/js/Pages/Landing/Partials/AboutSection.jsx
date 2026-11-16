import kitchenImage from '@images/resto.jpg';
import cashierImage from '@images/resto2.jpg';
import receiptImage from '@images/resto3.jpg';

import Reveal from '@/Components/Shared/Reveal';
import { cx } from '@/Utils/classNames';

import { SectionTitle } from '@/Pages/Landing/Partials/shared';

const STATS = [
    { value: '4 langkah', label: 'dari memilih menu hingga membayar' },
    { value: 'Seketika', label: 'pesanan sampai ke kasir & dapur' },
    { value: 'Tercatat', label: 'omzet, HPP, dan laba setiap hari' },
];

const PHOTOS = [
    { src: cashierImage, alt: 'Tablet kasir di meja kasir dengan dapur di belakang', caption: 'Kasir digital', className: 'col-span-2 h-56 sm:h-64' },
    { src: receiptImage, alt: 'Struk dengan QR code keluar dari printer kasir', caption: 'Struk & QRIS', className: 'h-48 sm:h-60' },
    { src: kitchenImage, alt: 'Tim koki menyiapkan pesanan di dapur', caption: 'Dapur terhubung', className: 'h-48 sm:h-60' },
];

/** "Mengapa memilih kami": teks + angka singkat di kiri, kolase foto di kanan. */
export default function AboutSection() {
    return (
        <section id="tentang" className="py-20 sm:py-24">
            <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16">
                <Reveal from="left" className="text-center lg:text-left">
                    <p className="font-script text-2xl text-gold sm:text-[1.75rem]">Mengapa memilih kami</p>
                    <SectionTitle className="mt-3 text-ivory">
                        Restoran digital untuk <em className="font-medium text-gold">usaha kecil</em> yang ingin naik kelas
                    </SectionTitle>
                    <p className="mt-6 text-base leading-relaxed">
                        MICRODINE membantu warung dan restoran kecil bekerja lebih tertib: pelanggan memesan sendiri, kasir tidak kewalahan, dan pemilik tahu persis keuntungan setiap hari, tanpa
                        perangkat mahal.
                    </p>
                    <dl className="mt-10 grid border-y border-gold/30 sm:grid-cols-3">
                        {STATS.map((stat, index) => (
                            <div key={stat.label} className={cx('px-2 py-5 text-center lg:text-left', index > 0 && 'border-t border-gold/20 sm:border-l sm:border-t-0 sm:pl-5')}>
                                <dt className="font-display text-2xl font-semibold text-gold">{stat.value}</dt>
                                <dd className="mt-1 text-sm leading-snug text-ivory/75">{stat.label}</dd>
                            </div>
                        ))}
                    </dl>
                </Reveal>

                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    {PHOTOS.map((photo, index) => (
                        <Reveal as="figure" key={photo.caption} from="right" delay={150 + index * 150} className={cx('group relative overflow-hidden border border-gold/30', photo.className)}>
                            <img src={photo.src} alt={photo.alt} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                            <figcaption className="absolute bottom-0 left-0 bg-navy px-4 py-1.5 font-script text-lg text-gold">{photo.caption}</figcaption>
                        </Reveal>
                    ))}
                </div>
            </div>
        </section>
    );
}
