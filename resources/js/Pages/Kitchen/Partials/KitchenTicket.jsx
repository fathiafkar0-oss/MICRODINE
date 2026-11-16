import { CircleCheck, Clock } from 'lucide-react';

import { TableChip } from '@/Components/UI/Badge';
import { cx } from '@/Utils/classNames';
import { countItems } from '@/Utils/formatCurrency';

/** Batas menit sebelum tiket ditandai "lama" (garis merah). */
export const LATE_AFTER_MINUTES = 15;

/** Tiket pesanan di layar dapur: huruf besar, catatan menonjol, tombol selesai lebar. */
export default function KitchenTicket({ order, onDone }) {
    const late = order.minutesAgo >= LATE_AFTER_MINUTES;

    return (
        <article className={cx('lift flex flex-col rounded-[24px] border-2 bg-panel p-5 shadow-[var(--shadow-soft)]', late ? 'border-crimson/70' : 'border-transparent')}>
            <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                    <span className="text-2xl font-extrabold text-navy">{order.code}</span>
                    <TableChip number={order.table} className="text-sm" />
                </div>
                <span className={cx('inline-flex items-center gap-1 text-sm font-semibold', late ? 'text-crimson' : 'text-faint')}>
                    <Clock className="h-4 w-4" aria-hidden="true" />
                    {order.minutesAgo} mnt{late && ' · lama'}
                </span>
            </div>
            <p className="mt-1 font-bold text-soft">
                {order.customer} · {countItems(order.items)} item
            </p>

            <ul className="mt-3 flex-1 space-y-2 border-t border-line pt-3">
                {order.items.map((item) => (
                    <li key={item.menuId}>
                        <p className="text-lg font-bold leading-snug">
                            <span className="mr-2 inline-grid h-7 min-w-7 place-items-center rounded-lg bg-navy px-1.5 text-sm text-white">{item.qty}×</span>
                            {item.name}
                        </p>
                        {item.note && <p className="ml-9 mt-0.5 rounded-lg bg-danger-tint px-2 py-1 text-sm font-semibold text-danger">Catatan: {item.note}</p>}
                    </li>
                ))}
            </ul>

            <button
                type="button"
                onClick={() => onDone(order)}
                className="mt-4 inline-flex h-14 items-center justify-center gap-2 rounded-[16px] bg-gold text-base font-extrabold text-obsidian shadow-[0_10px_22px_-12px_rgba(204,158,74,0.9)] transition hover:bg-gold-hover active:scale-[0.97]"
            >
                <CircleCheck className="h-5 w-5" aria-hidden="true" />
                Tandai Selesai
            </button>
        </article>
    );
}
