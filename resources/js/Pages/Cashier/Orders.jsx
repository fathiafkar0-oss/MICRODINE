import { router } from '@inertiajs/react';
import { ScanBarcode, Trash2, User } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';

import FilterChips, { SegmentedControl } from '@/Components/Shared/FilterChips';
import PageHeader from '@/Components/Shared/PageHeader';
import SearchBar from '@/Components/Shared/SearchBar';
import Button from '@/Components/UI/Button';
import Card from '@/Components/UI/Card';
import Input from '@/Components/UI/Input';
import MenuThumb from '@/Components/UI/MenuThumb';
import QuantityStepper from '@/Components/UI/QuantityStepper';
import { categories as mockCategories, menus as mockMenus } from '@/Data/mock/menus';
import { restaurant as mockRestaurant } from '@/Data/mock/restaurant';
import { tables as mockTables } from '@/Data/mock/tables';
import useCart from '@/Hooks/useCart';
import useCurrency from '@/Hooks/useCurrency';
import CashierLayout from '@/Layouts/CashierLayout';
import { cx } from '@/Utils/classNames';
import { countItems } from '@/Utils/formatCurrency';

/** Barcode meja berformat MJ-07; kasir juga boleh mengetik "07" atau "7". */
function parseTableCode(raw, tables) {
    const number = raw.trim().toUpperCase().replace(/^MJ-?/, '').replace(/\D/g, '').padStart(2, '0');
    return tables.some((table) => table.number === number) ? number : null;
}

/**
 * Pesanan manual oleh kasir (pelanggan tanpa smartphone).
 * Route: GET /kasir/pesanan
 * Barcode scanner USB bekerja seperti keyboard: ia "mengetik" kode lalu menekan Enter.
 * Backend: POST /kasir/pesanan dengan { table, customer, method, items }.
 */
