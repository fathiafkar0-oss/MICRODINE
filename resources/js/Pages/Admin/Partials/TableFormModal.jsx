import { Info } from 'lucide-react';
import { useState } from 'react';

import Button from '@/Components/UI/Button';
import Input, { Select } from '@/Components/UI/Input';
import Modal from '@/Components/UI/Modal';
import { MAX_TABLE_NUMBER, padTableNumber } from '@/Utils/tables';

const NEW_AREA = '__baru__';

/**
 * Form tambah / ubah meja.
 * - Nomor meja hanya bisa diisi saat menambah (mengubah nomor membuat QR yang sudah dicetak tidak berlaku).
 * - Nomor wajib unik, 1–99 (route /meja/{nomor} dibatasi 2 digit).
 * Backend: POST /admin/meja · PUT /admin/meja/{id}
 */
export default function TableFormModal({ initial, tables, areas, onClose, onSave }) {
    const editing = Boolean(initial.id);
    const [number, setNumber] = useState(initial.number ? String(Number(initial.number)) : '');
    const [seats, setSeats] = useState(String(initial.seats ?? 4));
    const [area, setArea] = useState(initial.area ?? areas[0]);
    const [newArea, setNewArea] = useState('');

    const numberValue = Number(number);
    const padded = number ? padTableNumber(number) : '';
    const taken = !editing && tables.some((table) => table.number === padded);
    const numberError = !number
        ? 'Nomor meja wajib diisi'
        : !Number.isInteger(numberValue) || numberValue < 1 || numberValue > MAX_TABLE_NUMBER
          ? `Nomor meja 1–${MAX_TABLE_NUMBER}`
          : taken
            ? `Meja ${padded} sudah ada (termasuk meja nonaktif)`
            : null;
    const seatsValue = Number(seats);
    const seatsError = !Number.isInteger(seatsValue) || seatsValue < 1 || seatsValue > 20 ? 'Jumlah kursi 1–20' : null;
    const finalArea = area === NEW_AREA ? newArea.trim() : area;
    const areaError = area === NEW_AREA && !finalArea ? 'Nama area wajib diisi' : null;
    const valid = !numberError && !seatsError && !areaError;

    const submit = (event) => {
        event.preventDefault();
        if (valid) onSave({ ...initial, number: padded, seats: seatsValue, area: finalArea });
    };

    return (
        <Modal open onClose={onClose} title={editing ? `Ubah Meja ${initial.number}` : 'Tambah Meja'} subtitle={editing ? 'Perbarui kapasitas atau area meja' : 'QR & barcode dibuat otomatis setelah disimpan'} width="max-w-md">
            <form onSubmit={submit} noValidate className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                    <Input
                        label="Nomor meja"
                        type="number"
                        inputMode="numeric"
                        min="1"
                        max={MAX_TABLE_NUMBER}
                        value={number}
                        onValueChange={setNumber}
                        disabled={editing}
                        error={number ? numberError : null}
                        hint={editing ? 'Nomor tidak bisa diubah' : padded ? `Dicetak sebagai Meja ${padded}` : 'Disarankan nomor berikutnya'}
                        autoFocus={!editing}
                    />
                    <Input label="Jumlah kursi" type="number" inputMode="numeric" min="1" max="20" value={seats} onValueChange={setSeats} error={seatsError} />
                </div>

                <Select label="Area" value={area} onChange={(event) => setArea(event.target.value)}>
                    {areas.map((name) => (
                        <option key={name}>{name}</option>
                    ))}
                    <option value={NEW_AREA}>+ Area baru…</option>
                </Select>
                {area === NEW_AREA && <Input label="Nama area baru" value={newArea} onValueChange={setNewArea} placeholder="mis. Lantai 2" error={newArea ? null : areaError} autoFocus />}

                {editing && (
                    <p className="flex gap-2 rounded-[14px] bg-info-tint px-3.5 py-3 text-xs leading-relaxed text-info">
                        <Info className="h-4 w-4 shrink-0" aria-hidden="true" />
                        Perubahan kursi dan area tidak mengubah QR. QR yang sudah ditempel di meja tetap berlaku.
                    </p>
                )}

                <div className="grid grid-cols-2 gap-3 pt-2">
                    <Button variant="outline" onClick={onClose}>
                        Batal
                    </Button>
                    <Button type="submit" variant="navy" disabled={!valid}>
                        {editing ? 'Simpan Perubahan' : 'Tambah Meja'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
