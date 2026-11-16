import { router } from '@inertiajs/react';
import { Banknote, CircleCheck, CirclePlus, QrCode, ShieldCheck, User } from 'lucide-react';
import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';

import Button from '@/Components/UI/Button';
import Card from '@/Components/UI/Card';
import Input from '@/Components/UI/Input';
import { restaurant as mockRestaurant } from '@/Data/mock/restaurant';
import useCart from '@/Hooks/useCart';
import useCurrency from '@/Hooks/useCurrency';
import CustomerLayout from '@/Layouts/CustomerLayout';
import { cx } from '@/Utils/classNames';
import { nextOrderCode, readTableSession, saveOrder, sessionOrders } from '@/Utils/orderStorage';
import { isPaid } from '@/Utils/status';

const METHODS = [
    { id: 'qris', label: 'QRIS', hint: 'Bayar instan pakai e-wallet atau m-banking.', icon: QrCode, tile: 'bg-gold text-obsidian' },
    { id: 'tunai', label: 'Tunai di kasir', hint: 'Tunjukkan nomor antrean ke kasir, lalu bayar.', icon: Banknote, tile: 'bg-danger-tint text-danger' },
];

/**
 * Checkout: isi nama pemesan + pilih metode pembayaran (alur pay-first).
 * Route: GET /meja/{table}/checkout
 * Backend: tombol konfirmasi menjadi POST /meja/{table}/pesanan lalu redirect ke /pesanan/{code}/bayar.
 * Pesanan tambahan: jika sesi meja sudah punya pesanan, pesanan ini menjadi pesanan ke-2 dst.
 * (tetap bayar di awal). Nama & metode bayar terakhir diisi otomatis.
 * Props backend opsional: sessionOrders (pesanan sebelumnya di sesi meja ini).
 */
