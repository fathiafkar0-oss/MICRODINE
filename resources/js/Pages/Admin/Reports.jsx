import { CalendarDays, Download, Eye, Printer, QrCode, Wallet } from 'lucide-react';
import { useMemo, useState } from 'react';

import PageHeader from '@/Components/Shared/PageHeader';
import Pagination from '@/Components/Shared/Pagination';
import SearchBar from '@/Components/Shared/SearchBar';
import { OrderStatusBadge } from '@/Components/UI/Badge';
import Button from '@/Components/UI/Button';
import { Select } from '@/Components/UI/Input';
import Table, { TableCell, TableRow } from '@/Components/UI/Table';
import { orders as mockOrders, pastOrders as mockPastOrders } from '@/Data/mock/orders';
import { restaurant as mockRestaurant } from '@/Data/mock/restaurant';
import AdminLayout from '@/Layouts/AdminLayout';
import TransactionDetailModal from '@/Pages/Admin/Partials/TransactionDetailModal';
import { cx } from '@/Utils/classNames';
import { calculateBill, calculateCost, formatCurrency } from '@/Utils/formatCurrency';
import { isPaid, PAYMENT_METHOD_LABEL } from '@/Utils/status';

const PER_PAGE = 8;

/** Angka laporan per transaksi dari snapshot item (bukan dari harga menu saat ini). */
function toRow(order, taxRate) {
    const bill = calculateBill(order.items, taxRate);
    const hpp = calculateCost(order.items);
    return { ...order, paid: isPaid(order), total: bill.total, omzet: bill.subtotal, hpp, profit: bill.subtotal - hpp };
}

