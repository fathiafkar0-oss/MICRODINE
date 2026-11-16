import { ChefHat, CircleCheck, RefreshCw, Timer, Wallet } from 'lucide-react';
import { useMemo, useState } from 'react';
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
    const { format, taxRate } = useCurrency(restaurant);

    const filtered = useMemo(() => {
        const keyword = query.trim().toLowerCase();
        return keyword ? orders.filter((order) => `${order.code} meja ${order.table} ${order.customer}`.toLowerCase().includes(keyword)) : orders;
    }, [orders, query]);

    const byStatus = (status) => filtered.filter((order) => order.status === status);
    const countOf = (status) => orders.filter((order) => order.status === status).length;
    const setStatus = (code, status) => setOrders((prev) => prev.map((order) => (order.code === code ? { ...order, status } : order)));

    const confirmCash = (order, amount, change) => {
        setStatus(order.code, 'diproses');
        setCashOrder(null);
        toast.success(`${order.code} lunas · kembalian ${format(change)}`);
    };

    const markDone = (order) => {
        setStatus(order.code, 'selesai');
        toast.success(`${order.code} selesai dimasak`);
    };

    const deliver = (order) => {
        setOrders((prev) => prev.filter((item) => item.code !== order.code));
        toast.success(`${order.code} diantar ke Meja ${order.table}`);
    };

    const actionFor = (order) => {
        if (order.status === 'menunggu_bayar') {
            return order.method === 'tunai' ? (
                <Button variant="navy" block onClick={() => setCashOrder(order)}>
                    Terima Tunai
                </Button>
            ) : (
                <p className="rounded-xl bg-raised px-3 py-2.5 text-center text-xs font-semibold text-soft">Menunggu notifikasi QRIS…</p>
            );
        }
        if (order.status === 'diproses') {
            return (
                <Button variant="navy" block onClick={() => markDone(order)}>
                    Tandai Selesai
                </Button>
            );
        }
        return (
            <Button variant="navy" block onClick={() => deliver(order)}>
                Antar ke Meja {order.table}
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
                            onClick={() => toast('Antrean sudah terbaru')}
                            className="grid h-10 w-10 place-items-center rounded-xl border border-line bg-panel text-soft hover:bg-raised"
                        >
                            <RefreshCw className="h-4 w-4" />
                        </button>
                    </>
                }
            />

            <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
                <StatCard icon={Timer} label="Menunggu bayar" value={countOf('menunggu_bayar')} tone="gold" highlight={countOf('menunggu_bayar') > 0} />
                <StatCard icon={ChefHat} label="Sedang diproses" value={countOf('diproses')} />
                <StatCard icon={CircleCheck} label="Selesai hari ini" value={stats.doneToday + countOf('selesai')} tone="success" />
                <StatCard icon={Wallet} label="Omzet shift ini" value={format(stats.shiftOmzet)} />
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-3">
                {COLUMNS.map((column) => {
                    const list = byStatus(column.status);
                    return (
                        <section key={column.status} className="flex flex-col rounded-[20px] border border-navy/70 bg-panel/60 p-3" aria-label={column.title}>
                            <header className="mb-3 flex items-center justify-between px-1.5 pt-1">
                                <h2 className="flex items-center gap-2 text-[15px] font-bold text-navy">
                                    <span className={cx('h-2 w-2 rounded-full', TONE_DOT[column.tone])} aria-hidden="true" />
                                    {column.title}
                                </h2>
                                <span className="rounded-full bg-info-tint px-2 py-0.5 text-xs font-bold text-navy">{list.length}</span>
                            </header>
                            <div className="flex flex-col gap-3">
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
