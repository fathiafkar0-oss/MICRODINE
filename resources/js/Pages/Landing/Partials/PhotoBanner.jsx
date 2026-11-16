import Reveal from '@/Components/Shared/Reveal';
import { cx } from '@/Utils/classNames';

import { Kicker, SectionTitle } from '@/Pages/Landing/Partials/shared';

/** Pita foto penuh dengan lapisan gelap, judul di tengah, dan isi opsional (paragraf/tombol). */
export default function PhotoBanner({ image, kicker, title, overlay = 'bg-navy/75', fixed = false, className = 'py-28', label, children }) {
    return (
        <section className={cx('relative bg-cover bg-center', fixed && 'lg:bg-fixed', className)} style={{ backgroundImage: `url(${image})` }} aria-label={label}>
            <div className={cx('absolute inset-0', overlay)} aria-hidden="true" />
            <Reveal className="relative mx-auto max-w-3xl px-4 text-center sm:px-6">
                <Kicker>{kicker}</Kicker>
                <SectionTitle className="mt-3 leading-tight text-ivory">{title}</SectionTitle>
                {children}
            </Reveal>
        </section>
    );
}
