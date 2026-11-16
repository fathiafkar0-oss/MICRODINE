import { Printer, QrCode } from 'lucide-react';
import toast from 'react-hot-toast';

import { OrderStatusBadge, TableChip } from '@/Components/UI/Badge';
import Button from '@/Components/UI/Button';
import Card from '@/Components/UI/Card';
import { calculateBill, formatCurrency } from '@/Utils/formatCurrency';
import { isPaid } from '@/Utils/status';

/** Panel kanan di halaman histori: detail pesanan, pembayaran, dan aksi. */
export default function OrderDetailPanel({ order, taxRate, taxLabel }) {
    const totals = calculateBill(order.items, taxRate);
    const paid = isPaid(order);

    return (
        <Card as="aside" className="h-fit">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-faint">Detail pesanan</p>
                    <p className="text-xl font-extrabold text-navy">{order.code}</p>
                </div>
                <OrderStatusBadge status={order.status} />
            </div>

            <dl className="mt-4 grid grid-cols-2 gap-3 rounded-2xl bg-raised p-3.5 text-sm">
                <div>
                    <dt className="text-xs text-faint">Meja</dt>
                    <dd className="mt-0.5">
                        <TableChip number={order.table} />
                    </dd>
                </div>
                <div>
                    <dt className="text-xs text-faint">Pemesan</dt>
                    <dd className="font-semibold">{order.customer}</dd>
                </div>
                <div>
                    <dt className="text-xs text-faint">Sumber</dt>
                    <dd className="font-semibold">{order.source === 'qr' ? 'QR Pelanggan' : 'Kasir (manual)'}</dd>
                </div>
                <div>
                    <dt className="text-xs text-faint">Dibuat</dt>
                    <dd className="font-semibold">{order.time} WIB</dd>
                </div>
            </dl>

            <h3 className="mt-4 text-sm font-bold text-navy">Item pesanan</h3>
            <ul className="mt-2 space-y-2 text-sm">
                {order.items.map((item) => (
                    <li key={item.menuId} className="flex justify-between gap-3">
                        <span>
                            {item.qty}× {item.name}
                            {item.note && <span className="block text-xs italic text-danger">Catatan: {item.note}</span>}
                        </span>
                        <span className="font-semibold">{formatCurrency(item.price * item.qty)}</span>
                    </li>
                ))}
            </ul>
            <dl className="mt-3 space-y-1 border-t border-dashed border-line-strong pt-3 text-sm">
                <div className="flex justify-between text-soft">
                    <dt>Subtotal</dt>
                    <dd>{formatCurrency(totals.subtotal)}</dd>
                </div>
                {taxRate > 0 && (
                    <div className="flex justify-between text-soft">
                        <dt>{taxLabel}</dt>
                        <dd>{formatCurrency(totals.tax)}</dd>
                    </div>
                )}
                <div className="flex justify-between text-base font-extrabold text-navy">
                    <dt>Total</dt>
                    <dd>{formatCurrency(totals.total)}</dd>
                </div>
            </dl>

            <p className="mt-3 flex items-center gap-2 rounded-xl bg-raised px-3 py-2 text-xs text-soft">
                {order.method === 'qris' && <QrCode className="h-4 w-4" aria-hidden="true" />}
                {order.method === 'qris' ? 'QRIS · diverifikasi lewat webhook payment gateway' : 'Tunai · dikonfirmasi kasir'}
                {order.paidAt && ` · lunas ${order.paidAt}`}
            </p>

            {paid && (
                <Button block className="mt-4" onClick={() => toast.success(`Struk ${order.code} dikirim ke printer`)}>
                    <Printer className="h-4 w-4" aria-hidden="true" />
                    Cetak Ulang Struk
                </Button>
            )}
            {order.status === 'menunggu_bayar' && (
                <Button href="/kasir" variant="navy" block className="mt-4">
                    Proses di Antrean
                </Button>
            )}
        </Card>
    );
}
