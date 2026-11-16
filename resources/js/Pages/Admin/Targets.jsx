import { router } from '@inertiajs/react';
import { CalendarDays, Info, Pencil } from 'lucide-react';
import { useEffect, useState } from 'react';

import PageHeader from '@/Components/Shared/PageHeader';
import Badge from '@/Components/UI/Badge';
import Button from '@/Components/UI/Button';
import Card, { CardHeader } from '@/Components/UI/Card';
import Table, { TableCell, TableRow } from '@/Components/UI/Table';
import { salesTarget as mockSalesTarget } from '@/Data/mock/reports';
import AdminLayout from '@/Layouts/AdminLayout';
import CumulativeChart from '@/Pages/Admin/Partials/CumulativeChart';
import TargetFormModal from '@/Pages/Admin/Partials/TargetFormModal';
import { cx } from '@/Utils/classNames';
import { formatCurrency, formatPercent } from '@/Utils/formatCurrency';
import { SHORT_DAY_NAMES } from '@/Utils/formatDate';
import { analyseTarget, roundTo } from '@/Utils/salesTarget';

const FIRST_WEEKDAY = 0; // 1 November 2026 jatuh pada hari Minggu
const WEEK_STATE = {
    selesai: { label: 'Selesai', tone: 'success' },
    berjalan: { label: 'Berjalan', tone: 'warn' },
    belum: { label: 'Belum mulai', tone: 'neutral' },
};

/**
 * Pencapaian target penjualan bulanan (Gambar 2.10 di proposal).
 * Route: GET /admin/target?bulan=2026-11
 * Props backend: salesTarget { month, monthlyTarget, daysInMonth, dailyTarget, daily[], weeks[] }
 */
