import { Link } from '@inertiajs/react';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

import { cx } from '@/Utils/classNames';

import { LandingLogo, LINKS } from '@/Pages/Landing/Partials/shared';

export const SECTIONS = [
    { href: '#beranda', label: 'Beranda' },
    { href: '#tentang', label: 'Tentang' },
    { href: '#menu', label: 'Menu' },
    { href: '#cara-pesan', label: 'Cara Pesan' },
    { href: '#kontak', label: 'Kontak' },
];

/** Navbar transparan di atas foto hero; di ponsel berubah menjadi menu lipat. */
export default function LandingNavbar() {
    const [open, setOpen] = useState(false);

    return (
        <header className="absolute inset-x-0 top-0 z-30">
            <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-4 sm:px-6">
                <a href="#beranda" aria-label="MICRODINE, ke bagian atas">
                    <LandingLogo />
                </a>

                <nav className="hidden items-center gap-9 md:flex" aria-label="Navigasi halaman">
                    {SECTIONS.map((section, index) => (
                        <a
                            key={section.href}
                            href={section.href}
                            className={cx('text-[13px] font-medium uppercase tracking-[0.18em] transition-colors hover:text-gold', index === 0 ? 'text-gold' : 'text-ivory/85')}
                        >
                            {section.label}
                        </a>
                    ))}
                </nav>

                <div className="flex items-center gap-3">
                    <Link
                        href={LINKS.staff}
                        className="hidden border-b border-ivory/40 pb-0.5 text-[13px] font-medium uppercase tracking-[0.18em] text-ivory/85 transition-colors hover:border-gold hover:text-gold md:inline"
                    >
                        Portal Karyawan
                    </Link>
                    <button
                        type="button"
                        onClick={() => setOpen((value) => !value)}
                        className="grid h-10 w-10 place-items-center text-ivory md:hidden"
                        aria-label={open ? 'Tutup menu' : 'Buka menu'}
                        aria-expanded={open}
                    >
                        {open ? <X className="h-[22px] w-[22px]" /> : <Menu className="h-[22px] w-[22px]" />}
                    </button>
                </div>
            </div>

            {open && (
                <div className="mx-4 border border-gold/30 bg-obsidian p-4 md:hidden">
                    {SECTIONS.map((section) => (
                        <a key={section.href} href={section.href} onClick={() => setOpen(false)} className="block py-3 text-sm font-medium uppercase tracking-[0.16em] text-ivory/90">
                            {section.label}
                        </a>
                    ))}
                    <Link href={LINKS.staff} className="block py-3 text-sm font-medium uppercase tracking-[0.16em] text-gold">
                        Portal Karyawan
                    </Link>
                </div>
            )}
        </header>
    );
}