export default function CashierOrders({ menus = mockMenus, categories = mockCategories, tables = mockTables, restaurant = mockRestaurant }) {
    const cart = useCart('kasir');
    const { format, bill, taxRate, taxLabel } = useCurrency(restaurant);
    const [scan, setScan] = useState('');
    const [table, setTable] = useState(null);
    const [customer, setCustomer] = useState('');
    const [method, setMethod] = useState('tunai');
    const [category, setCategory] = useState('Semua');
    const [query, setQuery] = useState('');
    const scanInput = useRef(null);
    const totals = bill(cart.items);

    const visible = useMemo(() => {
        const keyword = query.trim().toLowerCase();
        return menus.filter((menu) => (category === 'Semua' || menu.category === category) && (!keyword || menu.name.toLowerCase().includes(keyword)));
    }, [menus, category, query]);

    const submitScan = (event) => {
        event.preventDefault();
        const number = parseTableCode(scan, tables);
        if (!number) {
            toast.error(`Kode meja "${scan}" tidak dikenali`);
            return;
        }
        setTable(number);
        setScan('');
        toast.success(`Meja ${number} terpilih`);
    };

    const submitOrder = () => {
        if (!table) {
            toast.error('Scan barcode meja dulu');
            scanInput.current?.focus();
            return;
        }
        if (cart.items.length === 0) {
            toast.error('Pilih minimal satu menu');
            return;
        }
        toast.success(`Pesanan Meja ${table} dibuat · ${method === 'tunai' ? 'menunggu pembayaran tunai' : 'QRIS ditampilkan'}`);
        cart.clear();
        router.visit('/kasir');
    };

    return (
        <CashierLayout title="Pesanan Manual">
            <PageHeader title="Pesanan Manual" subtitle="Untuk pelanggan yang memesan langsung di kasir. Scan barcode meja, pilih menu, lalu buat pesanan." />

            <div className="grid gap-5 xl:grid-cols-[1fr_380px]">
                <div className="min-w-0 space-y-4">
                    <Card as="form" padding="md" onSubmit={submitScan} className="flex flex-wrap items-end gap-3">
                        <span className="grid h-11 w-11 place-items-center rounded-[13px] bg-gold text-obsidian shadow-[0_8px_18px_-10px_rgba(204,158,74,0.9)]">
                            <ScanBarcode className="h-5 w-5" aria-hidden="true" />
                        </span>
                        <Input
                            ref={scanInput}
                            label="Scan barcode meja"
                            size="sm"
                            autoFocus
                            value={scan}
                            onValueChange={setScan}
                            placeholder="Arahkan scanner ke barcode, atau ketik MJ-07"
                            className="min-w-48 flex-1"
                        />
                        <Button type="submit" variant="navy">
                            Pilih Meja
                        </Button>
                    </Card>

                    <div className="flex flex-wrap items-center gap-2">
                        <FilterChips options={['Semua', ...categories]} value={category} onChange={setCategory} label="Kategori menu" />
                        <SearchBar value={query} onChange={setQuery} placeholder="Cari menu..." label="Cari menu" className="ml-auto w-56" />
                    </div>

                    <div className="stagger grid grid-cols-1 gap-3 sm:grid-cols-2 2xl:grid-cols-3">
                        {visible.map((menu) => {
                            const qty = cart.qtyOf(menu.id);
                            return (
                                <div key={menu.id} className={cx('lift flex items-center gap-3 rounded-[18px] border bg-panel p-3 shadow-[var(--shadow-soft)]', qty ? 'border-gold ring-1 ring-gold/25' : 'border-line', !menu.available && 'opacity-60')}>
                                    <MenuThumb menu={menu} className="h-14 w-14 rounded-xl" />
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate font-bold text-navy">{menu.name}</p>
                                        <p className="text-sm font-semibold">{format(menu.price)}</p>
                                    </div>
                                    {!menu.available ? (
                                        <span className="text-xs font-semibold text-faint">Habis</span>
                                    ) : qty ? (
                                        <QuantityStepper name={menu.name} quantity={qty} onDecrease={() => cart.decrease(menu.id)} onIncrease={() => cart.add(menu)} />
                                    ) : (
                                        <Button size="sm" onClick={() => cart.add(menu)} aria-label={`Tambah ${menu.name}`}>
                                            Tambah
                                        </Button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                <Card as="aside" className="h-fit xl:sticky xl:top-6">
                    <div className="flex items-center justify-between">
                        <h2 className="font-display text-2xl font-semibold text-navy">Ringkasan</h2>
                        <span className={cx('rounded-full px-3 py-1 text-sm font-bold', table ? 'bg-gold-soft text-obsidian' : 'bg-raised text-faint')}>{table ? `Meja ${table}` : 'Meja belum dipilih'}</span>
                    </div>

                    <Input label="Nama pemesan" icon={User} value={customer} onValueChange={setCustomer} placeholder="Opsional" className="mt-4" />

                    <ul className="mt-4 space-y-2">
                        {cart.items.length === 0 && <li className="rounded-xl border border-dashed border-line-strong px-3 py-6 text-center text-sm text-faint">Belum ada menu dipilih</li>}
                        {cart.items.map((item) => (
                            <li key={item.menuId} className="flex items-center justify-between gap-2 text-sm">
                                <span className="min-w-0 truncate">
                                    {item.qty}× {item.name}
                                </span>
                                <span className="flex items-center gap-2">
                                    <span className="font-semibold">{format(item.price * item.qty)}</span>
                                    <button type="button" onClick={() => cart.remove(item.menuId)} aria-label={`Hapus ${item.name}`} className="grid h-7 w-7 place-items-center rounded-lg text-faint hover:bg-danger-tint hover:text-danger">
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                </span>
                            </li>
                        ))}
                    </ul>

                    <dl className="mt-4 space-y-1.5 border-t border-line pt-3 text-sm">
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
                        <div className="flex items-baseline justify-between pt-1">
                            <dt className="font-bold">Total</dt>
                            <dd className="text-2xl font-extrabold text-navy">{format(totals.total)}</dd>
                        </div>
                    </dl>

                    <p className="mt-4 text-sm font-bold">Metode pembayaran</p>
                    <SegmentedControl
                        label="Metode pembayaran"
                        options={[
                            { value: 'tunai', label: 'Tunai' },
                            { value: 'qris', label: 'QRIS' },
                        ]}
                        value={method}
                        onChange={setMethod}
                        className="mt-2"
                    />

                    <Button variant="navy" size="lg" block className="mt-5" onClick={submitOrder}>
                        Buat Pesanan
                    </Button>
                </Card>
            </div>
        </CashierLayout>
    );
}
