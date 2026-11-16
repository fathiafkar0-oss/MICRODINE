import { Link } from '@inertiajs/react';
import { useEffect, useRef } from 'react';

import Logo from '@/Components/Shared/Logo';
import { LogoutLink } from '@/Components/Shared/Sidebar';
import { cx } from '@/Utils/classNames';

/** Sampai 5 menu dibagi rata; lebih dari itu (admin) menu bisa digeser. */
const MAX_FIXED_ITEMS = 5;

/**
 * Navigasi untuk ponsel & tablet (di bawah lg):
 * header navy di atas + menu di bawah layar. Menu aktif selalu digulir agar terlihat.
 */
export default function Navbar({ portal, items, activeHref }) {
    const fits = items.length <= MAX_FIXED_ITEMS;
    const activeLink = useRef(null);

    useEffect(() => {
        if (!fits) activeLink.current?.scrollIntoView({ block: 'nearest', inline: 'center' });
    }, [fits, activeHref]);

    return (
        <>
            <header className="sticky top-0 z-30 flex items-center justify-between border-b border-gold/20 bg-gradient-to-r from-navy to-navy-deep px-4 py-3 text-white lg:hidden">
                <Logo subtitle={portal} />
                <LogoutLink className="bg-white/10 text-white hover:bg-white/20" />
            </header>

            <nav
                aria-label="Menu utama"
                className={cx(
                    'fixed inset-x-0 bottom-0 z-40 gap-1 border-t border-line/80 bg-panel/85 p-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] backdrop-blur-xl backdrop-saturate-150 lg:hidden',
                    fits ? 'grid auto-cols-fr grid-flow-col' : 'scrollbar-none flex overflow-x-auto',
                )}
            >
                {items.map(({ href, label, icon: Icon }) => (
                    <Link
                        key={href}
                        href={href}
                        ref={activeHref === href ? activeLink : undefined}
                        aria-current={activeHref === href ? 'page' : undefined}
                        className={cx(
                            'relative flex flex-col items-center gap-1 rounded-[12px] py-2 text-center text-[11px] font-semibold leading-tight transition-colors duration-300 active:scale-95',
                            fits ? 'min-w-0 px-1' : 'min-w-[5.25rem] shrink-0 grow whitespace-nowrap px-3',
                            activeHref === href ? 'text-navy' : 'text-faint',
                        )}
                    >
                        <Icon className={cx('h-5 w-5 shrink-0 transition-colors duration-300', activeHref === href && 'text-gold')} strokeWidth={activeHref === href ? 2 : 1.7} aria-hidden="true" />
                        <span>{label}</span>
                        <span aria-hidden="true" className={cx('h-1 w-1 rounded-full bg-gold transition-opacity duration-300', activeHref === href ? 'opacity-100' : 'opacity-0')} />
                    </Link>
                ))}
            </nav>
        </>
    );
}