function downloadCsv(rows) {
    const head = ['ID Pesanan', 'Waktu', 'Meja', 'Metode', 'Status', 'Omzet (sebelum pajak)', 'Pajak', 'Total', 'HPP', 'Laba Kotor'];
    const lines = rows.map((row) => [row.code, row.time, row.table, row.method, row.status, row.omzet, row.total - row.omzet, row.total, row.paid ? row.hpp : '', row.paid ? row.profit : ''].join(','));
    const blob = new Blob([[head.join(','), ...lines].join('\n')], { type: 'text/csv;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'laporan-transaksi-microdine.csv';
    link.click();
    URL.revokeObjectURL(link.href);
}

/**
 * Audit transaksi: HPP & laba disimpan per transaksi (data snapshot).
 * Route: GET /admin/laporan?dari=&sampai=&metode=&status=
 * Omzet & laba hanya dihitung dari transaksi lunas, sebelum pajak.
 */
export default function AdminReports({ orders = [...mockOrders, ...mockPastOrders], restaurant = mockRestaurant }) {
    const taxRate = restaurant.taxEnabled ? restaurant.taxRate : 0;
    const rows = useMemo(() => orders.map((order) => toRow(order, taxRate)), [orders, taxRate]);
    const [query, setQuery] = useState('');
    const [method, setMethod] = useState('semua');
    const [status, setStatus] = useState('semua');
    const [page, setPage] = useState(1);
    const [detail, setDetail] = useState(null);

    const keyword = query.trim().toLowerCase();
    const filtered = rows.filter(
        (row) => (method === 'semua' || row.method === method) && (status === 'semua' || (status === 'lunas' ? row.paid : row.status === status)) && (!keyword || row.code.toLowerCase().includes(keyword)),
    );
    const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
    const current = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
    const paid = filtered.filter((row) => row.paid);
    const totals = paid.reduce((acc, row) => ({ omzet: acc.omzet + row.omzet, hpp: acc.hpp + row.hpp, profit: acc.profit + row.profit }), { omzet: 0, hpp: 0, profit: 0 });
    const resetPage = (setter) => (value) => {
        setter(value);
        setPage(1);
    };

    return (
        <AdminLayout title="Transaksi & Laporan">
            <PageHeader
                title="Transaksi & Laporan"
                subtitle="Audit penjualan · HPP & laba disimpan per transaksi (data historis)"
                actions={
                    <>
                        <Button variant="outline" onClick={() => downloadCsv(filtered)}>
                            <Download className="h-4 w-4" aria-hidden="true" />
                            Unduh CSV
                        </Button>
                        <Button variant="outline" onClick={() => window.print()}>
                            <Printer className="h-4 w-4" aria-hidden="true" />
                            Cetak Laporan
                        </Button>
                    </>
                }
            />

            <div className="flex flex-wrap items-center gap-2">
                <SearchBar value={query} onChange={resetPage(setQuery)} placeholder="Cari ID pesanan, mis. A-024" label="Cari ID pesanan" className="w-64 border-line-strong" />
                <span className="inline-flex h-10 items-center gap-2 rounded-xl border border-line-strong bg-panel px-3 text-sm font-semibold text-navy">
                    <CalendarDays className="h-4 w-4" aria-hidden="true" />
                    Hari ini
                </span>
                <Select size="sm" aria-label="Metode" value={method} onChange={(event) => resetPage(setMethod)(event.target.value)}>
                    <option value="semua">Semua metode</option>
                    <option value="qris">QRIS</option>
                    <option value="tunai">Tunai</option>
                </Select>
                <Select size="sm" aria-label="Status" value={status} onChange={(event) => resetPage(setStatus)(event.target.value)}>
                    <option value="semua">Semua status</option>
                    <option value="lunas">Lunas</option>
                    <option value="menunggu_bayar">Menunggu Bayar</option>
                    <option value="dibatalkan">Dibatalkan</option>
                    <option value="gagal">Gagal</option>
                </Select>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 xl:grid-cols-4">
                <Summary label="Omzet periode" value={formatCurrency(totals.omzet)} />
                <Summary label="Total HPP" value={formatCurrency(totals.hpp)} />
                <Summary label="Laba kotor" value={formatCurrency(totals.profit)} tone="text-success" />
                <Summary label="Transaksi lunas" value={`${paid.length} pesanan`} />
            </div>

            <Table columns={['ID Pesanan', 'Waktu', 'Meja', 'Metode', 'Status', 'Total', 'HPP', 'Laba', 'Aksi']} minWidth="min-w-[920px]" isEmpty={current.length === 0} empty="Tidak ada transaksi yang cocok." className="mt-4">
                {current.map((row) => (
                    <TableRow key={row.code}>
                        <TableCell className="font-bold text-navy">{row.code}</TableCell>
                        <TableCell className="text-soft">Hari ini · {row.time}</TableCell>
                        <TableCell>{row.table}</TableCell>
                        <TableCell>
                            <span className="inline-flex items-center gap-1.5">
                                {row.method === 'qris' ? <QrCode className="h-4 w-4 text-soft" aria-hidden="true" /> : <Wallet className="h-4 w-4 text-soft" aria-hidden="true" />}
                                {PAYMENT_METHOD_LABEL[row.method]}
                            </span>
                        </TableCell>
                        <TableCell>
                            <OrderStatusBadge status={row.status} />
                        </TableCell>
                        <TableCell className="font-semibold">{formatCurrency(row.total)}</TableCell>
                        <TableCell className="text-soft">{row.paid ? formatCurrency(row.hpp) : '—'}</TableCell>
                        <TableCell className="font-semibold text-success">{row.paid ? formatCurrency(row.profit) : <span className="font-normal text-faint">—</span>}</TableCell>
                        <TableCell>
                            <button type="button" onClick={() => setDetail(row)} className="inline-flex items-center gap-1.5 rounded-full bg-raised px-3 py-1.5 text-xs font-bold text-navy hover:bg-line">
                                <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                                Rincian
                            </button>
                        </TableCell>
                    </TableRow>
                ))}
            </Table>

            <div className="mt-3">
                <Pagination
                    page={page}
                    totalPages={totalPages}
                    onChange={setPage}
                    summary={`Menampilkan ${current.length} dari ${filtered.length} transaksi · HPP & laba hanya dihitung untuk transaksi lunas (sebelum pajak)`}
                />
            </div>

            <TransactionDetailModal row={detail} onClose={() => setDetail(null)} />
        </AdminLayout>
    );
}

function Summary({ label, value, tone = 'text-navy' }) {
    return (
        <div className="rounded-[18px] border border-navy/50 bg-panel px-4 py-3">
            <p className="text-xs text-faint">{label}</p>
            <p className={cx('mt-0.5 text-xl font-extrabold', tone)}>{value}</p>
        </div>
    );
}
