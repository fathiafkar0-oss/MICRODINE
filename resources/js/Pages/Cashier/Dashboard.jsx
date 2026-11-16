import { router } from '@inertiajs/react';
import { ChefHat, CircleCheck, RefreshCw, Timer, Wallet } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';

import CashPaymentModal from '@/Components/Shared/CashPaymentModal';
import LiveBadge from '@/Components/Shared/LiveBadge';
import OrderCard from '@/Components/Shared/OrderCard';
import PageHeader from '@/Components/Shared/PageHeader';
import SearchBar from '@/Components/Shared/SearchBar';
import Button from '@/Components/UI/Button';
import StatCard from '@/Components/UI/StatCard';
import { orders as mockOrders } from '@/Data/mock/orders';
import { restaurant as mockRestaurant } from '@/Data/mock/restaurant';
import useCurrency from '@/Hooks/useCurrency';
import CashierLayout from '@/Layouts/CashierLayout';
import { cx } from '@/Utils/classNames';
import { formatLongDate } from '@/Utils/formatDate';
import { TONE_DOT } from '@/Utils/status';

const COLUMNS = [
    { status: 'menunggu_bayar', title: 'Menunggu Pembayaran', tone: 'warn' },
    { status: 'diproses', title: 'Diproses', tone: 'info' },
    { status: 'selesai', title: 'Selesai', tone: 'success' },
];

/**
 * Antrean pesanan kasir (papan Kanban) — halaman utama kasir.
 * Route: GET /kasir
 * Props backend: orders (pesanan aktif hari ini), restaurant, stats { doneToday, shiftOmzet }
 * Real-time: dengarkan event pesanan via Laravel Echo + Reverb lalu perbarui `orders`.
 */
export default function CashierDashboard({ orders: initialOrders = mockOrders, restaurant = mockRestaurant, stats = { doneToday: 27, shiftOmzet: 2140000 } }) {
    const [orders, setOrders] = useState(initialOrders);
    const [query, setQuery] = useState('');
    const [cashOrder, setCashOrder] = useState(null);
    const [busyCode, setBusyCode] = useState(null);
    const { format, taxRate } = useCurrency(restaurant);

    // Props `orders` berganti setiap Inertia memuat ulang halaman ini (mis. setelah
    // redirect `back()` dari aksi di bawah, atau siaran WebSocket memicu router.reload()).
    useEffect(() => {
        setOrders(initialOrders);
    }, [initialOrders]);

    const filtered = useMemo(() => {
        const keyword = query.trim().toLowerCase();
        return keyword ? orders.filter((order) => `${order.code} meja ${order.table} ${order.customer}`.toLowerCase().includes(keyword)) : orders;
    }, [orders, query]);

    const byStatus = (status) => filtered.filter((order) => order.status === status);
    const countOf = (status) => orders.filter((order) => order.status === status).length;

    const confirmCash = (order, amount) => {
        setBusyCode(order.code);
        router.post(
            `/kasir/pesanan/${order.id}/pay-cash`,
            { cash_received: amount },
            {
                preserveScroll: true,
                onSuccess: () => setCashOrder(null),
                onFinish: () => setBusyCode(null),
            },
        );
    };

    const markDone = (order) => {
        setBusyCode(order.code);
        router.patch(`/dapur/pesanan/${order.id}/status`, { status: 'done' }, { preserveScroll: true, onFinish: () => setBusyCode(null) });
    };

    const deliver = (order) => {
        setBusyCode(order.code);
        router.post(`/kasir/pesanan/${order.id}/serve`, {}, { preserveScroll: true, onFinish: () => setBusyCode(null) });
    };

    const actionFor = (order) => {
        const busy = busyCode === order.code;
        if (order.status === 'menunggu_bayar') {
            return order.method === 'tunai' ? (
                <Button variant="navy" block disabled={busy} onClick={() => setCashOrder(order)}>
                    Terima Tunai
                </Button>
            ) : (
                <p className="rounded-xl bg-raised px-3 py-2.5 text-center text-xs font-semibold text-soft">Menunggu notifikasi QRIS…</p>
            );
        }
        if (order.status === 'diproses') {
            return (
                <Button variant="navy" block disabled={busy} onClick={() => markDone(order)}>
                    {busy ? 'Memproses…' : 'Tandai Selesai'}
                </Button>
            );
        }
        return (
            <Button variant="navy" block disabled={busy} onClick={() => deliver(order)}>
                {busy ? 'Memproses…' : `Antar ke Meja ${order.table}`}
            </Button>
        );
    };

    return (
        <CashierLayout title="Antrean Pesanan">
            <PageHeader
                title="Antrean Pesanan"
                subtitle={`${formatLongDate()} · Shift pagi`}
                actions={
                    <>
                        <LiveBadge />
                        <SearchBar value={query} onChange={setQuery} placeholder="Cari kode / meja / nama..." label="Cari pesanan" className="w-60" />
                        <button
                            type="button"
                            aria-label="Muat ulang antrean"
                            onClick={() => router.reload({ onSuccess: () => toast('Antrean sudah terbaru') })}
                            className="grid h-10 w-10 place-items-center rounded-xl border border-line bg-panel text-soft hover:bg-raised"
                        >
                            <RefreshCw className="h-4 w-4" />
                        </button>
                    </>
                }
            />

            <div className="stagger grid grid-cols-2 gap-3 xl:grid-cols-4">
                <StatCard icon={Timer} label="Menunggu bayar" value={countOf('menunggu_bayar')} tone="gold" highlight={countOf('menunggu_bayar') > 0} />
                <StatCard icon={ChefHat} label="Sedang diproses" value={countOf('diproses')} />
                <StatCard icon={CircleCheck} label="Selesai hari ini" value={stats.doneToday + countOf('selesai')} tone="success" />
                <StatCard icon={Wallet} label="Omzet shift ini" value={format(stats.shiftOmzet)} />
            </div>

            <div className="stagger mt-6 grid gap-4 lg:grid-cols-3">
                {COLUMNS.map((column) => {
                    const list = byStatus(column.status);
                    return (
                        <section key={column.status} className="flex flex-col rounded-[24px] border border-line bg-raised/70 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]" aria-label={column.title}>
                            <header className="mb-3 flex items-center justify-between px-1.5 pt-1">
                                <h2 className="flex items-center gap-2 font-display text-xl font-semibold text-navy">
                                    <span className={cx('h-2 w-2 rounded-full', TONE_DOT[column.tone])} aria-hidden="true" />
                                    {column.title}
                                </h2>
                                <span className="grid h-6 min-w-6 place-items-center rounded-full bg-navy px-1.5 text-xs font-bold text-white tabular-nums">{list.length}</span>
                            </header>
                            <div className="stagger flex flex-col gap-3">
                                {list.length === 0 && <p className="rounded-2xl border border-dashed border-line-strong px-4 py-8 text-center text-sm text-faint">Belum ada pesanan</p>}
                                {list.map((order) => (
                                    <OrderCard key={order.code} order={order} taxRate={taxRate} action={actionFor(order)} />
                                ))}
                            </div>
                        </section>
                    );
                })}
            </div>

            <p className="mt-4 text-xs text-faint">Pesanan yang tidak dibayar dalam {restaurant.paymentDeadlineMinutes} menit dibatalkan otomatis.</p>

            <CashPaymentModal order={cashOrder} taxRate={taxRate} onClose={() => setCashOrder(null)} onConfirm={confirmCash} />
        </CashierLayout>
    );
}
