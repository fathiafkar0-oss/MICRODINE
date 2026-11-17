import { Link } from '@inertiajs/react';
import { LogOut, MonitorPlay } from 'lucide-react';

import Logo from '@/Components/Shared/Logo';
import { cx, initials } from '@/Utils/classNames';

/**
 * Sidebar navy untuk layar desktop (lg ke atas).
 * sections: [{ heading, items: [{ href, label, icon }] }]
 * Menu aktif ditandai garis emas di kiri + teks emas (bukan blok emas penuh) agar tetap elegan.
 */
export default function Sidebar({ portal, sections, activeHref, user, showKitchenShortcut = false }) {
    return (
        <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 print:!hidden flex-col border-r border-gold/15 bg-gradient-to-b from-navy to-navy-deep px-4 py-7 text-white lg:flex">
            <Logo subtitle={portal} className="animate-fade-in px-2" />
            <div className="mx-2 mt-6 h-px bg-gradient-to-r from-gold/40 via-gold/15 to-transparent" aria-hidden="true" />

            <nav className="mt-6 flex flex-1 flex-col gap-6 overflow-y-auto" aria-label="Menu utama">
                {sections.map((section) => (
                    <div key={section.heading}>
                        <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.24em] text-gold-soft/60">{section.heading}</p>
                        <div className="flex flex-col gap-0.5">
                            {section.items.map(({ href, label, icon: Icon }) => {
                                const active = activeHref === href;
                                return (
                                    <Link
                                        key={`${section.heading}-${href}`}
                                        href={href}
                                        aria-current={active ? 'page' : undefined}
                                        className={cx(
                                            'group relative flex items-center gap-3 rounded-[12px] px-3 py-2.5 text-sm font-semibold transition-colors duration-300',
                                            active ? 'bg-white/[0.08] text-gold-soft' : 'text-white/75 hover:bg-white/[0.05] hover:text-white',
                                        )}
                                    >
                                        <span
                                            aria-hidden="true"
                                            className={cx(
                                                'absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full bg-gold transition-transform duration-500 ease-ios',
                                                active ? 'scale-y-100' : 'scale-y-0',
                                            )}
                                        />
                                        <Icon
                                            className={cx('h-[18px] w-[18px] transition-transform duration-300', active ? 'text-gold' : 'group-hover:translate-x-0.5')}
                                            strokeWidth={1.7}
                                            aria-hidden="true"
                                        />
                                        {label}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </nav>

            {showKitchenShortcut && (
                <Link
                    href="/dapur"
                    className="mb-3 inline-flex items-center justify-center gap-2 rounded-[12px] border border-gold/40 px-4 py-2.5 text-[13px] font-semibold text-gold-soft transition hover:border-gold hover:bg-gold/10 active:scale-[0.98]"
                >
                    <MonitorPlay className="h-4 w-4" aria-hidden="true" />
                    Layar Dapur
                </Link>
            )}

            <div className="flex items-center gap-3 rounded-[16px] border border-white/10 bg-white/[0.05] p-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gold text-xs font-bold text-obsidian ring-2 ring-gold/30 ring-offset-2 ring-offset-navy-deep">
                    {initials(user.name)}
                </span>
                <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-white">{user.name}</p>
                    <p className="truncate text-xs capitalize text-white/60">
                        {user.role}
                        {user.shift ? ` · ${user.shift}` : ''}
                    </p>
                </div>
                <LogoutLink className="text-white/70 hover:bg-white/10 hover:text-white" />
            </div>
        </aside>
    );
}

export function LogoutLink({ className = '' }) {
    return (
        <Link
            href="/logout"
            method="post"
            as="button"
            aria-label="Keluar"
            title="Keluar"
            className={cx('grid h-9 w-9 shrink-0 place-items-center rounded-[10px] transition', className)}
        >
            <LogOut className="h-4 w-4" />
        </Link>
    );
}
