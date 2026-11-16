import { useState } from 'react';

import Button from '@/Components/UI/Button';
import Input from '@/Components/UI/Input';
import Modal from '@/Components/UI/Modal';
import { formatCurrency } from '@/Utils/formatCurrency';
import { roundTo } from '@/Utils/salesTarget';

/** Form atur target omzet bulanan; menampilkan target harian setaranya. */
export default function TargetFormModal({ target, onClose, onSave, saving = false }) {
    const [amount, setAmount] = useState(target.monthlyTarget);

    return (
        <Modal open onClose={onClose} title="Atur Target" subtitle={`Target omzet ${target.month}`} width="max-w-md">
            <form
                onSubmit={(event) => {
                    event.preventDefault();
                    if (amount > 0) onSave(amount);
                }}
            >
                <Input label="Target omzet bulanan" prefix="Rp" currency size="lg" value={amount} onValueChange={setAmount} inputClassName="text-lg font-bold" />
                <p className="mt-2 text-sm text-soft">
                    Setara target harian <strong>{formatCurrency(roundTo(amount / target.daysInMonth, 1000))}</strong>.
                </p>
                <div className="mt-5 grid grid-cols-2 gap-3">
                    <Button variant="outline" onClick={onClose} disabled={saving}>
                        Batal
                    </Button>
                    <Button type="submit" variant="navy" disabled={!amount || saving}>
                        {saving ? 'Menyimpan…' : 'Simpan Target'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
