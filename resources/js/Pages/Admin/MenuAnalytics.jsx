import { Crown, Eye, ShoppingCart, TrendingUp } from 'lucide-react';
import { useMemo, useState } from 'react';

import { SegmentedControl } from '@/Components/Shared/FilterChips';
import PageHeader from '@/Components/Shared/PageHeader';
import Card, { CardHeader } from '@/Components/UI/Card';
import MenuThumb from '@/Components/UI/MenuThumb';
import { ANALYTICS_PERIODS, menuAnalytics as mockAnalytics } from '@/Data/mock/menuAnalytics';
import { menus as mockMenus } from '@/Data/mock/menus';
import AdminLayout from '@/Layouts/AdminLayout';
import MenuInsights from '@/Pages/Admin/Partials/MenuInsights';
import MenuMatrix from '@/Pages/Admin/Partials/MenuMatrix';
import MenuRanking from '@/Pages/Admin/Partials/MenuRanking';
import { formatCurrency, formatPercent } from '@/Utils/formatCurrency';
import { buildMenuStats, classifyMenus, findInsights, RANKING_METRICS, rankBy } from '@/Utils/menuAnalytics';

const TABS = Object.entries(RANKING_METRICS).map(([value, meta]) => ({ value, label: meta.label }));
const TOP_COUNT = 10;

/**
 * Analisis menu: terlaris (porsi lunas), omzet, laba, dan paling diminati (masuk keranjang),
 * plus matriks menu dan temuan otomatis.
 * Route: GET /admin/analisis-menu?periode=7-hari
 * Props backend: analytics { [periode]: [{ menuId, sold, revenue, profit, views, addedToCart }] }, menus
 * Terlaris/omzet/laba hanya dari pesanan lunas & memakai snapshot harga + HPP per transaksi.
 */
export default function MenuAnalytics({ analytics = mockAnalytics, menus = mockMenus }) {
    const [period, setPeriod] = useState('7-hari');
    const [metric, setMetric] = useState('sold');
    const [showAll, setShowAll] = useState(false);

    const stats = useMemo(() => buildMenuStats(analytics[period] ?? [], menus), [analytics, period, menus]);
    const ranked = useMemo(() => rankBy(stats, metric), [stats, metric]);
    const matrix = useMemo(() => classifyMenus(stats), [stats]);
    const insights = useMemo(() => findInsights(stats), [stats]);

    const top = (key) => rankBy(stats, key)[0];
    const totalSold = stats.reduce((sum, row) => sum + row.sold, 0);
    const bestSeller = top('sold');
    const mostWanted = top('addedToCart');
    const mostProfit = top('profit');
    const totalCart = stats.reduce((sum, row) => sum + row.addedToCart, 0);
    const conversion = totalCart ? totalSold / totalCart : 0;
    const periodLabel = ANALYTICS_PERIODS.find((item) => item.value === period)?.label.toLowerCase();

    return (
        <AdminLayout title="Analisis Menu">
            <PageHeader
                title="Analisis Menu"
                subtitle="Menu terlaris dari pesanan lunas & menu yang paling diminati pelanggan"
                actions={<SegmentedControl label="Periode" options={ANALYTICS_PERIODS} value={period} onChange={setPeriod} />}
            />

            <div className="stagger grid gap-3 sm:grid-cols-2 xl:grid-cols-4" key={period}>
                <Highlight icon={Crown} label="Terlaris" row={bestSeller} value={`${bestSeller?.sold ?? 0} porsi`} hint={`${formatPercent((bestSeller?.sold ?? 0) / Math.max(totalSold, 1))} dari ${totalSold} porsi`} dark />
                <Highlight icon={ShoppingCart} label="Paling diminati" row={mostWanted} value={`${mostWanted?.addedToCart ?? 0}× keranjang`} hint={`Dilihat ${mostWanted?.views ?? 0}×`} />
                <Highlight icon={TrendingUp} label="Laba terbesar" row={mostProfit} value={formatCurrency(mostProfit?.profit ?? 0)} hint={`Margin ${formatPercent(mostProfit?.marginRate ?? 0)}`} />
                <Highlight icon={Eye} label="Keranjang jadi dibeli" value={formatPercent(conversion)} hint={`${totalSold} porsi dari ${totalCart} kali masuk keranjang`} />
            </div>

            <div className="mt-4 grid gap-4 xl:grid-cols-[1fr_380px]">
                <Card>
                    <CardHeader title={`Peringkat menu · ${periodLabel}`} subtitle={RANKING_METRICS[metric].description} className="items-center" action={<SegmentedControl label="Urutkan berdasarkan" options={TABS} value={metric} onChange={setMetric} />} />
                    <MenuRanking rows={showAll ? ranked : ranked.slice(0, TOP_COUNT)} metric={metric} />
                    {ranked.length > TOP_COUNT && (
                        <button
                            type="button"
                            onClick={() => setShowAll((value) => !value)}
                            className="mt-4 w-full rounded-[12px] border border-line py-2.5 text-sm font-semibold text-navy transition hover:border-gold/60 hover:bg-raised active:scale-[0.99]"
                        >
                            {showAll ? `Tampilkan ${TOP_COUNT} teratas saja` : `Tampilkan semua ${ranked.length} menu`}
                        </button>
                    )}
                </Card>
                <MenuInsights {...insights} />
            </div>

            <div className="mt-4">
                <MenuMatrix {...matrix} />
            </div>

            <p className="mt-4 text-xs leading-relaxed text-faint">
                Terlaris, omzet, dan laba hanya dihitung dari pesanan lunas memakai harga & HPP saat transaksi (snapshot). Diminati dihitung dari berapa kali menu ditambahkan ke
                keranjang per sesi meja, termasuk yang akhirnya tidak dibeli.
            </p>
        </AdminLayout>
    );
}

function Highlight({ icon: Icon, label, row, value, hint, dark = false }) {
    return (
        <div className={dark ? 'rounded-[20px] bg-gradient-to-br from-navy to-navy-deep p-4 text-white shadow-[var(--shadow-lift)]' : 'rounded-[20px] border border-line bg-panel p-4 shadow-[var(--shadow-soft)]'}>
            <div className="flex items-center justify-between">
                <p className={dark ? 'text-[11px] font-semibold uppercase tracking-[0.12em] text-gold-soft' : 'text-[11px] font-semibold uppercase tracking-[0.12em] text-faint'}>{label}</p>
                <Icon className={dark ? 'h-4 w-4 text-gold' : 'h-4 w-4 text-warn'} aria-hidden="true" />
            </div>
            {row ? (
                <div className="mt-2 flex items-center gap-2.5">
                    <MenuThumb menu={row.menu} className="h-9 w-9 shrink-0 rounded-[10px]" iconClass="h-4 w-4" />
                    <p className={dark ? 'truncate font-display text-xl font-semibold text-white' : 'truncate font-display text-xl font-semibold text-navy'}>{row.menu.name}</p>
                </div>
            ) : (
                <p className="mt-2 font-display text-[1.7rem] font-semibold leading-none text-navy">{value}</p>
            )}
            <p className={dark ? 'mt-2 text-sm font-bold text-gold-soft' : row ? 'mt-2 text-sm font-bold text-navy' : 'mt-2 text-xs text-faint'}>{row ? value : hint}</p>
            {row && <p className={dark ? 'text-xs text-white/65' : 'text-xs text-faint'}>{hint}</p>}
        </div>
    );
}
