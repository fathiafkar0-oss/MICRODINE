import { Utensils } from 'lucide-react';

import { cx } from '@/Utils/classNames';

/** Foto menu; tanpa foto tampil ubin gradasi cokelat berikon (seperti mockup proposal). */
export default function MenuThumb({ menu, className = 'h-12 w-12 rounded-xl', iconClass = 'h-5 w-5' }) {
    if (menu?.image) {
        return <img src={menu.image} alt="" className={cx('shrink-0 object-cover', className)} loading="lazy" />;
    }
    return (
        <span className={cx('menu-tile grid shrink-0 place-items-center text-white/85', className)} aria-hidden="true">
            <Utensils className={iconClass} />
        </span>
    );
}
