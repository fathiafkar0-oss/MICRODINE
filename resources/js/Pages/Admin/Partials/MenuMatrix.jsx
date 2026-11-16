import { Gem, Sparkles, Star, Wrench } from 'lucide-react';

import Card, { CardHeader } from '@/Components/UI/Card';
import MenuThumb from '@/Components/UI/MenuThumb';
import { cx } from '@/Utils/classNames';
import { formatCurrency } from '@/Utils/formatCurrency';
import { MATRIX_GROUPS } from '@/Utils/menuAnalytics';

const ICON = { bintang: Star, andalan: Wrench, potensi: Gem, evaluasi: Sparkles };
const STYLE = {
    bintang: 'border-gold/50 bg-gold-tint/60',
    andalan: 'border-info/20 bg-info-tint/60',
    potensi: 'border-success/25 bg-success-tint/60',
    evaluasi: 'border-line-strong bg-raised/70',
};
const ICON_STYLE = { bintang: 'bg-gold text-obsidian', andalan: 'bg-info text-white', potensi: 'bg-success text-white', evaluasi: 'bg-faint text-white' };

/**
 * Matriks menu 2×2 (menu engineering): sumbu "laku" (porsi) × "untung" (laba per porsi).
 * Urutan kotak mengikuti grafik: kiri atas = Potensi, kanan atas = Bintang, kiri bawah = Evaluasi, kanan bawah = Andalan.
 */
export default function MenuMatrix({ groups, popularThreshold, averageMargin }) {
    return (
        <Card>
            <CardHeader
                title="Matriks menu"
                subtitle={`Laku = terjual ≥ ${Math.ceil(popularThreshold)} porsi · Untung besar = laba ≥ ${formatCurrency(Math.round(averageMargin / 100) * 100)} per porsi`}
            />
            <div className="relative grid gap-3 sm:grid-cols-2 sm:pl-7 sm:pb-6">
                {/* Label sumbu */}
                <span className="absolute bottom-6 left-0 top-0 hidden w-5 rotate-180 items-center justify-center text-[10px] font-semibold uppercase tracking-[0.2em] text-faint [writing-mode:vertical-rl] sm:flex">Untung per porsi →</span>
                <span className="absolute bottom-0 left-1/2 hidden -translate-x-1/2 text-[10px] font-semibold uppercase tracking-[0.2em] text-faint sm:block">Jumlah terjual →</span>

                {['potensi', 'bintang', 'evaluasi', 'andalan'].map((key) => {
                    const group = MATRIX_GROUPS[key];
                    const Icon = ICON[key];
                    const list = groups[key];
                    return (
                        <section key={key} className={cx('rounded-[18px] border p-4', STYLE[key])}>
                            <div className="flex items-start gap-3">
                                <span className={cx('grid h-9 w-9 shrink-0 place-items-center rounded-[11px]', ICON_STYLE[key])}>
                                    <Icon className="h-4 w-4" aria-hidden="true" />
                                </span>
                                <div className="min-w-0">
                                    <h3 className="font-display text-xl font-semibold leading-tight text-navy">
                                        {group.title} <span className="font-sans text-xs font-semibold text-faint">· {list.length} menu</span>
                                    </h3>
                                    <p className="text-xs font-semibold text-soft">{group.subtitle}</p>
                                </div>
                            </div>
                            <ul className="stagger mt-3 flex flex-wrap gap-2">
                                {list.length === 0 && <li className="text-xs text-faint">Belum ada menu di kelompok ini</li>}
                                {list.map((row) => (
                                    <li key={row.menuId} className="flex items-center gap-2 rounded-full bg-panel py-1 pl-1 pr-3 text-xs shadow-[var(--shadow-soft)]">
                                        <MenuThumb menu={row.menu} className="h-6 w-6 rounded-full" iconClass="h-3 w-3" />
                                        <span className="font-semibold text-ink">{row.menu.name}</span>
                                        <span className="tabular-nums text-faint">{row.sold} porsi</span>
                                    </li>
                                ))}
                            </ul>
                            <p className="mt-3 text-xs leading-relaxed text-soft">
                                <span className="font-semibold text-ink">Saran: </span>
                                {group.advice}
                            </p>
                        </section>
                    );
                })}
            </div>
        </Card>
    );
}
