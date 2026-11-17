import { CircleCheck, ImagePlus } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

import Button from '@/Components/UI/Button';
import Input, { Select, Textarea } from '@/Components/UI/Input';
import Modal from '@/Components/UI/Modal';
import Toggle from '@/Components/UI/Toggle';
import { cx } from '@/Utils/classNames';
import { formatCurrency, formatPercent } from '@/Utils/formatCurrency';

const MAX_PHOTO_BYTES = 2 * 1024 * 1024;

export const EMPTY_MENU = { id: null, name: '', category: 'Makanan', description: '', hpp: 0, price: 0, available: true, image: null };

/** Form tambah/ubah menu. Margin dihitung langsung dari Harga jual − HPP. */
export default function MenuFormModal({ initial, categories, onClose, onSave }) {
    const [data, setData] = useState(initial);
    const [preview, setPreview] = useState(initial.image);
    // Berkas asli yang diunggah. `preview` hanya URL sementara untuk ditampilkan;
    // yang harus dikirim ke server adalah objek File-nya, bukan URL blob itu.
    const [photo, setPhoto] = useState(null);
    const set = (key) => (value) => setData((prev) => ({ ...prev, [key]: value }));
    const hpp = Number(data.hpp) || 0;
    const price = Number(data.price) || 0;
    const margin = price - hpp;
    const valid = data.name.trim() && price > 0 && hpp > 0;

    const pickPhoto = (event) => {
        const file = event.target.files?.[0];
        if (!file) return;
        if (file.size > MAX_PHOTO_BYTES) {
            toast.error('Ukuran foto maksimal 2 MB');
            return;
        }
        setPhoto(file);
        setPreview(URL.createObjectURL(file));
    };

    return (
        <Modal open onClose={onClose} title={initial.id ? 'Ubah Menu' : 'Tambah Menu Baru'} subtitle="Kolom bertanda * wajib diisi" width="max-w-xl">
            <form
                onSubmit={(event) => {
                    event.preventDefault();
                    if (valid) onSave({ ...data, hpp, price, image: photo });
                }}
            >
                <div className="grid gap-4 sm:grid-cols-[150px_1fr]">
                    <label className="relative grid h-[150px] cursor-pointer place-items-center overflow-hidden rounded-2xl border-2 border-dashed border-line-strong text-center hover:bg-raised">
                        {preview ? (
                            <img src={preview} alt="" className="absolute inset-0 h-full w-full object-cover" />
                        ) : (
                            <span className="px-3">
                                <ImagePlus className="mx-auto h-6 w-6 text-soft" aria-hidden="true" />
                                <span className="mt-1 block text-sm font-bold">Unggah foto</span>
                                <span className="block text-[11px] text-faint">JPG/PNG · maks 2 MB</span>
                            </span>
                        )}
                        <input type="file" accept="image/png,image/jpeg" className="sr-only" onChange={pickPhoto} />
                    </label>
                    <div className="space-y-3">
                        <Input label="Nama menu *" required value={data.name} onValueChange={set('name')} />
                        <Select label="Kategori *" value={data.category} onChange={(event) => set('category')(event.target.value)}>
                            {categories.map((name) => (
                                <option key={name}>{name}</option>
                            ))}
                        </Select>
                    </div>
                </div>

                <Textarea label="Deskripsi" rows={2} value={data.description} onChange={(event) => set('description')(event.target.value)} className="mt-4" />

                <div className="mt-4 grid grid-cols-2 gap-3">
                    <Input label="HPP (modal) *" prefix="Rp" currency value={data.hpp} onValueChange={set('hpp')} />
                    <Input label="Harga jual *" prefix="Rp" currency value={data.price} onValueChange={set('price')} />
                </div>

                <div className={cx('mt-4 flex items-center justify-between rounded-2xl px-4 py-3', margin >= 0 ? 'bg-success-tint text-success' : 'bg-danger-tint text-danger')}>
                    <span className="flex items-center gap-2 text-sm font-semibold">
                        <CircleCheck className="h-4 w-4" aria-hidden="true" />
                        Margin otomatis (Harga jual − HPP)
                    </span>
                    <span className="text-lg font-extrabold">{price ? `${formatCurrency(margin)} · ${formatPercent(margin / price)}` : '—'}</span>
                </div>

                <div className="mt-4 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-bold">Tampilkan di katalog pelanggan</p>
                        <p className="text-xs text-faint">Matikan saat stok habis</p>
                    </div>
                    <Toggle checked={data.available} label="Tampilkan di katalog" onLabel="Tersedia" offLabel="Habis" onChange={set('available')} />
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3">
                    <Button variant="outline" onClick={onClose}>
                        Batal
                    </Button>
                    <Button type="submit" variant="navy" disabled={!valid}>
                        Simpan Menu
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
