import { Head } from '@inertiajs/react';

import Ornament from '@/Components/Shared/Ornament';
import kitchenImage from '@images/resto.jpg';
import foodImage from '@images/menu/food.jpg';

import AboutSection from '@/Pages/Landing/Partials/AboutSection';
import FeatureSection from '@/Pages/Landing/Partials/FeatureSection';
import HeroSection from '@/Pages/Landing/Partials/HeroSection';
import LandingFooter from '@/Pages/Landing/Partials/LandingFooter';
import LandingNavbar from '@/Pages/Landing/Partials/LandingNavbar';
import MenuSection from '@/Pages/Landing/Partials/MenuSection';
import PhotoBanner from '@/Pages/Landing/Partials/PhotoBanner';
import StepsSection from '@/Pages/Landing/Partials/StepsSection';
import { LandingButton, LINKS } from '@/Pages/Landing/Partials/shared';

/**
 * Halaman awal (landing page) bergaya restoran klasik: navy, emas, dan judul serif.
 * Route: GET /
 * Setiap bagian ada di Pages/Landing/Partials agar file ini tetap ringkas.
 */
export default function LandingIndex() {
    return (
        <div className="min-h-dvh overflow-x-hidden bg-navy text-ivory/80 [scroll-behavior:smooth]">
            <Head title="Pesan dari Meja, Bayar di Awal" />
            <LandingNavbar />
            <HeroSection />
            <FeatureSection />
            <Ornament className="mx-auto max-w-6xl px-4 sm:px-6" />
            <AboutSection />
            <MenuSection />

            <PhotoBanner image={foodImage} kicker="Rasa Nusantara" title={<>Satu meja, banyak hidangan, <em className="font-medium text-gold">satu tagihan</em></>} fixed label="Hidangan Nusantara">
                <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-ivory/85">
                    Setiap orang di meja dapat menambah pesanan dari ponselnya masing-masing. Semua tercatat rapi dalam satu tagihan meja.
                </p>
            </PhotoBanner>

            <StepsSection />

            <PhotoBanner image={kitchenImage} kicker="Sudah lapar?" title="Pesan dari meja Anda sekarang" overlay="bg-obsidian/80" className="py-24 sm:py-28">
                <LandingButton href={LINKS.order} className="mt-10">
                    Mulai Pesan
                </LandingButton>
            </PhotoBanner>

            <LandingFooter />
        </div>
    );
}
