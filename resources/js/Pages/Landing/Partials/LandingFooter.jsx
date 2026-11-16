import { Link } from '@inertiajs/react';
import { Clock, MapPin, Phone } from 'lucide-react';

import { LandingLogo, LINKS } from '@/Pages/Landing/Partials/shared';

/** Kontak restoran (backend nanti: dari pengaturan restoran). */
const CONTACT = [
    { icon: MapPin, text: 'Jl. Teuku Nyak Arief No. 12, Banda Aceh' },
    { icon: Phone, text: '0812-3456-7890' },
    { icon: Clock, text: 'Setiap hari, 10.00 – 22.00' },
];

export default function LandingFooter() {
    return (
        <footer id="kontak" className="border-t-2 border-gold/60 bg-obsidian">
            <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:grid-cols-3 sm:px-6">
                <div>
                    <LandingLogo size="sm" />
                    <p className="mt-4 text-sm leading-relaxed">Platform manajemen restoran terpadu untuk mendorong kemandirian digital usaha kuliner Indonesia.</p>
                </div>
                <div>
                    <h2 className="font-display text-xl font-semibold text-gold">Kontak</h2>
                    <ul className="mt-4 space-y-3 text-sm">
                        {CONTACT.map(({ icon: Icon, text }) => (
                            <li key={text} className="flex gap-3">
                                <Icon className="mt-0.5 h-4 w-4 shrink-0 text-gold" strokeWidth={1.5} aria-hidden="true" />
                                {text}
                            </li>
                        ))}
                    </ul>
                </div>
                <div>
                    <h2 className="font-display text-xl font-semibold text-gold">Akses Cepat</h2>
                    <ul className="mt-4 space-y-3 text-sm">
                        <li>
                            <Link href={LINKS.order} className="transition-colors hover:text-gold">
                                Pesan dari meja (demo Meja 07)
                            </Link>
                        </li>
                        <li>
                            <Link href={LINKS.staff} className="transition-colors hover:text-gold">
                                Portal kasir, dapur &amp; admin
                            </Link>
                        </li>
                        <li>
                            <a href="#cara-pesan" className="transition-colors hover:text-gold">
                                Cara memesan
                            </a>
                        </li>
                    </ul>
                </div>
            </div>
            <p className="border-t border-ivory/10 py-6 text-center text-xs tracking-[0.14em] text-ivory/55">© 2026 MICRODINE · SKS Team, Universitas Syiah Kuala</p>
        </footer>
    );
}
