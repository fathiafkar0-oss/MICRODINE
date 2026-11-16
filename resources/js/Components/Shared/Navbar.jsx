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
            <header className="sticky top-0 z-30 flex items-center justify-between bg-navy px-4 py-3 text-white lg:hidden">
                <Logo subtitle={portal} />
                <LogoutLink className="bg-white/10 text-white hover:bg-white/20" />
            </header>

            <nav
                aria-label="Menu utama"
                className={cx(
                    'fixed inset-x-0 bottom-0 z-40 gap-1 border-t border-line bg-panel/95 p-2 backdrop-blur lg:hidden',
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
                            'flex flex-col items-center gap-1 rounded-xl py-2 text-center text-[11px] font-semibold leading-tight',
                            fits ? 'min-w-0 px-1' : 'min-w-[5.25rem] shrink-0 grow whitespace-nowrap px-3',
                            activeHref === href ? 'bg-gold text-obsidian' : 'text-soft',
                        )}
                    >
                        <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                        <span>{label}</span>
                    </Link>
                ))}
            </nav>
        </>
    );
}
