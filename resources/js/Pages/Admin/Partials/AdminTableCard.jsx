import { Pencil, Power, QrCode, Users } from 'lucide-react';

import { TableStatusBadge } from '@/Components/UI/Badge';
import Button from '@/Components/UI/Button';
import { cx } from '@/Utils/classNames';

/** Kartu meja di halaman admin: status, kapasitas, dan aksi QR / ubah / aktif-nonaktif. */
export default function AdminTableCard({ table, onShowQr, onEdit, onToggle }) {
    const status = table.isActive ? table.status : 'nonaktif';
    const occupied = table.isActive && table.status === 'terisi';

    return (
        <article className={cx('lift flex flex-col rounded-[20px] border bg-panel p-4 shadow-[var(--shadow-soft)]', table.isActive ? 'border-line' : 'border-dashed border-line-strong bg-raised/60')}>
            <div className="flex items-center justify-between">
                <h2 className={cx('font-display text-2xl font-semibold', table.isActive ? 'text-navy' : 'text-faint')}>Meja {table.number}</h2>
                <TableStatusBadge status={status} />
            </div>
            <p className="mt-1 flex items-center gap-1.5 text-xs text-faint">
                <Users className="h-3.5 w-3.5" aria-hidden="true" />
                {table.seats} kursi · {table.area}
            </p>

            {occupied && table.session && (
                <p className="mt-3 rounded-xl bg-info-tint px-3 py-2 text-[13px]">
                    <span className="font-bold text-navy">{table.session.code}</span>
                    <span className="ml-2 text-soft">
                        {table.session.customer} · {table.session.minutes} mnt
                    </span>
                </p>
            )}
            {!table.isActive && <p className="mt-3 rounded-xl px-3 py-2 text-[13px] text-faint ring-1 ring-line">Tidak tampil di kasir · QR menolak pesanan baru</p>}

            <div className="mt-auto grid grid-cols-[1fr_auto_auto] gap-2 pt-3">
                <Button variant="outline" size="sm" onClick={() => onShowQr(table)} disabled={!table.isActive}>
                    <QrCode className="h-4 w-4" aria-hidden="true" />
                    QR Meja
                </Button>
                <button
                    type="button"
                    onClick={() => onEdit(table)}
                    aria-label={`Ubah Meja ${table.number}`}
                    title="Ubah meja"
                    className="grid h-9 w-9 place-items-center rounded-[11px] bg-raised text-soft transition hover:text-navy active:scale-95"
                >
                    <Pencil className="h-4 w-4" />
                </button>
                <button
                    type="button"
                    onClick={() => onToggle(table)}
                    disabled={occupied}
                    aria-label={table.isActive ? `Nonaktifkan Meja ${table.number}` : `Aktifkan Meja ${table.number}`}
                    title={occupied ? 'Meja sedang terisi. Tutup sesi meja dulu.' : table.isActive ? 'Nonaktifkan meja' : 'Aktifkan meja'}
                    className={cx(
                        'grid h-9 w-9 place-items-center rounded-[11px] transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-40',
                        table.isActive ? 'bg-danger-tint text-danger hover:bg-danger hover:text-white' : 'bg-success-tint text-success hover:bg-success hover:text-white',
                    )}
                >
                    <Power className="h-4 w-4" />
                </button>
            </div>
        </article>
    );
}
