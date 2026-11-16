import { Link } from '@inertiajs/react';
import { LogOut, MonitorPlay } from 'lucide-react';

import Logo from '@/Components/Shared/Logo';
import { cx, initials } from '@/Utils/classNames';

/**
 * Sidebar navy untuk layar desktop (lg ke atas).
 * sections: [{ heading, items: [{ href, label, icon }] }]
 */
export default function Sidebar({ portal, sections, activeHref, user, showKitchenShortcut = false }) {
    return (
        <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col bg-navy px-4 py-6 text-white lg:flex">
            <Logo subtitle={portal} className="px-2" />

            <nav className="mt-8 flex flex-1 flex-col gap-6 overflow-y-auto" aria-label="Menu utama">
                {sections.map((section) => (
                    <div key={section.heading}>
                        <p className="mb-2 px-3 text-[11px] font-bold uppercase tracking-[0.12em] text-white/55">{section.heading}</p>
                        <div className="flex flex-col gap-1">
                            {section.items.map(({ href, label, icon: Icon }) => (
                                <Link
                                    key={`${section.heading}-${href}`}
                                    href={href}
                                    aria-current={activeHref === href ? 'page' : undefined}
                                    className={cx(
                                        'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition',
                                        activeHref === href ? 'bg-gold text-obsidian' : 'text-white/85 hover:bg-white/10 hover:text-white',
                                    )}
                                >
                                    <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
                                    {label}
                                </Link>
                            ))}
                        </div>
                    </div>
                ))}
            </nav>

            {showKitchenShortcut && (
                <Link
                    href="/dapur"
                    className="mb-3 inline-flex items-center justify-center gap-2 rounded-full bg-gold-soft px-4 py-2 text-[13px] font-bold text-obsidian transition hover:bg-gold"
                >
                    <MonitorPlay className="h-4 w-4" aria-hidden="true" />
                    Kitchen Monitor
                </Link>
            )}

            <div className="flex items-center gap-3 rounded-2xl bg-gold p-3 text-obsidian">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-panel text-xs font-bold">{initials(user.name)}</span>
                <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold">{user.name}</p>
                    <p className="truncate text-xs capitalize text-obsidian/75">
                        {user.role}
                        {user.shift ? ` · ${user.shift}` : ''}
                    </p>
                </div>
                <LogoutLink className="text-obsidian hover:bg-obsidian/10" />
            </div>
        </aside>
    );
}

/** Fase frontend: keluar = kembali ke halaman login. Backend: ganti dengan POST /staf/keluar. */
export function LogoutLink({ className = '' }) {
    return (
        <Link href="/staf/masuk" aria-label="Keluar" title="Keluar" className={cx('grid h-9 w-9 shrink-0 place-items-center rounded-lg transition', className)}>
            <LogOut className="h-4 w-4" />
        </Link>
    );
}