export default function AdminTargets({ salesTarget = mockSalesTarget }) {
    const [target, setTarget] = useState(salesTarget);
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);

    // `salesTarget` berganti setiap halaman ini dimuat ulang Inertia (mis.
    // setelah `saveTarget` sukses, backend menghitung ulang target mingguan).
    useEffect(() => {
        setTarget(salesTarget);
    }, [salesTarget]);

    const stats = analyseTarget(target);
    const progress = stats.realised / target.monthlyTarget;
    const onTrack = stats.projection >= target.monthlyTarget;
    const recentDays = target.daily.map((value, index) => ({ value, day: index + 1 })).slice(-6).reverse();

    const saveTarget = (monthlyTarget) => {
        setSaving(true);
        router.put(
            '/admin/target',
            { month: target.monthYear, monthly_target: monthlyTarget },
            {
                onSuccess: () => setEditing(false),
                onFinish: () => setSaving(false),
            },
        );
    };

    return (
        <AdminLayout title="Target Penjualan">
            <PageHeader
                title="Target Penjualan"
                subtitle="Pantau pencapaian omzet terhadap target bulanan · diperbarui otomatis dari transaksi lunas"
                actions={
                    <>
                        <span className="inline-flex h-11 items-center gap-2 rounded-full border border-line-strong bg-panel px-4 text-sm font-bold text-navy">
                            <CalendarDays className="h-4 w-4" aria-hidden="true" />
                            {target.month}
                        </span>
                        <Button onClick={() => setEditing(true)}>
                            <Pencil className="h-4 w-4" aria-hidden="true" />
                            Atur Target
                        </Button>
                    </>
                }
            />

            <div className="stagger grid gap-3 md:grid-cols-2 xl:grid-cols-[1.5fr_1fr_1fr_1fr]">
                <div className="rounded-[20px] bg-gradient-to-br from-navy to-navy-deep p-4 text-white shadow-[var(--shadow-lift)]">
                    <div className="flex items-center justify-between gap-2">
                        <p className="text-sm text-white/75">Realisasi omzet bulan ini</p>
                        <span className="rounded-full bg-gold-soft/20 px-2.5 py-1 text-xs font-bold text-gold-soft">{formatPercent(progress, 1)} dari target</span>
                    </div>
                    <p className="mt-1 text-[26px] font-extrabold text-gold-soft">{formatCurrency(stats.realised)}</p>
                    <ProgressBar ratio={progress} className="mt-2 h-2.5 bg-white/15" barClass="bg-gold" />
                    <p className="mt-2 text-xs text-white/75">
                        Target {formatCurrency(target.monthlyTarget)} · hari ke-{stats.days} dari {target.daysInMonth}
                    </p>
                </div>
                <Tile label="Sisa target" value={formatCurrency(Math.max(0, target.monthlyTarget - stats.realised))} hint={`${stats.remainingDays} hari tersisa`} />
                <Tile label="Dibutuhkan per hari" value={formatCurrency(roundTo(stats.needed, 1000))} hint={`Rata-rata saat ini ${formatCurrency(roundTo(stats.average, 1000))}`} tone="text-crimson" />
                <Tile
                    label="Proyeksi akhir bulan"
                    value={formatCurrency(roundTo(stats.projection, 100000))}
                    tone={onTrack ? 'text-success' : 'text-warn'}
                    hint={
                        <span className="flex items-center gap-2">
                            <Badge tone={onTrack ? 'success' : 'warn'}>{onTrack ? 'Sesuai jalur' : 'Perlu dikejar'}</Badge>
                            {formatPercent(stats.projection / target.monthlyTarget)} dari target
                        </span>
                    }
                />
            </div>

            <div className="mt-4 grid gap-4 xl:grid-cols-[1fr_340px]">
                <div className="min-w-0 space-y-4">
                    <Card>
                        <CardHeader
                            title="Omzet kumulatif vs target"
                            className="mb-0 items-center"
                            action={
                                <div className="flex gap-4 text-xs text-soft">
                                    <Legend className="h-[3px] bg-navy" label="Realisasi" />
                                    <Legend className="border-t-2 border-dashed border-faint" label="Target" />
                                    <Legend className="border-t-2 border-dashed border-gold" label="Proyeksi" />
                                </div>
                            }
                        />
                        <CumulativeChart target={target} stats={stats} />
                        <p className="text-xs text-faint">Tanggal ({target.month}) · omzet dihitung dari transaksi lunas, sebelum pajak</p>
                    </Card>

                    <div>
                        <div className="mb-2 flex items-center justify-between px-1">
                            <h2 className="font-extrabold text-navy">Pencapaian harian</h2>
                            <span className="text-xs text-faint">Target harian {formatCurrency(target.dailyTarget)}</span>
                        </div>
                        <Table columns={['Tanggal', 'Omzet', 'Progres', '%', 'Status']} tone="light" minWidth="min-w-[620px]">
                            {recentDays.map(({ value, day }) => {
                                const ratio = value / target.dailyTarget;
                                const reached = ratio >= 1;
                                return (
                                    <TableRow key={day}>
                                        <TableCell>
                                            {SHORT_DAY_NAMES[(FIRST_WEEKDAY + day - 1) % 7]}, {day} Nov
                                        </TableCell>
                                        <TableCell className="font-semibold">{formatCurrency(value)}</TableCell>
                                        <TableCell>
                                            <ProgressBar ratio={ratio} className="h-2 w-44 bg-raised" barClass={reached ? 'bg-success' : 'bg-gold'} />
                                        </TableCell>
                                        <TableCell className="font-semibold">{formatPercent(ratio)}</TableCell>
                                        <TableCell>
                                            <Badge tone={reached ? 'success' : 'warn'}>{reached ? 'Tercapai' : 'Di bawah target'}</Badge>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </Table>
                    </div>
                </div>

                <Card className="flex flex-col">
                    <CardHeader title="Target mingguan" className="mb-2" />
                    <ul className="stagger flex-1">
                        {stats.weeks.map((week) => {
                            const ratio = week.value / week.target;
                            const state = WEEK_STATE[week.state];
                            return (
                                <li key={week.label} className="border-t border-line py-3 first:border-t-0">
                                    <div className="flex items-center justify-between gap-2">
                                        <p className="text-sm">
                                            <span className="font-bold text-navy">{week.label}</span> <span className="text-xs text-faint">· {week.range}</span>
                                        </p>
                                        <Badge tone={state.tone}>{state.label}</Badge>
                                    </div>
                                    <ProgressBar ratio={ratio} className="mt-2 h-2 bg-raised" barClass={ratio >= 1 ? 'bg-success' : 'bg-gold'} />
                                    <div className="mt-1.5 flex justify-between text-xs text-faint">
                                        <span>
                                            {formatCurrency(week.value)} / {formatCurrency(week.target)}
                                        </span>
                                        <span className="font-bold text-ink">{formatPercent(ratio)}</span>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                    {!onTrack && (
                        <p className="mt-3 flex gap-2 rounded-2xl bg-warn-tint p-3 text-xs leading-relaxed text-warn">
                            <Info className="h-4 w-4 shrink-0" aria-hidden="true" />
                            Untuk mencapai target, omzet harian perlu naik sekitar {formatCurrency(roundTo(stats.needed - stats.average, 10000))} dari rata-rata saat ini.
                        </p>
                    )}
                </Card>
            </div>

            {editing && <TargetFormModal target={target} onClose={() => (saving ? null : setEditing(false))} onSave={saveTarget} saving={saving} />}
        </AdminLayout>
    );
}

function ProgressBar({ ratio, className, barClass }) {
    return (
        <div className={cx('rounded-full', className)}>
            <div className={cx('h-full origin-left animate-grow-x rounded-full [animation-delay:250ms]', barClass)} style={{ width: `${Math.min(ratio, 1) * 100}%` }} />
        </div>
    );
}

function Tile({ label, value, hint, tone = 'text-navy' }) {
    return (
        <div className="rounded-[20px] border border-line bg-panel p-4 shadow-[var(--shadow-soft)]">
            <p className="text-sm text-faint">{label}</p>
            <p className={cx('mt-1 text-2xl font-extrabold', tone)}>{value}</p>
            <div className="mt-1 text-xs text-faint">{hint}</div>
        </div>
    );
}

function Legend({ className, label }) {
    return (
        <span className="flex items-center gap-1.5">
            <span className={cx('inline-block w-4', className)} />
            {label}
        </span>
    );
}
