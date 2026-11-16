import { CalendarDays } from 'lucide-react';
import { useMemo, useState } from 'react';

import FilterChips, { SegmentedControl } from '@/Components/Shared/FilterChips';
import LiveBadge from '@/Components/Shared/LiveBadge';
import PageHeader from '@/Components/Shared/PageHeader';
import Pagination from '@/Components/Shared/Pagination';
import SearchBar from '@/Components/Shared/SearchBar';
import Badge, { OrderStatusBadge } from '@/Components/UI/Badge';
import Card from '@/Components/UI/Card';
import Table, { TableCell, TableRow } from '@/Components/UI/Table';
import { orders as mockOrders, pastOrders as mockPastOrders } from '@/Data/mock/orders';
import { restaurant as mockRestaurant } from '@/Data/mock/restaurant';
import useCurrency from '@/Hooks/useCurrency';
import CashierLayout from '@/Layouts/CashierLayout';
import OrderDetailPanel from '@/Pages/Cashier/Partials/OrderDetailPanel';
import { cx } from '@/Utils/classNames';
import { countItems } from '@/Utils/formatCurrency';
import { formatLongDate } from '@/Utils/formatDate';
import { isPaid, ORDER_STATUS, PAYMENT_METHOD_LABEL } from '@/Utils/status';

const PER_PAGE = 8;
const STATUS_FILTERS = [
    { value: 'semua', label: 'Semua' },
    { value: 'lunas', label: 'Lunas' },
    { value: 'menunggu_bayar', label: 'Menunggu Bayar' },
    { value: 'dibatalkan', label: 'Dibatalkan' },
    { value: 'gagal', label: 'Gagal' },
];
const matches = (order, filter) => filter === 'semua' || (filter === 'lunas' ? isPaid(order) : order.status === filter);

/**
 * Histori pesanan harian untuk kasir.
 * Route: GET /kasir/histori?tanggal=YYYY-MM-DD
 * Props backend: orders (semua pesanan pada tanggal tsb.), restaurant
 */
