import { Link } from '@inertiajs/react';
import { ArrowUpRight } from 'lucide-react';

import Ornament from '@/Components/Shared/Ornament';
import Reveal from '@/Components/Shared/Reveal';
import { formatCurrency } from '@/Utils/formatCurrency';
import cheesecakeImage from '@images/menu/makanan-1.jpg';
import kampungImage from '@images/menu/makanan-2.jpg';
import specialImage from '@images/menu/makanan-3.jpg';
import pastryImage from '@images/menu/makanan-4.jpg';

import { Kicker, LandingButton, LINKS, SectionTitle } from '@/Pages/Landing/Partials/shared';

/** Hidangan andalan yang dipajang di halaman awal (backend nanti: props `highlights`). */
const HIGHLIGHTS = [
    { image: specialImage, name: 'Nasi Goreng Spesial', description: 'Telur mata sapi, kerupuk udang, sambal, dan lalapan segar.', price: 28000, tag: 'Favorit' },
    { image: kampungImage, name: 'Nasi Goreng Kampung', description: 'Bumbu rempah rumahan, acar segar, dan emping renyah.', price: 25000 },
    { image: cheesecakeImage, name: 'Cheesecake & Latte', description: 'Blueberry cheesecake lembut dengan secangkir latte hangat.', price: 35000, tag: 'Baru' },
    { image: pastryImage, name: 'Aneka Pastry Manis', description: 'Choux krim dan buah segar, teman minum kopi sore.', price: 18000 },
];

/** Bagian berlatar gading: kartu menu andalan. */
export default function MenuSection({ highlights = HIGHLIGHTS }) {
    return (
        <section id="menu" className="bg-ivory py-20 text-obsidian sm:py-24">
            <div className="mx-auto max-w-6xl px-4 sm:px-6">
                <Reveal className="text-center">
                    <Kicker className="text-crimson">Menu andalan</Kicker>
                    <SectionTitle className="mt-3 text-navy">Hidangan Favorit Pelanggan</SectionTitle>
                    <Ornament className="mx-auto mt-6 max-w-xs" />
                </Reveal>

                <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {highlights.map((menu, index) => (
                        <Reveal key={menu.name} delay={index * 120}>
                            <article className="group flex h-full flex-col border border-ivory-line bg-ivory-paper transition duration-300 hover:-translate-y-1.5 hover:border-gold/60 hover:shadow-xl hover:shadow-navy/10">
                                <div className="relative aspect-[4/3] overflow-hidden">
                                    <img src={menu.image} alt={menu.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                    {menu.tag && <span className="absolute left-0 top-4 bg-crimson px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-ivory">{menu.tag}</span>}
                                </div>
                                <div className="flex flex-1 flex-col p-5">
                                    <h3 className="font-display text-2xl font-semibold leading-tight text-navy">{menu.name}</h3>
                                    <p className="mt-2 flex-1 text-sm leading-relaxed text-obsidian/75">{menu.description}</p>
                                    <div className="mt-4 flex items-center justify-between border-t border-ivory-line pt-4">
                                        <span className="font-display text-xl font-semibold text-crimson">{formatCurrency(menu.price)}</span>
                                        <Link href={LINKS.order} className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.16em] text-navy transition-colors hover:text-crimson">
                                            Pesan <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.6} aria-hidden="true" />
                                        </Link>
                                    </div>
                                </div>
                            </article>
                        </Reveal>
                    ))}
                </div>

                <Reveal className="mt-12 text-center">
                    <LandingButton href={LINKS.order} variant="outlineNavy">
                        Lihat Semua Menu
                    </LandingButton>
                </Reveal>
            </div>
        </section>
    );
}
