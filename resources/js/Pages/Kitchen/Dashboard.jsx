import { router } from '@inertiajs/react';
import { CircleCheck, Flame } from 'lucide-react';
import { useEffect, useState } from 'react';

import StatCard from '@/Components/UI/StatCard';
import { orders as mockOrders } from '@/Data/mock/orders';
import useLiveReload from '@/Hooks/useLiveReload';
import KitchenLayout from '@/Layouts/KitchenLayout';
import KitchenTicket from '@/Pages/Kitchen/Partials/KitchenTicket';

/**
 * Layar dapur (Kitchen Display System) — biasanya ditampilkan di TV dapur.
 * Route: GET /dapur
 * Real-time: `useLiveReload` dengarkan channel privat "kitchen.kds" (lihat
 * routes/channels.php & app/Events/OrderPaidEvent + KitchenStatusUpdatedEvent)
 * lalu muat ulang props `orders`/`doneToday` otomatis — tanpa refresh manual.
 * Backend: PATCH /dapur/pesanan/{id}/status { status: 'done' }
 */
export default function KitchenDashboard({ orders: initial = mockOrders.filter((order) => order.status === 'diproses'), doneToday = 27 }) {
    const [orders, setOrders] = useState(initial);
    const [busyCode, setBusyCode] = useState(null);
    useLiveReload('kitchen.kds', ['.order.paid', '.order.kitchen-status-updated'], ['orders', 'doneToday']);

    // Props `orders`/`doneToday` berganti setiap halaman ini dimuat ulang
    // (termasuk oleh `useLiveReload` di atas).
    useEffect(() => {
        setOrders(initial);
    }, [initial]);

    const sorted = [...orders].sort((a, b) => b.minutesAgo - a.minutesAgo);

    const markDone = (order) => {
        setBusyCode(order.code);
        router.patch(`/dapur/pesanan/${order.id}/status`, { status: 'done' }, { preserveScroll: true, onFinish: () => setBusyCode(null) });
    };

    const summary = (
        <div className="stagger grid gap-3 text-ink sm:grid-cols-2 lg:w-1/2">
            <StatCard icon={Flame} tone="warn" label="Sedang diproses" value={orders.length} className="border-transparent" />
            <StatCard icon={CircleCheck} tone="success" label="Selesai hari ini" value={doneToday} className="border-transparent" />
        </div>
    );

    return (
        <KitchenLayout summary={summary}>
            <div className="mb-4 flex items-center justify-between">
                <h2 className="flex items-center gap-2 font-display text-2xl font-semibold text-navy">
                    <span className="h-2.5 w-2.5 rounded-full bg-info" aria-hidden="true" />
                    Diproses · urut dari yang terlama
                </h2>
                <span className="rounded-full bg-navy px-3 py-1 text-sm font-bold text-white">{orders.length}</span>
            </div>

            {sorted.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-line-strong bg-panel px-6 py-20 text-center">
                    <CircleCheck className="mx-auto h-12 w-12 text-success" aria-hidden="true" />
                    <p className="mt-3 text-xl font-extrabold text-navy">Semua pesanan sudah selesai</p>
                    <p className="mt-1 text-faint">Pesanan baru yang lunas akan muncul otomatis di sini.</p>
                </div>
            ) : (
                <div className="stagger grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
                    {sorted.map((order) => (
                        <KitchenTicket key={order.code} order={order} onDone={markDone} busy={busyCode === order.code} />
                    ))}
                </div>
            )}
        </KitchenLayout>
    );
}
