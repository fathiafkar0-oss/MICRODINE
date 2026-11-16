import { Head, Link } from '@inertiajs/react';
import { Crown, Info, ListOrdered, Plus, ShoppingBag } from 'lucide-react';
import { useMemo, useState } from 'react';

import FilterChips from '@/Components/Shared/FilterChips';
import SearchBar from '@/Components/Shared/SearchBar';
import MenuThumb from '@/Components/UI/MenuThumb';
import QuantityStepper from '@/Components/UI/QuantityStepper';
import { menuAnalytics } from '@/Data/mock/menuAnalytics';
import { categories as mockCategories, menus as mockMenus } from '@/Data/mock/menus';
import { restaurant as mockRestaurant } from '@/Data/mock/restaurant';
import useCart from '@/Hooks/useCart';
import useSeenOnScreen from '@/Hooks/useSeenOnScreen';
import { cx } from '@/Utils/classNames';
import { countItems, formatCurrency } from '@/Utils/formatCurrency';
import { trackMenuInteraction } from '@/Utils/menuInteractions';

const SORTS = [
    { value: 'rekomendasi', label: 'Rekomendasi' },
    { value: 'terlaris', label: 'Terlaris' },
    { value: 'termurah', label: 'Termurah' },
];

/** Fase frontend: porsi terjual 7 hari terakhir dari data contoh Analisis Menu. Backend: props `popularity`. */
const mockPopularity = Object.fromEntries(menuAnalytics['7-hari'].map((row) => [row.menuId, row.sold]));

/**
 * Halaman utama pelanggan setelah scan QR meja.
 * Route: GET /meja/{table}
 * Props backend: table, session { joined }, restaurant, categories, menus,
 *                popularity { [menuId]: porsi terjual 7 hari } (untuk label "Terlaris" & urutan Terlaris)
 */
