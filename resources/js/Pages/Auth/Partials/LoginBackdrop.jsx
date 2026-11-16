import { Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';

import ClassicLogo from '@/Components/Shared/ClassicLogo';
import useNow from '@/Hooks/useNow';
import { cx } from '@/Utils/classNames';
import { formatLongDate, formatTime } from '@/Utils/formatDate';

/**
 * Latar layar penuh portal karyawan: foto restoran yang berganti (memudar) sesuai peran,
 * bingkai emas tipis ganda, logo di atas, serta keterangan peran & jam di pojok bawah (layar ≥1280px).
 * Konten utama (kartu formulir) dikirim sebagai `children` dan diletakkan di tengah.
 */
export default function LoginBackdrop({ roles, active, children }) {
    const now = useNow();

    return (
        <div className="relative isolate flex min-h-dvh flex-col overflow-hidden bg-obsidian text-ivory">
            <RoleBackground roles={roles} active={active} />
            <div className="absolute inset-0 -z-10 bg-gradient-to-b from-obsidian/85 via-navy/75 to-obsidian/90" aria-hidden="true" />
            <div className="pointer-events-none absolute inset-3 border border-gold/35 sm:inset-6" aria-hidden="true" />
            <div className="pointer-events-none absolute inset-[18px] hidden border border-gold/15 sm:block sm:inset-[30px]" aria-hidden="true" />

            <header className="flex items-center justify-between px-7 pt-8 sm:px-12 sm:pt-10">
                <Link href="/" aria-label="Kembali ke halaman awal" className="animate-hero-rise">
                    <ClassicLogo size="sm" />
                </Link>
                <Link
                    href="/"
                    className="group inline-flex animate-hero-rise items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-ivory/70 transition-colors [animation-delay:150ms] hover:text-gold"
                >
                    <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" aria-hidden="true" />
                    Beranda
                </Link>
            </header>

            <main className="flex flex-1 flex-col items-center justify-center px-5 py-8 [@media(max-height:820px)]:py-4">{children}</main>

            <footer className="pointer-events-none absolute inset-x-0 bottom-0 hidden items-end justify-between gap-10 px-12 pb-11 xl:flex">
                <div className="max-w-[300px] animate-hero-rise [animation-delay:700ms]" aria-live="polite">
                    <p key={active.id} className="animate-fade-in">
                        <span className="block text-[11px] font-semibold uppercase tracking-[0.24em] text-gold-soft">{active.title}</span>
                        <span className="mt-1.5 block text-sm leading-relaxed text-ivory/75">{active.caption}</span>
                    </p>
                </div>
                <dl className="flex animate-hero-rise items-end gap-8 text-right [animation-delay:800ms]">
                    <div>
                        <dt className="text-[11px] font-semibold uppercase tracking-[0.22em] text-ivory/55">Hari ini</dt>
                        <dd className="font-display text-xl font-medium italic text-ivory/90">{formatLongDate(now)}</dd>
                    </div>
                    <div>
                        <dt className="text-[11px] font-semibold uppercase tracking-[0.22em] text-ivory/55">Pukul</dt>
                        <dd className="font-display text-3xl font-semibold tabular-nums text-ivory">{formatTime(now)}</dd>
                    </div>
                </dl>
            </footer>
        </div>
    );
}

/**
 * Foto latar yang berganti tanpa "kedip": foto lama tetap utuh di lapisan bawah,
 * foto baru memudar masuk di atasnya (bukan dua-duanya memudar bersamaan).
 */
function RoleBackground({ roles, active }) {
    // Dicatat langsung saat render (bukan di useEffect) agar tidak ada satu frame tanpa foto.
    const [layers, setLayers] = useState({ current: active.id, previous: null });
    if (layers.current !== active.id) {
        setLayers({ current: active.id, previous: layers.current });
    }
    const previous = layers.current === active.id ? layers.previous : layers.current;

    return (
        <div className="absolute inset-0 -z-10" aria-hidden="true">
            {roles.map((role) => {
                const isActive = role.id === active.id;
                const isPrevious = role.id === previous;
                return (
                    <img
                        key={role.id}
                        src={role.image}
                        alt=""
                        decoding="async"
                        className={cx(
                            'absolute inset-0 h-full w-full object-cover',
                            isActive && 'z-[2] scale-100 opacity-100 transition-[opacity,transform] duration-[1100ms] ease-[cubic-bezier(0.32,0.72,0,1)]',
                            isPrevious && 'z-[1] scale-100 opacity-100',
                            !isActive && !isPrevious && 'z-0 scale-[1.04] opacity-0',
                        )}
                    />
                );
            })}
        </div>
    );
}
