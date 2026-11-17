import { router } from '@inertiajs/react';
import { Plus, Printer, RefreshCcw } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';

import FilterChips from '@/Components/Shared/FilterChips';
import PageHeader from '@/Components/Shared/PageHeader';
import TableQrCard from '@/Components/Shared/TableQrCard';
import Button from '@/Components/UI/Button';
import Modal from '@/Components/UI/Modal';
import { orders as mockOrders } from '@/Data/mock/orders';
import { restaurant as mockRestaurant } from '@/Data/mock/restaurant';
import { tableAreas, tables as mockTables } from '@/Data/mock/tables';
import AdminLayout from '@/Layouts/AdminLayout';
import AdminTableCard from '@/Pages/Admin/Partials/AdminTableCard';
import QrPrintSheet from '@/Pages/Admin/Partials/QrPrintSheet';
import TableFormModal from '@/Pages/Admin/Partials/TableFormModal';
import { listAreas, nextTableNumber, withSessions } from '@/Utils/tables';

const FILTERS = [
    { value: 'semua', label: 'Semua' },
    { value: 'aktif', label: 'Aktif' },
    { value: 'nonaktif', label: 'Nonaktif' },
];

/**
 * Kelola meja & QR (khusus admin): tambah, ubah, aktif/nonaktifkan, buat ulang QR, cetak semua QR.
 * Route: GET /admin/meja
 * Props backend: tables [{ id, number, seats, area, isActive, qrToken, status, session }], areas, restaurant, appUrl
 * Backend: POST /admin/meja · PUT /admin/meja/{id} · PATCH /admin/meja/{id}/status · POST /admin/meja/{id}/qr-ulang
 * Meja tidak pernah dihapus (dinonaktifkan) agar pesanan lama & laporan tetap utuh.
 */
