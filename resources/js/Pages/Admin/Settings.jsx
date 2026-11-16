import { Percent, Plus, QrCode, Store, Timer, UserCog } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

import PageHeader from '@/Components/Shared/PageHeader';
import Badge from '@/Components/UI/Badge';
import Button from '@/Components/UI/Button';
import Card, { CardHeader } from '@/Components/UI/Card';
import Input from '@/Components/UI/Input';
import Toggle from '@/Components/UI/Toggle';
import { restaurant as mockRestaurant } from '@/Data/mock/restaurant';
import { staff as mockStaff } from '@/Data/mock/staff';
import AdminLayout from '@/Layouts/AdminLayout';
import { cx, initials } from '@/Utils/classNames';

const ROLE_TONE = { admin: 'gold', dapur: 'warn', kasir: 'info' };

/**
 * Pengaturan restoran: identitas, pajak daerah, aturan pesanan, pembayaran, akun staf.
 * Route: GET /admin/pengaturan · Backend: PUT /admin/pengaturan
 */
export default function AdminSettings({ restaurant = mockRestaurant, staff = Object.values(mockStaff), payment = { provider: 'Midtrans', mode: 'sandbox' } }) {
    const [form, setForm] = useState({ ...restaurant, taxPercent: Math.round(restaurant.taxRate * 100) });
    const set = (key) => (value) => setForm((prev) => ({ ...prev, [key]: value }));

    const save = (event) => {
        event.preventDefault();
        toast.success('Pengaturan disimpan');
    };

    return (
        <AdminLayout title="Pengaturan Restoran">
            <form onSubmit={save}>
                <PageHeader
                    title="Pengaturan Restoran"
                    subtitle="Berlaku untuk semua kasir, dapur, dan halaman pelanggan"
                    actions={
                        <Button type="submit" variant="navy">
                            Simpan Perubahan
                        </Button>
                    }
                />

                <div className="stagger grid gap-4 xl:grid-cols-2">
                    <Card>
                        <CardHeader icon={Store} title="Identitas restoran" />
                        <Input label="Nama restoran" value={form.name} onValueChange={set('name')} hint="Tampil di halaman menu pelanggan dan struk." />
                    </Card>

                    <Card>
                        <CardHeader icon={Percent} title="Pajak daerah (PBJT / PB1)" />
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <p className="text-sm font-bold">Pungut pajak di tagihan</p>
                                <p className="text-xs text-faint">Matikan jika usaha belum menjadi wajib pajak daerah.</p>
                            </div>
                            <Toggle checked={form.taxEnabled} label="Pungut pajak" onChange={set('taxEnabled')} />
                        </div>
                        <div className={cx('mt-4 grid grid-cols-2 gap-3', !form.taxEnabled && 'pointer-events-none opacity-50')}>
                            <Input label="Label di struk" value={form.taxLabel} onValueChange={set('taxLabel')} />
                            <Input label="Tarif (%)" type="number" min="0" max="10" value={form.taxPercent} onValueChange={set('taxPercent')} />
                        </div>
                        <p className="mt-2 text-xs text-faint">Tarif sesuai perda setempat (paling tinggi 10%). Omzet dan laba di laporan dihitung sebelum pajak.</p>
                    </Card>

                    <Card>
                        <CardHeader icon={Timer} title="Aturan pesanan & sesi meja" />
                        <div className="grid grid-cols-2 gap-3">
                            <Input label="Batas bayar (menit)" type="number" min="5" value={form.paymentDeadlineMinutes} onValueChange={set('paymentDeadlineMinutes')} />
                            <Input label="Sesi meja tutup otomatis (menit)" type="number" min="10" value={form.sessionTimeoutMinutes} onValueChange={set('sessionTimeoutMinutes')} />
                        </div>
                        <p className="mt-2 text-xs text-faint">Pesanan yang belum dibayar melewati batas akan dibatalkan. Sesi meja ditutup otomatis bila semua pesanan sudah diantar dan tidak ada aktivitas.</p>
                    </Card>

                    <Card>
                        <CardHeader icon={QrCode} title="Pembayaran QRIS" />
                        <div className="flex items-center justify-between rounded-2xl bg-raised p-4">
                            <div>
                                <p className="font-bold">{payment.provider}</p>
                                <p className="text-xs text-faint">Status lunas ditetapkan dari notifikasi webhook yang valid</p>
                            </div>
                            <Badge tone={payment.mode === 'sandbox' ? 'warn' : 'success'} dot>
                                {payment.mode === 'sandbox' ? 'Mode sandbox (uji)' : 'Mode produksi'}
                            </Badge>
                        </div>
                        <p className="mt-2 text-xs text-faint">Mode sandbox tidak memakai uang sungguhan. Kunci API disimpan di file .env server, bukan di halaman ini.</p>
                    </Card>
                </div>

                <Card className="mt-4">
                    <CardHeader
                        icon={UserCog}
                        title="Akun staf"
                        action={
                            <Button size="sm" variant="outline" onClick={() => toast('Form tambah akun dibuat di fase backend')}>
                                <Plus className="h-4 w-4" aria-hidden="true" />
                                Tambah Akun
                            </Button>
                        }
                    />
                    <ul className="divide-y divide-line">
                        {staff.map((person) => (
                            <li key={person.id} className="flex items-center gap-3 py-3">
                                <span className="grid h-10 w-10 place-items-center rounded-full bg-gold-soft text-sm font-bold text-obsidian">{initials(person.name)}</span>
                                <div className="flex-1">
                                    <p className="font-bold">{person.name}</p>
                                    <p className="text-xs text-faint">{person.shift}</p>
                                </div>
                                <Badge tone={ROLE_TONE[person.role] ?? 'info'} className="capitalize">
                                    {person.role}
                                </Badge>
                            </li>
                        ))}
                    </ul>
                </Card>
            </form>
        </AdminLayout>
    );
}
