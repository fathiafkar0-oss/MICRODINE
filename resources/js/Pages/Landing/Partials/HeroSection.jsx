import heroImage from '@images/hero-restoran.jpg';

import { Kicker, LandingButton, LINKS } from '@/Pages/Landing/Partials/shared';

/** Foto restoran layar penuh dengan judul besar di tengah. */
export default function HeroSection() {
    return (
        <section id="beranda" className="relative flex min-h-[100svh] items-center overflow-hidden">
            <img src={heroImage} alt="Suasana restoran dengan kasir digital dan pelanggan memesan lewat ponsel" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-obsidian/70" aria-hidden="true" />
            <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-navy" aria-hidden="true" />

            <div className="relative z-10 mx-auto w-full max-w-4xl px-4 pb-16 pt-28 text-center sm:px-6">
                <Kicker>Selamat datang di restoran kami</Kicker>
                <h1 className="mt-5 font-display text-5xl font-semibold leading-[1.02] text-ivory sm:text-7xl lg:text-[5.5rem]">
                    Pesan dengan Mudah,
                    <br />
                    <em className="font-medium text-gold">Dilayani dengan Cepat</em>
                </h1>
                <p className="mx-auto mt-7 max-w-xl text-base leading-relaxed text-ivory/85 sm:text-lg">
                    Platform manajemen restoran untuk usaha kuliner Indonesia: pesan dari meja, kasir yang sigap, dan laporan laba yang selalu rapi.
                </p>
                <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
                    <LandingButton href={LINKS.order} className="w-full sm:w-auto">
                        Lihat Menu &amp; Pesan
                    </LandingButton>
                    <LandingButton href={LINKS.staff} variant="outlineLight" className="w-full sm:w-auto">
                        Portal Karyawan
                    </LandingButton>
                </div>
            </div>
        </section>
    );
}