export default function AdminTables({
    tables: tableProp,
    areas: areaProp = tableAreas,
    restaurant = mockRestaurant,
    appUrl = typeof window !== 'undefined' ? window.location.origin : '',
}) {
    const [tables, setTables] = useState(() => tableProp ?? withSessions(mockTables, mockOrders));
    const [filter, setFilter] = useState('semua');
    const [form, setForm] = useState(null);
    const [qrTable, setQrTable] = useState(null);
    const [toggling, setToggling] = useState(null);
    // Nomor meja yang kartu QR-nya mau dibuka begitu data terbaru tiba dari server.
    const [pendingQr, setPendingQr] = useState(null);

    // Setelah simpan/toggle/buat-ulang QR, Inertia mengirim props terbaru.
    useEffect(() => {
        if (tableProp) setTables(tableProp);
    }, [tableProp]);

    useEffect(() => {
        if (!pendingQr || !tableProp) return;
        const fresh = tableProp.find((table) => table.number === pendingQr);
        if (fresh) {
            setQrTable(fresh);
            setPendingQr(null);
        }
    }, [tableProp, pendingQr]);

    const areas = useMemo(() => listAreas(tables, areaProp), [tables, areaProp]);
    const sorted = useMemo(() => [...tables].sort((a, b) => a.number.localeCompare(b.number)), [tables]);
    const active = sorted.filter((table) => table.isActive);
    const visible = sorted.filter((table) => filter === 'semua' || (filter === 'aktif' ? table.isActive : !table.isActive));
    const seats = active.reduce((sum, table) => sum + table.seats, 0);

    const openNew = () => {
        const number = nextTableNumber(tables);
        if (!number) {
            toast.error('Nomor meja sudah penuh (maksimal 99 meja)');
            return;
        }
        setForm({ number, seats: 4, area: areas[0] });
    };

    const save = (data) => {
        const number = String(data.number).padStart(2, '0');
        const onError = (errors) => toast.error(Object.values(errors)[0] ?? 'Meja gagal disimpan');

        if (data.id) {
            router.put(
                `/admin/meja/${data.id}`,
                { seats: Number(data.seats), area: data.area },
                {
                    preserveScroll: true,
                    onError,
                    onSuccess: () => {
                        toast.success(`Meja ${number} diperbarui`);
                        setForm(null);
                    },
                },
            );
        } else {
            router.post(
                '/admin/meja',
                { number, seats: Number(data.seats), area: data.area },
                {
                    preserveScroll: true,
                    onError,
                    onSuccess: () => {
                        toast.success(`Meja ${number} ditambahkan · QR siap dicetak`);
                        // Token QR dibuat server; kartunya dibuka setelah data baru tiba.
                        setPendingQr(number);
                        setForm(null);
                    },
                },
            );
        }
    };

    const toggle = () => {
        const target = toggling;
        router.patch(
            `/admin/meja/${target.id}/status`,
            {},
            {
                preserveScroll: true,
                onSuccess: () => toast.success(target.isActive ? `Meja ${target.number} dinonaktifkan` : `Meja ${target.number} aktif kembali`),
                onError: () => toast.error('Status meja gagal diubah'),
                onFinish: () => setToggling(null),
            },
        );
    };

    const regenerateQr = (table) => {
        router.post(
            `/admin/meja/${table.id}/qr-ulang`,
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    // Tampilkan token sungguhan dari database, bukan buatan browser.
                    setPendingQr(table.number);
                    toast.success(`QR Meja ${table.number} dibuat ulang. Cetak dan ganti QR lama di meja.`);
                },
                onError: () => toast.error('QR gagal dibuat ulang'),
            },
        );
    };

    return (
        <AdminLayout title="Meja & QR">
            <div className="print:hidden">
                <PageHeader
                    title="Meja & QR"
                    subtitle={`${active.length} meja aktif · ${seats} kursi · ${tables.length - active.length} nonaktif`}
                    actions={
                        <>
                            <Button variant="outline" onClick={() => window.print()} disabled={active.length === 0}>
                                <Printer className="h-4 w-4" aria-hidden="true" />
                                Cetak Semua QR
                            </Button>
                            <Button onClick={openNew}>
                                <Plus className="h-4 w-4" aria-hidden="true" />
                                Tambah Meja
                            </Button>
                        </>
                    }
                />

                <FilterChips
                    label="Status meja"
                    options={FILTERS.map((option) => ({ ...option, count: option.value === 'semua' ? tables.length : option.value === 'aktif' ? active.length : tables.length - active.length }))}
                    value={filter}
                    onChange={setFilter}
                    className="mb-4"
                />

                <div className="stagger grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {visible.map((table) => (
                        <AdminTableCard key={table.id} table={table} onShowQr={setQrTable} onEdit={setForm} onToggle={setToggling} />
                    ))}
                    <button
                        type="button"
                        onClick={openNew}
                        className="lift flex min-h-[176px] flex-col items-center justify-center gap-2 rounded-[20px] border-2 border-dashed border-line-strong text-soft transition-colors hover:border-gold hover:text-navy"
                    >
                        <span className="grid h-11 w-11 place-items-center rounded-full bg-gold-tint text-warn ring-1 ring-gold/30">
                            <Plus className="h-5 w-5" aria-hidden="true" />
                        </span>
                        <span className="text-sm font-bold">Tambah Meja</span>
                        <span className="text-xs text-faint">Nomor berikutnya: {nextTableNumber(tables) ?? '—'}</span>
                    </button>
                </div>
            </div>

            <QrPrintSheet tables={active} appUrl={appUrl} restaurantName={restaurant.name} />

            {form && <TableFormModal initial={form} tables={tables} areas={areas} onClose={() => setForm(null)} onSave={save} />}

            <Modal open={Boolean(qrTable)} onClose={() => setQrTable(null)} title={`QR Meja ${qrTable?.number ?? ''}`} subtitle="Cetak dan tempel di meja. Pelanggan memindai QR; kasir memindai barcode." width="max-w-md">
                {qrTable && (
                    <TableQrCard
                        table={qrTable}
                        appUrl={appUrl}
                        actions={
                            <Button variant="ghost" size="sm" block className="mt-2" onClick={() => regenerateQr(qrTable)}>
                                <RefreshCcw className="h-4 w-4" aria-hidden="true" />
                                Buat Ulang QR (QR lama tidak berlaku)
                            </Button>
                        }
                    />
                )}
            </Modal>

            <Modal
                open={Boolean(toggling)}
                onClose={() => setToggling(null)}
                title={toggling?.isActive ? `Nonaktifkan Meja ${toggling?.number}?` : `Aktifkan Meja ${toggling?.number ?? ''}?`}
                subtitle={toggling?.isActive ? 'Meja tidak dihapus, hanya disembunyikan.' : 'Meja kembali bisa menerima pesanan.'}
                width="max-w-sm"
            >
                <p className="text-sm leading-relaxed text-soft">
                    {toggling?.isActive
                        ? 'Meja tidak tampil di halaman kasir dan QR-nya menolak pesanan baru. Pesanan lama di meja ini tetap tercatat di histori dan laporan.'
                        : 'Meja muncul lagi di halaman kasir dan QR yang lama kembali bisa dipakai.'}
                </p>
                <div className="mt-5 grid grid-cols-2 gap-3">
                    <Button variant="outline" onClick={() => setToggling(null)}>
                        Batal
                    </Button>
                    <Button variant={toggling?.isActive ? 'danger' : 'navy'} onClick={toggle}>
                        {toggling?.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                    </Button>
                </div>
            </Modal>
        </AdminLayout>
    );
}
