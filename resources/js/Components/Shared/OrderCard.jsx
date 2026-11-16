import { Clock, QrCode } from 'lucide-react';

import Badge, { TableChip } from '@/Components/UI/Badge';
import { cx } from '@/Utils/classNames';
import { calculateBill, countItems, formatCurrency } from '@/Utils/formatCurrency';
import { isAddition, PAYMENT_METHOD_LABEL } from '@/Utils/status';

/** Kartu pesanan di antrean kasir. `action` diisi tombol sesuai kolom. */
export default function OrderCard({ order, taxRate = 0, action, className = '' }) {
    const { total } = calculateBill(order.items, taxRate);

    return (
        <article className={cx('lift rounded-[18px] border border-line bg-panel p-4 shadow-[var(--shadow-soft)]', className)}>
            <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                    <span className="text-[17px] font-extrabold text-navy">{order.code}</span>
                    <TableChip number={order.table} />
                    {isAddition(order) && (
                        <Badge tone="gold" className="px-2 py-0.5 text-[11px]">
                            Tambahan
                        </Badge>
                    )}
                </div>
                <span className="inline-flex items-center gap-1 text-xs text-faint">
                    <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                    {order.minutesAgo ?? 0} mnt
                </span>
            </div>
            <p className="mt-1.5 text-sm font-bold text-ink">
                {order.customer} · {countItems(order.items)} item
                {order.source === 'kasir' && <span className="ml-1.5 text-xs font-semibold text-faint">(pesanan kasir)</span>}
            </p>
            <ul className="mt-1.5 space-y-0.5 text-[13px] text-soft">
                {order.items.map((item) => (
                    <li key={item.menuId}>
                        {item.qty}× {item.name}
                        {item.note && <span className="block text-xs text-danger">Catatan: {item.note}</span>}
                    </li>
                ))}
            </ul>
            <div className="mt-3 flex items-center justify-between border-t border-line pt-3">
                <span className="text-lg font-extrabold text-ink">{formatCurrency(total)}</span>
                <span className="inline-flex items-center gap-1 rounded-full border border-line px-2.5 py-0.5 text-xs font-semibold text-soft">
                    {order.method === 'qris' && <QrCode className="h-3.5 w-3.5" aria-hidden="true" />}
                    {PAYMENT_METHOD_LABEL[order.method]}
                </span>
            </div>
            {action && <div className="mt-3">{action}</div>}
        </article>
    );
}
