import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';

import PageHeader from '@/Components/Shared/PageHeader';
import SearchBar from '@/Components/Shared/SearchBar';
import Button from '@/Components/UI/Button';
import { Select } from '@/Components/UI/Input';
import MenuThumb from '@/Components/UI/MenuThumb';
import Modal from '@/Components/UI/Modal';
import Table, { TableCell, TableRow } from '@/Components/UI/Table';
import Toggle from '@/Components/UI/Toggle';
import { categories as mockCategories, menus as mockMenus } from '@/Data/mock/menus';
import AdminLayout from '@/Layouts/AdminLayout';
import MenuFormModal, { EMPTY_MENU } from '@/Pages/Admin/Partials/MenuFormModal';
import { formatCurrency, formatPercent } from '@/Utils/formatCurrency';

/**
 * Manajemen menu & HPP. Margin dihitung otomatis dari Harga Jual − HPP.
 * Route: GET /admin/menu
 * Backend: simpan via POST/PUT /admin/menu. Perubahan HPP/harga TIDAK mengubah transaksi lama
 * karena item pesanan menyimpan snapshot harga & HPP.
 */
export default function AdminMenus({ menus: initial = mockMenus, categories = mockCategories }) {
    const [menus, setMenus] = useState(initial);
    const [query, setQuery] = useState('');
    const [category, setCategory] = useState('Semua');
    const [form, setForm] = useState(null);
    const [deleting, setDeleting] = useState(null);

    const visible = useMemo(() => {
        const keyword = query.trim().toLowerCase();
        return menus.filter((menu) => (category === 'Semua' || menu.category === category) && (!keyword || menu.name.toLowerCase().includes(keyword)));
    }, [menus, query, category]);

    const update = (id, changes) => setMenus((prev) => prev.map((menu) => (menu.id === id ? { ...menu, ...changes } : menu)));

    const save = (data) => {
        if (data.id) {
            update(data.id, data);
            toast.success(`${data.name} diperbarui`);
        } else {
            const next = Math.max(...menus.map((menu) => Number(menu.id.slice(2)))) + 1;
            setMenus((prev) => [...prev, { ...data, id: `M-${String(next).padStart(3, '0')}` }]);
            toast.success(`${data.name} ditambahkan`);
        }
        setForm(null);
    };

    const remove = () => {
        setMenus((prev) => prev.filter((menu) => menu.id !== deleting.id));
        toast.success(`${deleting.name} dihapus`);
        setDeleting(null);
    };

    return (
        <AdminLayout title="Manajemen Menu">
            <PageHeader
                title="Manajemen Menu"
                subtitle={`${menus.length} menu · margin dihitung otomatis dari Harga Jual − HPP`}
                actions={
                    <>
                        <SearchBar value={query} onChange={setQuery} placeholder="Cari menu..." label="Cari menu" className="w-52" />
                        <Select size="sm" value={category} onChange={(event) => setCategory(event.target.value)} aria-label="Filter kategori">
                            <option value="Semua">Semua kategori</option>
                            {categories.map((name) => (
                                <option key={name}>{name}</option>
                            ))}
                        </Select>
                        <Button onClick={() => setForm(EMPTY_MENU)}>
                            <Plus className="h-4 w-4" aria-hidden="true" />
                            Tambah Menu
                        </Button>
                    </>
                }
            />

            <Table columns={['Menu', 'Kategori', 'HPP', 'Harga Jual', 'Margin', 'Status', 'Aksi']} minWidth="min-w-[860px]" isEmpty={visible.length === 0} empty="Tidak ada menu yang cocok.">
                {visible.map((menu) => {
                    const margin = menu.price - menu.hpp;
                    return (
                        <TableRow key={menu.id}>
                            <TableCell>
                                <div className="flex items-center gap-3">
                                    <MenuThumb menu={menu} className="h-10 w-10 rounded-lg" iconClass="h-4 w-4" />
                                    <div>
                                        <p className="font-bold text-ink">{menu.name}</p>
                                        <p className="text-xs text-faint">ID {menu.id}</p>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell>
                                <span className="rounded-full bg-info-tint px-2.5 py-1 text-xs font-semibold text-info">{menu.category}</span>
                            </TableCell>
                            <TableCell className="text-soft">{formatCurrency(menu.hpp)}</TableCell>
                            <TableCell className="font-bold">{formatCurrency(menu.price)}</TableCell>
                            <TableCell>
                                <span className="font-bold text-success">{formatCurrency(margin)}</span>
                                <span className="ml-2 rounded-full bg-success-tint px-2 py-0.5 text-xs font-bold text-success">{formatPercent(margin / menu.price)}</span>
                            </TableCell>
                            <TableCell>
                                <Toggle checked={menu.available} label={`Ketersediaan ${menu.name}`} onLabel="Tersedia" offLabel="Habis" onChange={(value) => update(menu.id, { available: value })} />
                            </TableCell>
                            <TableCell>
                                <div className="flex gap-1.5">
                                    <button type="button" onClick={() => setForm(menu)} aria-label={`Ubah ${menu.name}`} className="grid h-8 w-8 place-items-center rounded-lg bg-raised text-soft hover:text-navy">
                                        <Pencil className="h-4 w-4" />
                                    </button>
                                    <button type="button" onClick={() => setDeleting(menu)} aria-label={`Hapus ${menu.name}`} className="grid h-8 w-8 place-items-center rounded-lg bg-danger-tint text-danger hover:bg-danger hover:text-white">
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </TableCell>
                        </TableRow>
                    );
                })}
            </Table>

            {form && <MenuFormModal initial={form} categories={categories} onClose={() => setForm(null)} onSave={save} />}

            <Modal open={Boolean(deleting)} onClose={() => setDeleting(null)} title={`Hapus ${deleting?.name ?? ''}?`} subtitle="Menu hilang dari katalog pelanggan." width="max-w-sm">
                <p className="text-sm text-soft">Transaksi lama yang memuat menu ini tetap utuh karena harga dan HPP-nya sudah tersimpan sebagai snapshot.</p>
                <div className="mt-5 grid grid-cols-2 gap-3">
                    <Button variant="outline" onClick={() => setDeleting(null)}>
                        Batal
                    </Button>
                    <Button variant="danger" onClick={remove}>
                        Hapus Menu
                    </Button>
                </div>
            </Modal>
        </AdminLayout>
    );
}
