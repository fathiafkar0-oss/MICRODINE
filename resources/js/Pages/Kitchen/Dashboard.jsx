import { CircleCheck, Flame } from 'lucide-react';
import { useEffect, useState } from 'react';

import StatCard from '@/Components/UI/StatCard';
import { orders as mockOrders } from '@/Data/mock/orders';
import useLiveReload from '@/Hooks/useLiveReload';
import KitchenLayout from '@/Layouts/KitchenLayout';
import KitchenTicket from '@/Pages/Kitchen/Partials/KitchenTicket';

/**
 * Layar dapur (Kitchen Display System) — menampilkan antrean pesanan yang perlu dimasak.
 * Route: GET /dapur
 * Sesuai aturan: Dapur hanya melihat antrean masak; konfirmasi pesanan selesai dilakukan oleh kasir.
 * Real-time: `useLiveReload` memuat ulang daftar antrean otomatis tanpa refresh manual.
 */
export default function KitchenDashboard({ orders: initial = mockOrders.filter((order) => order.status === 'diproses'), doneToday = 27 }) {
    const [orders, setOrders] = useState(initial);
    useLiveReload('kitchen.kds', ['.order.paid', '.order.kitchen-status-updated'], ['orders', 'doneToday']);

    useEffect(() => {
        setOrders(initial);
    }, [initial]);

    const sorted = [...orders].sort((a, b) => b.minutesAgo - a.minutesAgo);

    const summary = (
        <div className="stagger grid gap-3 text-ink sm:grid-cols-2 lg:w-1/2">
            <StatCard icon={Flame} tone="warn" label="Perlu dimasak" value={orders.length} className="border-transparent" />
            <StatCard icon={CircleCheck} tone="success" label="Selesai hari ini" value={doneToday} className="border-transparent" />
        </div>
    );

    return (
        <KitchenLayout summary={summary}>
            <div className="mb-4 flex items-center justify-between">
                <div>
                    <h2 className="flex items-center gap-2 font-display text-2xl font-semibold text-navy">
                        <span className="h-2.5 w-2.5 rounded-full bg-warn" aria-hidden="true" />
                        Antrean Masak Dapur
                    </h2>
                    <p className="mt-0.5 text-xs text-soft">
                        Hanya menampilkan pesanan yang perlu dimasak · Konfirmasi selesai dilakukan oleh kasir
                    </p>
                </div>
                <span className="rounded-full bg-navy px-3 py-1 text-sm font-bold text-white">{orders.length}</span>
            </div>

            {sorted.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-line-strong bg-panel px-6 py-20 text-center">
                    <CircleCheck className="mx-auto h-12 w-12 text-success" aria-hidden="true" />
                    <p className="mt-3 text-xl font-extrabold text-navy">Semua pesanan sudah selesai dimasak</p>
                    <p className="mt-1 text-faint">Pesanan baru yang lunas akan muncul otomatis di sini.</p>
                </div>
            ) : (
                <div className="stagger grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
                    {sorted.map((order) => (
                        <KitchenTicket key={order.code} order={order} />
                    ))}
                </div>
            )}
        </KitchenLayout>
    );
}