export default function CashierHistory({ orders = [...mockOrders, ...mockPastOrders], restaurant = mockRestaurant }) {
    const { format, bill, taxRate, taxLabel } = useCurrency(restaurant);
    const [filter, setFilter] = useState('semua');
    const [method, setMethod] = useState('semua');
    const [query, setQuery] = useState('');
    const [page, setPage] = useState(1);
    const [selected, setSelected] = useState(orders[0]?.code);

    const base = useMemo(() => {
        const keyword = query.trim().toLowerCase();
        return orders.filter((order) => (method === 'semua' || order.method === method) && (!keyword || `${order.code} meja ${order.table}`.toLowerCase().includes(keyword)));
    }, [orders, method, query]);
    const rows = base.filter((order) => matches(order, filter));
    const totalPages = Math.max(1, Math.ceil(rows.length / PER_PAGE));
    const current = rows.slice((page - 1) * PER_PAGE, page * PER_PAGE);
    const detail = orders.find((order) => order.code === selected) ?? rows[0];

    const paid = orders.filter(isPaid);
    const sum = (list) => list.reduce((total, order) => total + bill(order.items).total, 0);
    const resetPage = (setter) => (value) => {
        setter(value);
        setPage(1);
    };

    return (
        <CashierLayout title="Histori Pesanan">
            <PageHeader title="Histori Pesanan" subtitle={`${formatLongDate()} · semua pesanan dari kasir dan QR meja`} actions={<LiveBadge />} />

            <div className="stagger grid grid-cols-2 gap-3 xl:grid-cols-4">
                <SummaryTile label="Total pesanan" value={orders.length} hint={`${orders.filter((order) => order.source === 'qr').length} dari QR · ${orders.filter((order) => order.source === 'kasir').length} oleh kasir`} />
                <SummaryTile label="Pembayaran lunas" value={format(sum(paid))} hint={`Tunai ${format(sum(paid.filter((order) => order.method === 'tunai')))}`} dark />
                <SummaryTile label="Menunggu pembayaran" value={orders.filter((order) => order.status === 'menunggu_bayar').length} hint={`Batal otomatis ${restaurant.paymentDeadlineMinutes} menit`} tone="text-warn" />
                <SummaryTile label="Dibatalkan / gagal" value={orders.filter((order) => ['dibatalkan', 'gagal'].includes(order.status)).length} hint="Tidak dihitung dalam omzet" tone="text-danger" />
            </div>

            <Card padding="md" className="mt-4">
                <div className="flex flex-wrap items-center gap-3">
                    <SearchBar value={query} onChange={resetPage(setQuery)} placeholder="Cari no. pesanan atau nomor meja" label="Cari pesanan" className="min-w-56 flex-1" />
                    <span className="inline-flex h-10 items-center gap-2 rounded-xl border border-line-strong bg-panel px-3.5 text-sm font-semibold text-navy">
                        <CalendarDays className="h-4 w-4" aria-hidden="true" />
                        Hari ini
                    </span>
                    <SegmentedControl
                        label="Metode pembayaran"
                        options={[
                            { value: 'semua', label: 'Semua' },
                            { value: 'tunai', label: 'Tunai' },
                            { value: 'qris', label: 'QRIS' },
                        ]}
                        value={method}
                        onChange={resetPage(setMethod)}
                    />
                </div>
                <FilterChips
                    label="Status pembayaran"
                    options={STATUS_FILTERS.map((option) => ({ ...option, count: base.filter((order) => matches(order, option.value)).length }))}
                    value={filter}
                    onChange={resetPage(setFilter)}
                    className="mt-3"
                />
            </Card>

            <div className="mt-4 grid gap-4 xl:grid-cols-[1fr_340px]">
                <div className="min-w-0 space-y-3">
                    <Table columns={['Pesanan', 'Meja · Sumber', 'Item', 'Total', 'Metode', 'Pembayaran', 'Dapur']} isEmpty={rows.length === 0} empty="Tidak ada pesanan yang cocok dengan filter.">
                        {current.map((order) => (
                            <TableRow key={order.code} active={detail?.code === order.code} onClick={() => setSelected(order.code)}>
                                <TableCell>
                                    <button type="button" onClick={() => setSelected(order.code)} className="font-bold text-navy">
                                        {order.code}
                                    </button>
                                    <p className="text-xs text-faint">{order.time}</p>
                                </TableCell>
                                <TableCell>
                                    <p className="font-semibold">Meja {order.table}</p>
                                    <p className="text-xs text-faint">{order.source === 'qr' ? 'QR Pelanggan' : 'Kasir (manual)'}</p>
                                </TableCell>
                                <TableCell>{countItems(order.items)}</TableCell>
                                <TableCell className="font-semibold">{format(bill(order.items).total)}</TableCell>
                                <TableCell>{PAYMENT_METHOD_LABEL[order.method]}</TableCell>
                                <TableCell>
                                    {isPaid(order) ? (
                                        <Badge tone="success" dot>
                                            Lunas
                                        </Badge>
                                    ) : (
                                        <OrderStatusBadge status={order.status} />
                                    )}
                                </TableCell>
                                <TableCell className="text-soft">{isPaid(order) ? ORDER_STATUS[order.status].label : '—'}</TableCell>
                            </TableRow>
                        ))}
                    </Table>
                    <Pagination page={page} totalPages={totalPages} onChange={setPage} summary={`Menampilkan ${current.length} dari ${rows.length} pesanan · klik baris untuk melihat detail`} />
                </div>

                {detail && <OrderDetailPanel order={detail} taxRate={taxRate} taxLabel={taxLabel} />}
            </div>
        </CashierLayout>
    );
}

function SummaryTile({ label, value, hint, dark = false, tone = 'text-navy' }) {
    return (
        <div className={cx('rounded-[18px] px-4 py-3.5 shadow-[var(--shadow-soft)]', dark ? 'bg-gradient-to-br from-navy to-navy-deep text-white' : 'border border-line bg-panel')}>
            <p className={cx('text-xs', dark ? 'text-white/70' : 'text-faint')}>{label}</p>
            <p className={cx('mt-1 text-xl font-extrabold', dark ? 'text-gold-soft' : tone)}>{value}</p>
            <p className={cx('mt-0.5 text-xs', dark ? 'text-white/70' : 'text-faint')}>{hint}</p>
        </div>
    );
}
