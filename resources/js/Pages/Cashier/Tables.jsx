import { router, usePage } from '@inertiajs/react';
import { QrCode, RefreshCw, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

import PageHeader from '@/Components/Shared/PageHeader';
import TableQrCard from '@/Components/Shared/TableQrCard';
import { TableStatusBadge } from '@/Components/UI/Badge';
import Button from '@/Components/UI/Button';
import Modal from '@/Components/UI/Modal';
import { orders as mockOrders } from '@/Data/mock/orders';
import { tables as mockTables } from '@/Data/mock/tables';
import CashierLayout from '@/Layouts/CashierLayout';
import { cx } from '@/Utils/classNames';
import { withSessions } from '@/Utils/tables';

/**
 * Manajemen meja: status, tutup sesi, QR & barcode per meja.
 * Route: GET /kasir/meja
 * Props backend: tables [{ number, seats, area, status, session }], appUrl
 */
export default function CashierTables({ tables: tableProp, appUrl = typeof window !== 'undefined' ? window.location.origin : '' }) {
    // Kasir hanya melihat meja aktif; tambah/ubah/nonaktifkan meja ada di halaman admin Meja & QR
    const [tables, setTables] = useState(() => tableProp ?? withSessions(mockTables.filter((table) => table.isActive), mockOrders));
    const [qrTable, setQrTable] = useState(null);
    const [closing, setClosing] = useState(null);
    const [closingBusy, setClosingBusy] = useState(false);
    const { unservedCount } = usePage().props.flash ?? {};
    const free = tables.filter((table) => table.status === 'tersedia').length;

    // Props `tables` diperbarui setiap halaman ini dimuat ulang Inertia (mis.
    // setelah `closeSession` sukses, atau siaran WebSocket memicu router.reload()).
    useEffect(() => {
        if (tableProp) setTables(tableProp);
    }, [tableProp]);

    const closeSession = (session, force = false) => {
        setClosingBusy(true);
        router.post(
            `/kasir/meja/${session.id}/close`,
            { force },
            {
                preserveScroll: true,
                onSuccess: () => setClosing(null),
                onFinish: () => setClosingBusy(false),
            },
        );
    };

    return (
        <CashierLayout title="Manajemen Meja">
            <PageHeader
                title="Manajemen Meja"
                subtitle={`${free} tersedia · ${tables.length - free} terisi · total ${tables.length} meja`}
                actions={
                    <>
                        <TableStatusBadge status="tersedia" />
                        <TableStatusBadge status="terisi" />
                        <button
                            type="button"
                            aria-label="Muat ulang status meja"
                            onClick={() => router.reload({ onSuccess: () => toast('Status meja sudah terbaru') })}
                            className="grid h-10 w-10 place-items-center rounded-xl bg-gold-soft text-obsidian hover:bg-gold"
                        >
                            <RefreshCw className="h-4 w-4" />
                        </button>
                    </>
                }
            />

            <div className="stagger grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {tables.map((table) => (
                    <article key={table.number} className={cx('lift flex flex-col rounded-[20px] border bg-panel p-4 shadow-[var(--shadow-soft)]', table.status === 'terisi' ? 'border-navy/40' : 'border-line')}>
                        <div className="flex items-center justify-between">
                            <h2 className="font-display text-2xl font-semibold text-navy">Meja {table.number}</h2>
                            <TableStatusBadge status={table.status} />
                        </div>
                        <p className="mt-1 flex items-center gap-1.5 text-xs text-faint">
                            <Users className="h-3.5 w-3.5" aria-hidden="true" />
                            {table.seats} kursi · {table.area}
                        </p>

                        {table.session ? (
                            <div className="mt-3 rounded-xl bg-info-tint px-3 py-2 text-[13px]">
                                <span className="font-bold text-navy">{table.session.code}</span>
                                <span className="ml-2 text-soft">
                                    {table.session.customer} · {table.session.minutes} mnt
                                </span>
                            </div>
                        ) : (
                            <p className="mt-3 rounded-xl border border-dashed border-line-strong px-3 py-2 text-[13px] text-faint">Siap dipakai</p>
                        )}

                        <div className="mt-3 flex flex-col gap-2">
                            <Button variant="outline" block onClick={() => setQrTable(table)}>
                                <QrCode className="h-4 w-4" aria-hidden="true" />
                                Lihat QR Meja
                            </Button>
                            {table.status === 'terisi' && (
                                <Button variant="ghost" size="sm" block className="text-danger hover:bg-danger-tint hover:text-danger" onClick={() => setClosing(table)}>
                                    Tutup Sesi Meja
                                </Button>
                            )}
                        </div>
                    </article>
                ))}
            </div>

            <Modal open={Boolean(qrTable)} onClose={() => setQrTable(null)} title={`QR Meja ${qrTable?.number ?? ''}`} subtitle="Cetak dan tempel di meja. Pelanggan memindai QR; kasir memindai barcode." width="max-w-md">
                {qrTable && <TableQrCard table={qrTable} appUrl={appUrl} />}
            </Modal>

            <Modal open={Boolean(closing)} onClose={() => (closingBusy ? null : setClosing(null))} title={`Tutup sesi Meja ${closing?.number ?? ''}?`} subtitle="Lakukan setelah pelanggan meninggalkan meja." width="max-w-sm">
                <p className="text-sm text-soft">
                    Meja akan kembali <strong className="text-success">Tersedia</strong> dan pemindaian QR berikutnya dianggap pelanggan baru. Pesanan yang sudah lunas tetap tercatat di histori.
                </p>
                {unservedCount > 0 && (
                    <p className="mt-3 rounded-xl bg-danger-tint px-3 py-2 text-sm font-semibold text-danger">
                        Masih ada {unservedCount} pesanan yang belum disajikan. Tutup paksa akan mengabaikan ini.
                    </p>
                )}
                <div className="mt-5 grid grid-cols-2 gap-3">
                    <Button variant="outline" onClick={() => setClosing(null)} disabled={closingBusy}>
                        Batal
                    </Button>
                    <Button variant="navy" onClick={() => closeSession(closing.session, unservedCount > 0)} disabled={closingBusy}>
                        {closingBusy ? 'Memproses…' : unservedCount > 0 ? 'Tutup Paksa' : 'Tutup Sesi'}
                    </Button>
                </div>
            </Modal>
        </CashierLayout>
    );
}