export default function MenuIndex({
    table = '07',
    session = { joined: false },
    restaurant = mockRestaurant,
    categories = mockCategories,
    menus = mockMenus,
    popularity = mockPopularity,
}) {
    const cart = useCart(table);
    const [category, setCategory] = useState('Semua');
    const [query, setQuery] = useState('');
    const [sort, setSort] = useState('rekomendasi');

    // 3 menu dengan porsi terjual terbanyak (yang masih tersedia) mendapat label "Terlaris"
    const bestSellers = useMemo(
        () =>
            menus
                .filter((menu) => menu.available && (popularity[menu.id] ?? 0) > 0)
                .sort((a, b) => (popularity[b.id] ?? 0) - (popularity[a.id] ?? 0))
                .slice(0, 3)
                .map((menu) => menu.id),
        [menus, popularity],
    );

    const visible = useMemo(() => {
        const keyword = query.trim().toLowerCase();
        const list = menus.filter((menu) => (category === 'Semua' || menu.category === category) && (!keyword || `${menu.name} ${menu.description}`.toLowerCase().includes(keyword)));
        const available = (menu) => (menu.available ? 0 : 1); // menu habis selalu di bawah
        if (sort === 'terlaris') return [...list].sort((a, b) => available(a) - available(b) || (popularity[b.id] ?? 0) - (popularity[a.id] ?? 0));
        if (sort === 'termurah') return [...list].sort((a, b) => available(a) - available(b) || a.price - b.price);
        // Rekomendasi: menu tersedia & berfoto lebih dulu (lebih menggugah), urutan asli dipertahankan
        return [...list].sort((a, b) => available(a) - available(b) || (a.image ? 0 : 1) - (b.image ? 0 : 1));
    }, [menus, category, query, sort, popularity]);

    const addToCart = (menu) => {
        cart.add(menu);
        trackMenuInteraction(table, menu.id, 'keranjang');
    };

    const totalItems = countItems(cart.items);
    const subtotal = cart.items.reduce((sum, item) => sum + item.price * item.qty, 0);

    return (
        <div className="min-h-dvh bg-canvas">
            <Head title={`Menu · Meja ${table}`} />
            <div className="mx-auto w-full max-w-[480px] animate-page-fade pb-32">
                <header className="rounded-b-[28px] border-b border-gold/25 bg-gradient-to-br from-navy to-navy-deep px-5 pb-5 pt-6 text-white shadow-[0_18px_40px_-24px_rgba(6,19,58,0.8)]">
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <p className="text-[11px] font-semibold tracking-[0.24em] text-gold-soft">MICRODINE</p>
                            <p className="mt-1 font-display text-[1.9rem] font-semibold leading-none">{restaurant.name}</p>
                        </div>
                        <Link href="/pesanan/A-024" className="inline-flex h-9 items-center gap-1.5 rounded-full border border-white/25 bg-white/5 px-3 text-[13px] font-semibold transition hover:bg-white/10 active:scale-95">
                            <ListOrdered className="h-4 w-4" aria-hidden="true" />
                            Pesanan saya
                        </Link>
                    </div>

                    <div className="mt-5 flex items-center gap-3 rounded-[18px] border border-white/10 bg-white/[0.07] p-3">
                        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-[13px] bg-gold text-obsidian shadow-[0_8px_18px_-10px_rgba(204,158,74,0.9)]">
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
                        <h2 className="font-display text-2xl font-semibold text-navy">{category === 'Semua' ? 'Semua menu' : category}</h2>
                        <span className="text-xs text-faint">{visible.length} menu</span>
                    </div>
                    <div className="-mt-1 flex items-center gap-1.5" role="radiogroup" aria-label="Urutkan menu">
                        <span className="mr-1 text-xs font-semibold text-faint">Urutkan</span>
                        {SORTS.map((option) => (
                            <button
                                key={option.value}
                                type="button"
                                role="radio"
                                aria-checked={sort === option.value}
                                onClick={() => setSort(option.value)}
                                className={cx(
                                    'rounded-full px-3 py-1 text-xs font-semibold transition active:scale-95',
                                    sort === option.value ? 'bg-navy text-white' : 'bg-panel text-soft ring-1 ring-line hover:text-navy',
                                )}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>

                    {visible.length === 0 ? (
                        <p className="rounded-2xl bg-panel px-4 py-10 text-center text-sm text-soft">Menu tidak ditemukan. Coba kata lain atau pilih kategori Semua.</p>
                    ) : (
                        <ul className="stagger space-y-2.5">
                            {visible.map((menu) => (
                                <MenuItem
                                    key={menu.id}
                                    menu={menu}
                                    bestSellerRank={bestSellers.indexOf(menu.id)}
                                    qty={cart.qtyOf(menu.id)}
                                    onAdd={() => addToCart(menu)}
                                    onDecrease={() => cart.decrease(menu.id)}
                                    onSeen={() => trackMenuInteraction(table, menu.id, 'lihat')}
                                />
                            ))}
                        </ul>
                    )}
                </div>
            </div>

            {totalItems > 0 && (
                <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line/70 bg-canvas/80 backdrop-blur-xl backdrop-saturate-150">
                    <div className="mx-auto flex w-full max-w-[480px] animate-slide-up px-4 pb-5 pt-3">
                        <div className="flex flex-1 items-center justify-between gap-3 rounded-[20px] bg-gradient-to-r from-navy to-navy-deep py-2 pl-4 pr-2 text-white shadow-[0_16px_32px_-16px_rgba(6,19,58,0.8)]">
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

function MenuItem({ menu, bestSellerRank, qty, onAdd, onDecrease, onSeen }) {
    const ref = useSeenOnScreen(onSeen);
    const isBestSeller = bestSellerRank >= 0;

    return (
        <li ref={ref} className={cx('flex gap-3 rounded-[18px] border bg-panel p-3 shadow-[var(--shadow-soft)] transition-colors', qty ? 'border-gold ring-1 ring-gold/25' : 'border-line')}>
            <div className="relative shrink-0">
                <MenuThumb menu={menu} className="h-[84px] w-[84px] rounded-[14px]" iconClass="h-7 w-7" />
                {isBestSeller && (
                    <span className="absolute -left-1.5 -top-1.5 grid h-6 w-6 place-items-center rounded-full bg-gold text-[11px] font-extrabold text-obsidian shadow-[0_4px_10px_-4px_rgba(204,158,74,0.9)] ring-2 ring-panel">
                        {bestSellerRank + 1}
                    </span>
                )}
            </div>
            <div className="flex min-w-0 flex-1 flex-col">
                {isBestSeller && (
                    <span className="mb-0.5 inline-flex w-fit items-center gap-1 rounded-full bg-gold-tint px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em] text-warn ring-1 ring-gold/30">
                        <Crown className="h-3 w-3" aria-hidden="true" />
                        Terlaris
                    </span>
                )}
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
