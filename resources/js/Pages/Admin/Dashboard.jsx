import { Link } from '@inertiajs/react';
import { CalendarDays, CircleDollarSign, Package, QrCode, ReceiptText, TrendingUp, Wallet } from 'lucide-react';
import { useState } from 'react';

import { SegmentedControl } from '@/Components/Shared/FilterChips';
import PageHeader from '@/Components/Shared/PageHeader';
import Card, { CardHeader } from '@/Components/UI/Card';
import MenuThumb from '@/Components/UI/MenuThumb';
import TrendChart from '@/Components/UI/TrendChart';
import { menus as mockMenus } from '@/Data/mock/menus';
import { dashboard as mockDashboard } from '@/Data/mock/reports';
import AdminLayout from '@/Layouts/AdminLayout';
import { cx } from '@/Utils/classNames';
import { formatCurrency, formatPercent } from '@/Utils/formatCurrency';

const PERIODS = [
    { value: 'hari-ini', label: 'Hari ini' },
    { value: '7-hari', label: '7 hari' },
    { value: '30-hari', label: '30 hari' },
];

/**
 * Ringkasan bisnis admin.
 * Route: GET /admin?periode=hari-ini
 * Props backend: dashboard (dihitung HANYA dari transaksi lunas, sebelum pajak), menus
 */
export default function AdminDashboard({ dashboard = mockDashboard, menus = mockMenus }) {
    const [period, setPeriod] = useState('hari-ini');
    const { today, payment, trend, topMenus } = dashboard;
    const profit = today.omzet - today.hpp;
    const paymentTotal = payment.qris + payment.tunai;
    const sum = (key) => trend.reduce((total, day) => total + day[key], 0);
    const best = trend.reduce((a, b) => (b.omzet > a.omzet ? b : a));

    return (
        <AdminLayout title="Ringkasan Bisnis">
            <PageHeader
                title="Ringkasan Bisnis"
                subtitle="Data hanya dari transaksi lunas · omzet sebelum pajak · diperbarui otomatis"
                actions={
                    <>
                        <SegmentedControl label="Periode" options={PERIODS} value={period} onChange={setPeriod} />
                        <span className="inline-flex h-10 items-center gap-2 rounded-xl border border-line bg-panel px-3 text-sm font-semibold text-navy">
                            <CalendarDays className="h-4 w-4" aria-hidden="true" />8 Nov 2026
                        </span>
                    </>
                }
            />

            <div className="stagger grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <Kpi label="Total Omzet" icon={CircleDollarSign} value={formatCurrency(today.omzet)} hint={`↗ +${formatPercent(today.omzetGrowth)} vs kemarin`} hintTone="text-success" />
                <Kpi label="Total HPP" icon={Package} value={formatCurrency(today.hpp)} hint={`${formatPercent(today.hpp / today.omzet)} dari omzet`} />
                <Kpi label="Laba Kotor" icon={TrendingUp} value={formatCurrency(profit)} valueTone="text-success" hint={`Margin ${formatPercent(profit / today.omzet)}`} hintTone="text-success" />
                <Kpi label="Transaksi Lunas" icon={ReceiptText} value={today.transactions} hint={`↗ +${today.transactionGrowth} dari kemarin`} hintTone="text-success" />
            </div>

            <div className="mt-4 grid gap-4 xl:grid-cols-[1fr_360px]">
                <Card>
                    <CardHeader
                        title="Tren omzet & laba kotor · 14 hari"
                        subtitle="Puncak penjualan di akhir pekan"
                        className="mb-0"
                        action={
                            <div className="flex gap-4 text-xs text-soft">
                                <span className="flex items-center gap-1.5">
                                    <span className="h-2.5 w-2.5 rounded-sm bg-gold" />
                                    Omzet
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <span className="h-2.5 w-2.5 rounded-full bg-success" />
                                    Laba kotor
                                </span>
                            </div>
                        }
                    />
                    <div className="mt-3">
                        <TrendChart data={trend} />
                    </div>
                    <dl className="mt-3 grid grid-cols-2 gap-4 border-t border-line pt-4 md:grid-cols-4">
                        <Mini label="Omzet 14 hari" value={formatCurrency(sum('omzet'))} />
                        <Mini label="Laba kotor 14 hari" value={formatCurrency(sum('laba'))} tone="text-success" />
                        <Mini label="Rata-rata / hari" value={formatCurrency(sum('omzet') / trend.length)} />
                        <Mini label="Hari terbaik" value={`Tgl ${best.label}`} />
                    </dl>
                </Card>

                <div className="stagger space-y-4">
                    <Card>
                        <CardHeader title="Metode pembayaran" className="mb-0" />
                        {[
                            { label: 'QRIS', icon: QrCode, value: payment.qris, color: 'bg-success' },
                            { label: 'Tunai', icon: Wallet, value: payment.tunai, color: 'bg-gold' },
                        ].map(({ label, icon: Icon, value, color }) => (
                            <div key={label} className="mt-4">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="flex items-center gap-2 font-semibold">
                                        <Icon className="h-4 w-4 text-soft" aria-hidden="true" />
                                        {label}
                                    </span>
                                    <span className="text-soft">
                                        {formatCurrency(value)} · {formatPercent(value / paymentTotal)}
                                    </span>
                                </div>
                                <div className="mt-2 h-2.5 rounded-full bg-raised">
                                    <div className={cx('h-full origin-left animate-grow-x rounded-full [animation-delay:300ms]', color)} style={{ width: `${(value / paymentTotal) * 100}%` }} />
                                </div>
                            </div>
                        ))}
                    </Card>

                    <Card>
                        <CardHeader
                            title="Menu terlaris hari ini"
                            className="mb-3"
                            action={
                                <Link href="/admin/analisis-menu" className="text-xs font-bold text-warn transition-colors hover:text-navy">
                                    Lihat analisis →
                                </Link>
                            }
                        />
                        <ul className="stagger space-y-3">
                            {topMenus.map((row) => {
                                const menu = menus.find((item) => item.id === row.menuId);
                                return (
                                    <li key={row.menuId} className="flex items-center gap-3">
                                        <MenuThumb menu={menu} className="h-10 w-10 rounded-lg" iconClass="h-4 w-4" />
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-bold">{menu?.name}</p>
                                            <p className="text-xs text-faint">{row.sold} terjual</p>
                                        </div>
                                        <span className="text-xs font-bold text-success">Laba {formatCurrency(row.profit)}</span>
                                    </li>
                                );
                            })}
                        </ul>
                    </Card>
                </div>
            </div>
        </AdminLayout>
    );
}

function Kpi({ label, icon: Icon, value, hint, valueTone = 'text-navy', hintTone = 'text-faint' }) {
    return (
        <Card padding="md" interactive className="rounded-[20px]">
            <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-faint">{label}</p>
                <span className="grid h-8 w-8 place-items-center rounded-[10px] bg-gold-tint text-warn ring-1 ring-gold/20">
                    <Icon className="h-4 w-4" aria-hidden="true" />
                </span>
            </div>
            <p className={cx('mt-2 text-2xl font-extrabold', valueTone)}>{value}</p>
            <p className={cx('mt-1 text-xs font-semibold', hintTone)}>{hint}</p>
        </Card>
    );
}

function Mini({ label, value, tone = 'text-navy' }) {
    return (
        <div>
            <dt className="text-xs text-faint">{label}</dt>
            <dd className={cx('font-extrabold', tone)}>{value}</dd>
        </div>
    );
}