export default function CheckoutIndex({ table = '07', restaurant = mockRestaurant, sessionOrders: sessionProp }) {
    const cart = useCart(table);
    const { format, bill, taxRate, taxLabel } = useCurrency(restaurant);
    const previous = useMemo(() => sessionProp ?? sessionOrders(table), [sessionProp, table]);
    const remembered = useMemo(() => readTableSession(table), [table]);
    const lastOrder = previous.at(-1);
    const sequence = previous.length + 1;
    const [name, setName] = useState(remembered.customer || lastOrder?.customer || '');
    const [method, setMethod] = useState(remembered.orders.length ? remembered.method : (lastOrder?.method ?? 'qris'));
    const [error, setError] = useState('');
    const totals = bill(cart.items);

    const submit = (event) => {
        event.preventDefault();
        if (!name.trim()) {
            setError('Isi nama pemesan dulu ya');
            return;
        }
        if (cart.items.length === 0) {
            toast.error('Keranjang masih kosong');
            return;
        }
        // Fase frontend: nomor antrean dibuat di browser. Backend yang membuat nomor sebenarnya.
        const order = { code: nextOrderCode(), table, customer: name.trim(), method, status: 'menunggu_bayar', sequence, source: 'qr', items: cart.items, createdAt: Date.now() };
        saveOrder(order);
        cart.clear();
        router.visit(`/pesanan/${order.code}/bayar`);
    };

    return (
        <form onSubmit={submit} noValidate>
            <CustomerLayout
                title="Pembayaran"
                table={table}
                backHref={`/meja/${table}/keranjang`}
                bottom={
                    <div className="space-y-2.5">
                        <p className="flex items-center gap-2 text-xs text-soft">
                            <ShieldCheck className="h-4 w-4 text-success" aria-hidden="true" />
                            Pesanan langsung masuk ke kasir &amp; dapur setelah lunas.
                        </p>
                        <Button type="submit" size="lg" block>
                            Konfirmasi Pesanan · {format(totals.total)}
                        </Button>
                    </div>
                }
            >
                <div className="stagger space-y-4 pb-4">
                    {previous.length > 0 && (
                        <div className="flex gap-3 rounded-[18px] border border-gold/40 bg-gold-tint/70 p-3.5">
                            <CirclePlus className="mt-0.5 h-5 w-5 shrink-0 text-warn" aria-hidden="true" />
                            <div className="text-sm leading-relaxed">
                                <p className="font-bold text-navy">Pesanan tambahan ke-{sequence - 1} untuk Meja {table}</p>
                                <p className="text-soft">
                                    Pesanan sebelumnya ({previous.map((order) => order.code).join(', ')}) tetap berjalan. Tambahan ini dibayar terpisah dan
                                    diantar ke meja yang sama.
                                </p>
                                {previous.some((order) => !isPaid(order) && order.status === 'menunggu_bayar') && (
                                    <p className="mt-1 text-xs font-semibold text-warn">Masih ada pesanan yang belum dibayar di meja ini.</p>
                                )}
                            </div>
                        </div>
                    )}
                    <Card variant="plain" padding="md">
                        <Input
                            label="Nama pemesan"
                            icon={User}
                            size="lg"
                            value={name}
                            onValueChange={(value) => {
                                setName(value);
                                setError('');
                            }}
                            maxLength={40}
                            autoComplete="given-name"
                            placeholder="Mis. Andi"
                            hint={previous.length ? 'Terisi dari pesanan sebelumnya. Boleh diganti.' : 'Dipakai kasir untuk memanggil pesanan Anda.'}
                            error={error}
                        />
                    </Card>

                    <fieldset>
                        <legend className="mb-2.5 text-[15px] font-bold">Metode pembayaran</legend>
                        <div className="space-y-2.5">
                            {METHODS.map(({ id, label, hint, icon: Icon, tile }) => (
                                <label key={id} className={cx('flex cursor-pointer items-center gap-3 rounded-[18px] border-2 bg-panel p-3.5 transition', method === id ? 'border-gold' : 'border-transparent')}>
                                    <input type="radio" name="method" value={id} checked={method === id} onChange={() => setMethod(id)} className="sr-only" />
                                    <span className={cx('grid h-11 w-11 shrink-0 place-items-center rounded-xl', tile)}>
                                        <Icon className="h-5 w-5" aria-hidden="true" />
                                    </span>
                                    <span className="min-w-0 flex-1">
                                        <span className="block font-bold">{label}</span>
                                        <span className="block text-xs leading-4 text-soft">{hint}</span>
                                    </span>
                                    <span aria-hidden="true" className={cx('grid h-5 w-5 shrink-0 place-items-center rounded-full border-2', method === id ? 'border-gold' : 'border-line-strong')}>
                                        {method === id && <span className="h-2.5 w-2.5 rounded-full bg-gold" />}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </fieldset>

                    <Card variant="plain" padding="md">
                        <h2 className="mb-3 text-sm font-bold">Ringkasan pesanan</h2>
                        <ul className="space-y-2 text-sm">
                            {cart.items.map((item) => (
                                <li key={item.menuId} className="flex justify-between gap-3">
                                    <span className="text-soft">
                                        {item.name} ×{item.qty}
                                    </span>
                                    <span className="font-semibold">{format(item.price * item.qty)}</span>
                                </li>
                            ))}
                            {taxRate > 0 && (
                                <li className="flex justify-between gap-3">
                                    <span className="text-soft">{taxLabel}</span>
                                    <span className="font-semibold">{format(totals.tax)}</span>
                                </li>
                            )}
                        </ul>
                        <div className="mt-3 flex items-baseline justify-between border-t border-line pt-3">
                            <span className="font-bold">Total</span>
                            <span className="text-xl font-extrabold">{format(totals.total)}</span>
                        </div>
                    </Card>

                    {method === 'qris' && (
                        <p className="flex items-start gap-2 px-1 text-xs leading-relaxed text-faint">
                            <CircleCheck className="mt-px h-4 w-4 shrink-0 text-success" aria-hidden="true" />
                            Setelah konfirmasi, kode QRIS muncul dan berlaku {restaurant.paymentDeadlineMinutes} menit.
                        </p>
                    )}
                </div>
            </CustomerLayout>
        </form>
    );
}
