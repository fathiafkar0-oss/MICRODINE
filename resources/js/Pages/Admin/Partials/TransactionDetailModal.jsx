import Badge, { OrderStatusBadge } from '@/Components/UI/Badge';
import Modal from '@/Components/UI/Modal';
import { cx } from '@/Utils/classNames';
import { formatCurrency } from '@/Utils/formatCurrency';
import { PAYMENT_METHOD_LABEL } from '@/Utils/status';

/** Rincian satu transaksi: harga & HPP per item sesuai snapshot saat pesanan dibuat. */
export default function TransactionDetailModal({ row, onClose }) {
    return (
        <Modal open={Boolean(row)} onClose={onClose} title={`Rincian ${row?.code ?? ''}`} subtitle="Harga & HPP sesuai saat transaksi dibuat (snapshot)">
            {row && (
                <>
                    <div className="overflow-hidden rounded-2xl border border-line">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-raised text-xs text-faint">
                                <tr>
                                    <th className="px-3 py-2 font-semibold">Item</th>
                                    <th className="px-3 py-2 font-semibold">Harga</th>
                                    <th className="px-3 py-2 font-semibold">HPP</th>
                                    <th className="px-3 py-2 text-right font-semibold">Laba</th>
                                </tr>
                            </thead>
                            <tbody>
                                {row.items.map((item) => (
                                    <tr key={item.menuId} className="border-t border-line">
                                        <td className="px-3 py-2">
                                            {item.qty}× {item.name}
                                        </td>
                                        <td className="px-3 py-2">{formatCurrency(item.price)}</td>
                                        <td className="px-3 py-2 text-soft">{formatCurrency(item.hpp)}</td>
                                        <td className="px-3 py-2 text-right font-semibold text-success">{formatCurrency((item.price - item.hpp) * item.qty)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <dl className="mt-4 space-y-1.5 text-sm">
                        <Line label="Omzet (sebelum pajak)" value={formatCurrency(row.omzet)} />
                        <Line label="Pajak (titipan pemda)" value={formatCurrency(row.total - row.omzet)} />
                        <Line label="Total dibayar" value={formatCurrency(row.total)} strong />
                        <Line label="Laba kotor" value={row.paid ? formatCurrency(row.profit) : 'Belum dihitung (belum lunas)'} tone="text-success" />
                    </dl>
                    <div className="mt-4">
                        {row.paid ? (
                            <Badge tone="success" dot>
                                Lunas · {PAYMENT_METHOD_LABEL[row.method]}
                            </Badge>
                        ) : (
                            <OrderStatusBadge status={row.status} />
                        )}
                    </div>
                </>
            )}
        </Modal>
    );
}

function Line({ label, value, strong = false, tone = '' }) {
    return (
        <div className={cx('flex justify-between', strong && 'text-base font-extrabold text-navy', tone)}>
            <dt className={strong ? '' : 'text-soft'}>{label}</dt>
            <dd className="font-semibold">{value}</dd>
        </div>
    );
}
