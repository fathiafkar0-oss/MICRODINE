import { Link } from '@inertiajs/react';
import { ArrowRight, FileText, ShoppingBag } from 'lucide-react';

import Button from '@/Components/UI/Button';
import Card from '@/Components/UI/Card';
import MenuThumb from '@/Components/UI/MenuThumb';
import QuantityStepper from '@/Components/UI/QuantityStepper';
import { menus as mockMenus } from '@/Data/mock/menus';
import { restaurant as mockRestaurant } from '@/Data/mock/restaurant';
import useCart from '@/Hooks/useCart';
import useCurrency from '@/Hooks/useCurrency';
import CustomerLayout from '@/Layouts/CustomerLayout';
import { cx } from '@/Utils/classNames';
import { countItems } from '@/Utils/formatCurrency';

/**
 * Keranjang pelanggan: ubah jumlah, tambah catatan, lihat subtotal + pajak.
 * Route: GET /meja/{table}/keranjang
 */
export default function CartIndex({ table = '07', restaurant = mockRestaurant, menus = mockMenus }) {
    const cart = useCart(table);
    const { format, bill, taxRate, taxLabel } = useCurrency(restaurant);
    const totals = bill(cart.items);
    const menuOf = (id) => menus.find((menu) => menu.id === id);

    if (cart.items.length === 0) {
        return (
            <CustomerLayout title="Keranjang" table={table} backHref={`/meja/${table}`}>
                <Card variant="plain" className="mt-6 flex flex-col items-center px-6 py-12 text-center">
                    <ShoppingBag className="h-10 w-10 text-gold" aria-hidden="true" />
                    <p className="mt-3 font-bold text-navy">Keranjang masih kosong</p>
                    <p className="mt-1 text-sm text-faint">Pilih menu dulu, lalu kembali ke sini untuk membayar.</p>
                    <Button href={`/meja/${table}`} className="mt-5">
                        Lihat Menu
                    </Button>
                </Card>
            </CustomerLayout>
        );
    }

    return (
        <CustomerLayout
            title="Keranjang"
            table={table}
            backHref={`/meja/${table}`}
            bottom={
                <Button href={`/meja/${table}/checkout`} size="lg" block>
                    Lanjut ke Pembayaran
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Button>
            }
        >
            <div className="space-y-3 pb-4">
                {cart.items.map((item) => (
                    <Card key={item.menuId} variant="plain" padding="md">
                        <div className="flex items-center gap-3">
                            <MenuThumb menu={menuOf(item.menuId)} className="h-14 w-14 rounded-xl" />
                            <div className="min-w-0 flex-1">
                                <p className="font-bold leading-snug text-ink">{item.name}</p>
                                <p className="text-sm font-semibold text-navy">{format(item.price)}</p>
                            </div>
                            <QuantityStepper name={item.name} quantity={item.qty} onDecrease={() => cart.decrease(item.menuId)} onIncrease={() => cart.add(menuOf(item.menuId))} />
                        </div>
                        <label className={cx('mt-3 flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm', item.note ? 'bg-danger-tint text-ink' : 'border border-dashed border-line-strong text-faint')}>
                            <FileText className="h-4 w-4 shrink-0" aria-hidden="true" />
                            <span className="sr-only">Catatan untuk {item.name}</span>
                            <input
                                type="text"
                                value={item.note}
                                maxLength={120}
                                onChange={(event) => cart.setNote(item.menuId, event.target.value)}
                                placeholder="Tambah catatan (mis. tanpa bawang)"
                                className="flex-1 bg-transparent outline-none placeholder:text-faint"
                            />
                        </label>
                    </Card>
                ))}

                <Card variant="plain" padding="md">
                    <dl className="space-y-2.5 text-sm">
                        <div className="flex justify-between">
                            <dt className="text-soft">Subtotal ({countItems(cart.items)} item)</dt>
                            <dd className="font-semibold">{format(totals.subtotal)}</dd>
                        </div>
                        {taxRate > 0 && (
                            <div className="flex justify-between">
                                <dt className="text-soft">{taxLabel}</dt>
                                <dd className="font-semibold">{format(totals.tax)}</dd>
                            </div>
                        )}
                        <div className="flex items-baseline justify-between border-t border-line pt-3">
                            <dt className="font-bold">Total tagihan</dt>
                            <dd className="text-xl font-extrabold">{format(totals.total)}</dd>
                        </div>
                    </dl>
                </Card>

                <p className="text-center text-xs text-faint">
                    Masih mau tambah?{' '}
                    <Link href={`/meja/${table}`} className="font-semibold text-navy underline underline-offset-2">
                        Kembali ke menu
                    </Link>
                </p>
            </div>
        </CustomerLayout>
    );
}
