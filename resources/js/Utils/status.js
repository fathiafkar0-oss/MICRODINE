/**
 * Alur status pesanan (proposal 2.2):
 * Menunggu Bayar -> Diproses -> Selesai -> Diantar
 * Pesanan yang tidak dibayar dalam batas waktu menjadi Dibatalkan.
 */
export const ORDER_STATUS = {
    menunggu_bayar: { label: 'Menunggu Bayar', tone: 'warn' },
    diproses: { label: 'Diproses', tone: 'info' },
    selesai: { label: 'Selesai', tone: 'success' },
    diantar: { label: 'Diantar', tone: 'success' },
    dibatalkan: { label: 'Dibatalkan', tone: 'neutral' },
    gagal: { label: 'Gagal', tone: 'danger' },
};

/** Status yang berarti pembayaran sudah lunas. */
export const PAID_STATUSES = ['diproses', 'selesai', 'diantar'];

export const isPaid = (order) => PAID_STATUSES.includes(order.status);

export const TABLE_STATUS = {
    tersedia: { label: 'Tersedia', tone: 'success' },
    terisi: { label: 'Terisi', tone: 'danger' },
    nonaktif: { label: 'Nonaktif', tone: 'neutral' },
};

export const PAYMENT_METHOD_LABEL = { qris: 'QRIS', tunai: 'Tunai' };

/** Pesanan ke-2 dst. dalam satu sesi meja (pelanggan menambah pesanan setelah membayar pesanan pertama). */
export const isAddition = (order) => (order?.sequence ?? 1) > 1;

/** Kelas warna per nada status. Teks label selalu ikut ditampilkan. */
export const TONE_CLASS = {
    warn: 'bg-warn-tint text-warn',
    info: 'bg-info-tint text-info',
    success: 'bg-success-tint text-success',
    danger: 'bg-danger-tint text-danger',
    neutral: 'bg-raised text-soft',
    gold: 'bg-gold-soft text-obsidian',
};

export const TONE_DOT = {
    warn: 'bg-warn',
    info: 'bg-info',
    success: 'bg-success',
    danger: 'bg-danger',
    neutral: 'bg-faint',
    gold: 'bg-gold',
};
