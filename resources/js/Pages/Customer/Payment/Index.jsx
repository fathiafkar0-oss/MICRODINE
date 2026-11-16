import { router } from '@inertiajs/react';
import { Download, Timer } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';

import { OrderStatusBadge } from '@/Components/UI/Badge';
import Button from '@/Components/UI/Button';
import Card from '@/Components/UI/Card';
import { restaurant as mockRestaurant } from '@/Data/mock/restaurant';
import useCountdown from '@/Hooks/useCountdown';
import useCurrency from '@/Hooks/useCurrency';
import CustomerLayout from '@/Layouts/CustomerLayout';
import { cx } from '@/Utils/classNames';
import { formatTime } from '@/Utils/formatDate';
import { resolveOrder, saveOrder } from '@/Utils/orderStorage';

/**
 * Menunggu pembayaran: QRIS (QR + hitung mundur) atau nomor antrean untuk bayar tunai di kasir.
 * Route: GET /pesanan/{code}/bayar
 * Backend: QR diisi string QRIS dari payment gateway (sandbox). Status lunas datang lewat
 * webhook, lalu dikirim ke browser pelanggan via WebSocket -> redirect ke /pesanan/{code}.
 */
export default function PaymentIndex({ code = 'A-029', order: orderProp, restaurant = mockRestaurant }) {
    const initial = useMemo(() => ({ ...resolveOrder(code, orderProp), status: 'menunggu_bayar' }), [code, orderProp]);
    const [order, setOrder] = useState(initial);
    const { format, bill } = useCurrency(restaurant);
    const { total } = bill(order.items);
    const countdown = useCountdown((order.createdAt ?? Date.now()) + restaurant.paymentDeadlineMinutes * 60 * 1000);
    const isQris = order.method === 'qris';

    const switchMethod = (method) => {
        const next = { ...order, method };
        setOrder(next);
        saveOrder(next);
    };

    // Mode demo: menggantikan notifikasi webhook dari payment gateway sandbox.
    const simulatePaid = () => {
        saveOrder({ ...order, status: 'diproses', paidAt: formatTime() });
        toast.success('Pembayaran diterima. Pesanan masuk ke dapur.');
        router.visit(`/pesanan/${order.code}`);
    };

    const downloadQr = () => {
        const svg = document.getElementById('qris-code');
        if (!svg) return;
        const blob = new Blob([new XMLSerializer().serializeToString(svg)], { type: 'image/svg+xml' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `QRIS-${order.code}.svg`;
        link.click();
        URL.revokeObjectURL(link.href);
    };

    return (
        <CustomerLayout
            title="Status Pesanan"
            table={order.table}
            bottom={
                isQris ? (
                    <div className="grid grid-cols-2 gap-3">
                        <Button variant="navy" size="lg" onClick={downloadQr} disabled={countdown.expired}>
                            <Download className="h-4 w-4" aria-hidden="true" />
                            Unduh QR
                        </Button>
                        <Button size="lg" onClick={() => switchMethod('tunai')}>
                            Bayar Tunai
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-3">
                        <Button href={`/meja/${order.table}`} variant="outline" size="lg">
                            Kembali ke Menu
                        </Button>
                        <Button size="lg" onClick={() => switchMethod('qris')}>
                            Bayar QRIS
                        </Button>
                    </div>
                )
            }
        >
            <div className="stagger space-y-4 pb-4">
                <Card variant="plain">
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <p className="text-xs text-faint">Nomor antrean</p>
                            <p className="text-4xl font-extrabold tracking-tight">{order.code}</p>
                        </div>
                        <OrderStatusBadge status={order.status} />
                    </div>
                    <ol className="mt-4 grid grid-cols-3 gap-2">
                        {['Menunggu Bayar', 'Diproses', 'Selesai'].map((label, index) => (
                            <li key={label}>
                                <span className={cx('block h-1.5 rounded-full', index === 0 ? 'bg-gold' : 'bg-raised')} />
                                <span className={cx('mt-1.5 block text-xs', index === 0 ? 'font-bold text-ink' : 'text-faint')}>{label}</span>
                            </li>
                        ))}
                    </ol>
                </Card>

                <Card variant="plain" className="flex flex-col items-center p-6 text-center">
                    <span className={cx('inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold', countdown.expired ? 'bg-danger-tint text-danger' : 'bg-warn-tint text-warn')}>
                        <Timer className="h-4 w-4" aria-hidden="true" />
                        {countdown.expired ? 'Waktu pembayaran habis' : `Bayar dalam ${countdown.label}`}
                    </span>

                    {isQris ? (
                        <>
                            <div className={cx('mt-5 rounded-2xl border-2 border-navy bg-white p-4', countdown.expired && 'opacity-30')}>
                                <QRCodeSVG id="qris-code" value={`MICRODINE-SANDBOX|${order.code}|${total}`} size={184} level="M" fgColor="#171721" />
                            </div>
                            <p className="mt-4 text-3xl font-extrabold">{format(total)}</p>
                            <p className="mt-2 text-sm leading-relaxed text-soft">Scan dengan aplikasi e-wallet atau m-banking. Status berubah otomatis setelah pembayaran berhasil.</p>
                        </>
                    ) : (
                        <>
                            <p className="mt-6 text-sm text-soft">Tunjukkan nomor antrean ini ke kasir</p>
                            <p className="mt-1 text-6xl font-extrabold tracking-tight text-navy">{order.code}</p>
                            <p className="mt-4 text-3xl font-extrabold">{format(total)}</p>
                            <p className="mt-2 text-sm leading-relaxed text-soft">Bayar tunai di kasir. Pesanan diproses dapur setelah kasir mengonfirmasi pembayaran.</p>
                        </>
                    )}

                    {countdown.expired && <p className="mt-3 text-sm font-semibold text-danger">Pesanan dibatalkan otomatis. Silakan pesan ulang dari menu.</p>}
                </Card>

                {!countdown.expired && (
                    <button type="button" onClick={simulatePaid} className="mx-auto block text-xs font-semibold text-faint underline underline-offset-2 hover:text-ink">
                        Mode demo: simulasikan pembayaran berhasil
                    </button>
                )}
            </div>
        </CustomerLayout>
    );
}
