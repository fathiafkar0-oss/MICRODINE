import { Head, Link } from '@inertiajs/react';
import { Info, ListOrdered, Plus, ShoppingBag } from 'lucide-react';
import { useMemo, useState } from 'react';

import FilterChips from '@/Components/Shared/FilterChips';
import SearchBar from '@/Components/Shared/SearchBar';
import MenuThumb from '@/Components/UI/MenuThumb';
import QuantityStepper from '@/Components/UI/QuantityStepper';
import { categories as mockCategories, menus as mockMenus } from '@/Data/mock/menus';
import { restaurant as mockRestaurant } from '@/Data/mock/restaurant';
import useCart from '@/Hooks/useCart';
import { cx } from '@/Utils/classNames';
import { countItems, formatCurrency } from '@/Utils/formatCurrency';

/**
 * Halaman utama pelanggan setelah scan QR meja.
 * Route: GET /meja/{table}
 * Props backend: table, session { joined }, restaurant, categories, menus
 */
export default function MenuIndex({ table = '07', session = { joined: false }, restaurant = mockRestaurant, categories = mockCategories, menus = mockMenus }) {
    const cart = useCart(table);
    const [category, setCategory] = useState('Semua');
    const [query, setQuery] = useState('');

    const visible = useMemo(() => {
        const keyword = query.trim().toLowerCase();
        return menus.filter((menu) => (category === 'Semua' || menu.category === category) && (!keyword || `${menu.name} ${menu.description}`.toLowerCase().includes(keyword)));
    }, [menus, category, query]);

    const totalItems = countItems(cart.items);
    const subtotal = cart.items.reduce((sum, item) => sum + item.price * item.qty, 0);

    return (
        <div className="min-h-dvh bg-canvas">
            <Head title={`Menu · Meja ${table}`} />
            <div className="mx-auto w-full max-w-[480px] pb-32">
                <header className="rounded-b-[24px] bg-navy px-5 pb-5 pt-6 text-white">
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <p className="text-xs font-bold tracking-[0.18em] text-gold-soft">MICRODINE</p>
                            <p className="mt-0.5 text-xl font-extrabold">{restaurant.name}</p>
                        </div>
                        <Link href="/pesanan/A-024" className="inline-flex h-9 items-center gap-1.5 rounded-full border border-white/30 px-3 text-[13px] font-semibold transition hover:bg-white/10">
                            <ListOrdered className="h-4 w-4" aria-hidden="true" />
                            Pesanan saya
                        </Link>
                    </div>

                    <div className="mt-4 flex items-center gap-3 rounded-2xl bg-white/10 p-3">
                        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gold text-obsidian">
                            <span className="text-[10px] font-bold leading-none">MEJA</span>
                            <span className="text-xl font-extrabold leading-none">{table}</span>
                        </div>
                        <div className="min-w-0">
                            <p className="font-bold">Kamu duduk di Meja {table}</p>
                            <p className="text-xs text-white/75">{session.joined ? 'Kamu bergabung ke sesi meja yang sedang aktif.' : 'Sesi aktif · pesanan teman semeja masuk ke sesi yang sama'}</p>
                        </div>
                    </div>
                </header>

                <div className="space-y-4 px-5 pt-4">
                    <p className="flex items-start gap-2.5 rounded-2xl bg-warn-tint px-3.5 py-3 text-xs leading-relaxed text-warn">
                        <Info className="mt-px h-4 w-4 shrink-0" aria-hidden="true" />
                        Pesanan diproses dapur setelah pembayaran lunas (QRIS atau tunai di kasir).
                    </p>

                    <SearchBar size="lg" value={query} onChange={setQuery} placeholder="Cari menu" label="Cari menu" />
                    <FilterChips options={['Semua', ...categories]} value={category} onChange={setCategory} label="Kategori menu" scrollable className="-mx-5 px-5" />

                    <div className="flex items-baseline justify-between">
                        <h2 className="text-lg font-extrabold text-navy">{category === 'Semua' ? 'Semua menu' : category}</h2>
                        <span className="text-xs text-faint">{visible.length} menu</span>
                    </div>

                    {visible.length === 0 ? (
                        <p className="rounded-2xl bg-panel px-4 py-10 text-center text-sm text-soft">Menu tidak ditemukan. Coba kata lain atau pilih kategori Semua.</p>
                    ) : (
                        <ul className="space-y-2.5">
                            {visible.map((menu) => (
                                <MenuItem key={menu.id} menu={menu} qty={cart.qtyOf(menu.id)} onAdd={() => cart.add(menu)} onDecrease={() => cart.decrease(menu.id)} />
                            ))}
                        </ul>
                    )}
                </div>
            </div>

            {totalItems > 0 && (
                <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-canvas/95 backdrop-blur">
                    <div className="mx-auto flex w-full max-w-[480px] animate-slide-up px-4 pb-5 pt-3">
                        <div className="flex flex-1 items-center justify-between gap-3 rounded-2xl bg-navy py-2 pl-4 pr-2 text-white">
                            <div className="flex items-center gap-3">
                                <ShoppingBag className="h-5 w-5 text-white/75" aria-hidden="true" />
                                <div>
                                    <p className="text-xs text-white/75">
                                        {totalItems} item · Meja {table}
                                    </p>
                                    <p className="text-lg font-extrabold text-gold-soft">{formatCurrency(subtotal)}</p>
                                </div>
                            </div>
                            <Link href={`/meja/${table}/keranjang`} className="inline-flex h-11 items-center rounded-xl bg-gold px-4 text-sm font-bold text-obsidian transition hover:bg-gold-hover">
                                Lihat Keranjang
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function MenuItem({ menu, qty, onAdd, onDecrease }) {
    return (
        <li className={cx('flex gap-3 rounded-[18px] border bg-panel p-3', qty ? 'border-gold' : 'border-line')}>
            <MenuThumb menu={menu} className="h-[84px] w-[84px] rounded-xl" iconClass="h-7 w-7" />
            <div className="flex min-w-0 flex-1 flex-col">
                <p className="font-bold text-navy">{menu.name}</p>
                <p className="mt-0.5 line-clamp-2 text-xs leading-4 text-faint">{menu.description}</p>
                <div className="mt-auto flex items-center justify-between gap-2 pt-2">
                    <span className="font-bold">{formatCurrency(menu.price)}</span>
                    {!menu.available ? (
                        <span className="rounded-full bg-raised px-3 py-1.5 text-xs font-semibold text-faint">Habis</span>
                    ) : qty ? (
                        <QuantityStepper name={menu.name} quantity={qty} onDecrease={onDecrease} onIncrease={onAdd} />
                    ) : (
                        <button
                            type="button"
                            onClick={onAdd}
                            aria-label={`Tambah ${menu.name}`}
                            className="inline-flex h-9 items-center gap-1 rounded-full bg-gold px-4 text-[13px] font-bold text-obsidian transition hover:bg-gold-hover active:scale-95"
                        >
                            <Plus className="h-4 w-4" aria-hidden="true" />
                            Tambah
                        </button>
                    )}
                </div>
            </div>
        </li>
    );
}
