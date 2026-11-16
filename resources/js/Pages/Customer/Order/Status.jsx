import { Check, ChefHat, Clock, Timer } from 'lucide-react';
import { useMemo } from 'react';

import { OrderStatusBadge } from '@/Components/UI/Badge';
import Button from '@/Components/UI/Button';
import Card from '@/Components/UI/Card';
import { restaurant as mockRestaurant } from '@/Data/mock/restaurant';
import useCurrency from '@/Hooks/useCurrency';
import CustomerLayout, { TablePill } from '@/Layouts/CustomerLayout';
import { cx } from '@/Utils/classNames';
import { resolveOrder } from '@/Utils/orderStorage';
import { PAYMENT_METHOD_LABEL } from '@/Utils/status';

/**
 * Pelacak pesanan setelah lunas: diterima -> dimasak -> siap disajikan.
 * Route: GET /pesanan/{code}
 * Backend: kirim props `order`; status berubah real-time lewat event WebSocket (Laravel Reverb).
 */
export default function OrderStatus({ code = 'A-024', order: orderProp, restaurant = mockRestaurant }) {
    const order = useMemo(() => resolveOrder(code, orderProp), [code, orderProp]);
    const { format, bill } = useCurrency(restaurant);
    const { total } = bill(order.items);

    if (order.status === 'menunggu_bayar') {
        return (
            <CustomerLayout title="Status Pesanan" table={order.table}>
                <Card variant="plain" className="mt-4 flex flex-col items-center px-6 py-10 text-center">
                    <span className="grid h-14 w-14 place-items-center rounded-2xl bg-warn-tint text-warn">
                        <Timer className="h-7 w-7" aria-hidden="true" />
                    </span>
                    <p className="mt-4 text-lg font-extrabold text-navy">Pesanan {order.code} belum dibayar</p>
                    <p className="mt-1 text-sm text-soft">Selesaikan pembayaran agar pesanan masuk ke dapur.</p>
                    <Button href={`/pesanan/${order.code}/bayar`} size="lg" className="mt-5">
                        Bayar Sekarang
                    </Button>
                </Card>
            </CustomerLayout>
        );
    }

    const done = order.status === 'selesai' || order.status === 'diantar';
    const timeline = [
        { label: 'Pembayaran diterima', detail: `${order.paidAt ?? '-'} · ${PAYMENT_METHOD_LABEL[order.method]}`, state: 'done' },
        { label: done ? 'Selesai dimasak' : 'Sedang dimasak', detail: 'Dapur', state: done ? 'done' : 'current' },
        { label: order.status === 'diantar' ? 'Sudah diantar' : 'Siap disajikan', detail: `Kami antar ke Meja ${order.table}`, state: done ? 'current' : 'todo' },
    ];

    return (
        <CustomerLayout
            title={done ? 'Pesanan siap' : 'Pesanan sedang dimasak'}
            header={
                <header className="bg-navy px-5 pb-12 pt-6 text-white">
                    <div className="flex items-start justify-between">
                        <span className="grid h-14 w-14 place-items-center rounded-2xl bg-panel text-navy">
                            <ChefHat className="h-7 w-7" aria-hidden="true" />
                        </span>
                        <TablePill number={order.table} />
                    </div>
                    <h1 className="mt-5 text-[28px] font-extrabold leading-tight">{done ? 'Pesanan siap disajikan' : 'Pesanan sedang dimasak'}</h1>
                    <p className="mt-2 flex items-center gap-2 text-sm text-white/75">
                        <Clock className="h-4 w-4" aria-hidden="true" />
                        {done ? 'Pelayan sedang mengantar ke meja Anda' : 'Estimasi siap 10–15 menit'} · Antrean {order.code}
                    </p>
                </header>
            }
            bottom={
                <Button href={`/meja/${order.table}`} size="lg" block>
                    Pesan Menu Lagi
                </Button>
            }
        >
            <div className="-mt-7 space-y-4 pb-4">
                <Card variant="plain">
                    <ol className="space-y-4">
                        {timeline.map((step) => (
                            <li key={step.label} className="flex items-start gap-3">
                                <span
                                    className={cx(
                                        'grid h-7 w-7 shrink-0 place-items-center rounded-full',
                                        step.state === 'done' && 'bg-success text-white',
                                        step.state === 'current' && 'bg-gold',
                                        step.state === 'todo' && 'border-2 border-line-strong',
                                    )}
                                    aria-hidden="true"
                                >
                                    {step.state === 'done' && <Check className="h-4 w-4" />}
                                    {step.state === 'current' && <span className="h-2.5 w-2.5 rounded-full bg-white" />}
                                </span>
                                <div>
                                    <p className={cx('font-bold', step.state === 'todo' ? 'text-faint' : 'text-ink')}>{step.label}</p>
                                    <p className="text-xs text-faint">{step.detail}</p>
                                </div>
                            </li>
                        ))}
                    </ol>
                </Card>

                <Card variant="plain">
                    <div className="mb-3 flex items-center justify-between">
                        <h2 className="text-sm font-bold">Detail pesanan</h2>
                        <OrderStatusBadge status={order.status} />
                    </div>
                    <ul className="space-y-2 text-sm">
                        {order.items.map((item) => (
                            <li key={item.menuId}>
                                <div className="flex justify-between gap-3">
                                    <span>
                                        {item.qty}× {item.name}
                                    </span>
                                    <span className="font-semibold">{format(item.price * item.qty)}</span>
                                </div>
                                {item.note && <p className="text-xs text-faint">Catatan: {item.note}</p>}
                            </li>
                        ))}
                    </ul>
                    <div className="mt-3 flex items-baseline justify-between border-t border-line pt-3">
                        <span className="text-sm font-bold text-success">Total · Lunas via {PAYMENT_METHOD_LABEL[order.method]}</span>
                        <span className="text-xl font-extrabold">{format(total)}</span>
                    </div>
                </Card>

                <p className="text-center text-xs text-faint">
                    Ada kendala? Sebutkan nomor antrean <strong className="text-ink">{order.code}</strong> ke kasir.
                </p>
            </div>
        </CustomerLayout>
    );
}
