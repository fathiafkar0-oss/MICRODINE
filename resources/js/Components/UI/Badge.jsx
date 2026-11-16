import { cx } from '@/Utils/classNames';
import { ORDER_STATUS, TABLE_STATUS, TONE_CLASS, TONE_DOT } from '@/Utils/status';

/**
 * Label kecil berbentuk pil. Warna (tone) selalu disertai teks.
 * tone: warn | info | success | danger | neutral | gold
 */
export default function Badge({ tone = 'neutral', dot = false, className = '', children }) {
    return (
        <span className={cx('inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold', TONE_CLASS[tone], className)}>
            {dot && <span className={cx('h-1.5 w-1.5 rounded-full', TONE_DOT[tone])} aria-hidden="true" />}
            {children}
        </span>
    );
}

/** Badge status pesanan: Menunggu Bayar, Diproses, Selesai, ... */
export function OrderStatusBadge({ status, className }) {
    const meta = ORDER_STATUS[status] ?? ORDER_STATUS.dibatalkan;
    return (
        <Badge tone={meta.tone} dot className={className}>
            {meta.label}
        </Badge>
    );
}

/** Badge status meja: Tersedia / Terisi. */
export function TableStatusBadge({ status }) {
    const meta = TABLE_STATUS[status];
    return (
        <Badge tone={meta.tone} dot>
            {meta.label}
        </Badge>
    );
}

/** Pil "Meja 07" berwarna emas seperti di kartu antrean. */
export function TableChip({ number, className }) {
    return <span className={cx('rounded-full bg-gold-soft px-2.5 py-0.5 text-xs font-bold text-obsidian', className)}>Meja {number}</span>;
}
