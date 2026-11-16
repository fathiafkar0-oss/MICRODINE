import { Link } from '@inertiajs/react';
import { ChevronRight, ReceiptText } from 'lucide-react';

import Badge, { OrderStatusBadge } from '@/Components/UI/Badge';
import Card from '@/Components/UI/Card';
import { cx } from '@/Utils/classNames';
import { isPaid } from '@/Utils/status';

/**
 * Semua pesanan dalam satu sesi meja (pesanan pertama + tambahan), dengan total yang sudah dibayar.
 * Hanya tampil jika sesi punya lebih dari satu pesanan.
 */
export default function SessionOrders({ table, orders, currentCode, totalOf, format }) {
    if (orders.length < 2) return null;
    const paidTotal = orders.filter(isPaid).reduce((sum, order) => sum + totalOf(order), 0);
    const unpaid = orders.filter((order) => order.status === 'menunggu_bayar');

    return (
        <Card variant="plain">
            <div className="mb-3 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-sm font-bold">
                    <ReceiptText className="h-4 w-4 text-gold" aria-hidden="true" />
                    Pesanan di Meja {table}
                </h2>
                <span className="text-xs text-faint">{orders.length} pesanan</span>
            </div>
            <ul className="stagger space-y-2">
                {orders.map((order, index) => {
                    const current = order.code === currentCode;
                    const href = order.status === 'menunggu_bayar' ? `/pesanan/${order.code}/bayar` : `/pesanan/${order.code}`;
                    return (
                        <li key={order.code}>
                            <Link
                                href={href}
                                aria-current={current ? 'page' : undefined}
                                className={cx(
                                    'flex items-center gap-3 rounded-[14px] px-3 py-2.5 transition active:scale-[0.99]',
                                    current ? 'bg-gold-tint ring-1 ring-gold/40' : 'bg-raised/70 hover:bg-raised',
                                )}
                            >
                                <div className="min-w-0 flex-1">
                                    <p className="flex items-center gap-2 text-sm font-bold text-navy">
                                        {order.code}
                                        {index > 0 ? <Badge tone="gold">Tambahan {index}</Badge> : <span className="text-xs font-semibold text-faint">Pesanan pertama</span>}
                                    </p>
                                    <p className="truncate text-xs text-faint">{order.items.map((item) => `${item.qty}× ${item.name}`).join(', ')}</p>
                                </div>
                                <div className="flex shrink-0 flex-col items-end gap-1">
                                    <span className="text-sm font-bold tabular-nums">{format(totalOf(order))}</span>
                                    <OrderStatusBadge status={order.status} />
                                </div>
                                <ChevronRight className="h-4 w-4 shrink-0 text-faint" aria-hidden="true" />
                            </Link>
                        </li>
                    );
                })}
            </ul>
            <div className="mt-3 flex items-baseline justify-between border-t border-line pt-3">
                <span className="text-sm font-bold">Total sudah dibayar</span>
                <span className="text-lg font-extrabold text-navy tabular-nums">{format(paidTotal)}</span>
            </div>
            {unpaid.length > 0 && <p className="mt-1 text-xs font-semibold text-warn">{unpaid.map((order) => order.code).join(', ')} belum dibayar. Ketuk untuk membayar.</p>}
        </Card>
    );
}
