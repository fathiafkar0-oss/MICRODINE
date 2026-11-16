import { useState } from 'react';

import Button from '@/Components/UI/Button';
import Input from '@/Components/UI/Input';
import Modal from '@/Components/UI/Modal';
import { cx } from '@/Utils/classNames';
import { calculateBill, formatCurrency } from '@/Utils/formatCurrency';

/** Kalkulator pembayaran tunai di kasir: uang diterima -> kembalian otomatis. */
export default function CashPaymentModal({ order, taxRate, onClose, onConfirm }) {
    const [received, setReceived] = useState(0);
    if (!order) return null;

    const { total } = calculateBill(order.items, taxRate);
    const change = received - total;
    const shortcuts = [...new Set([total, Math.ceil(total / 10000) * 10000, Math.ceil(total / 50000) * 50000, 100000])].filter((value) => value >= total).slice(0, 4);

    return (
        <Modal open onClose={onClose} title={`Terima Tunai · ${order.code}`} subtitle={`Meja ${order.table} · ${order.customer}`} width="max-w-md">
            <form
                onSubmit={(event) => {
                    event.preventDefault();
                    if (received >= total) onConfirm(order, received, change);
                }}
            >
                <div className="rounded-2xl bg-raised p-4">
                    <p className="text-xs text-faint">Total tagihan</p>
                    <p className="text-3xl font-extrabold text-navy">{formatCurrency(total)}</p>
                </div>

                <Input label="Uang diterima" prefix="Rp" currency size="lg" autoFocus placeholder="0" value={received} onValueChange={setReceived} className="mt-4" inputClassName="text-lg font-bold" />
                <div className="mt-2 flex flex-wrap gap-2">
                    {shortcuts.map((value) => (
                        <button key={value} type="button" onClick={() => setReceived(value)} className="rounded-full border border-line-strong px-3 py-1.5 text-xs font-semibold hover:bg-raised">
                            {value === total ? 'Uang pas' : formatCurrency(value)}
                        </button>
                    ))}
                </div>

                <div
                    className={cx(
                        'mt-4 flex items-center justify-between rounded-2xl px-4 py-3',
                        !received ? 'bg-raised text-faint' : change >= 0 ? 'bg-success-tint text-success' : 'bg-danger-tint text-danger',
                    )}
                >
                    <span className="text-sm font-semibold">{change >= 0 || !received ? 'Kembalian' : 'Uang kurang'}</span>
                    <span className="text-xl font-extrabold">{received ? formatCurrency(Math.abs(change)) : '—'}</span>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3">
                    <Button variant="outline" onClick={onClose}>
                        Batal
                    </Button>
                    <Button type="submit" variant="navy" disabled={received < total}>
                        Konfirmasi Lunas
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
