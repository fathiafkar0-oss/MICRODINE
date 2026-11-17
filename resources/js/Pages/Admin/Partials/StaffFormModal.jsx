import { router } from '@inertiajs/react';
import { ChefHat, KeyRound, Shield, Store, User } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

import Button from '@/Components/UI/Button';
import Input from '@/Components/UI/Input';
import Modal from '@/Components/UI/Modal';
import { cx } from '@/Utils/classNames';

const ROLES = [
    { id: 'kasir', label: 'Kasir', desc: 'Akses antrean kasir, kas, dan meja', icon: Store },
    { id: 'dapur', label: 'Dapur', desc: 'Akses antrean masak Kitchen Display (KDS)', icon: ChefHat },
    { id: 'admin', label: 'Admin', desc: 'Akses penuh menu, laporan, target, & sistem', icon: Shield },
];

export default function StaffFormModal({ open, onClose }) {
    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [role, setRole] = useState('kasir');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);

    if (!open) return null;

    const submit = (event) => {
        event.preventDefault();
        setErrors({});

        const validation = {};
        if (!name.trim()) validation.name = 'Nama lengkap wajib diisi.';
        if (!username.trim()) validation.username = 'Username wajib diisi.';
        if (!password || password.length < 4) validation.password = 'Password minimal 4 karakter.';

        if (Object.keys(validation).length > 0) {
            setErrors(validation);
            return;
        }

        setSubmitting(true);
        router.post(
            '/admin/pengaturan/staf',
            {
                name: name.trim(),
                username: username.trim().toLowerCase(),
                role,
                password,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success(`Akun staf ${name} berhasil dibuat.`);
                    onClose();
                },
                onError: (err) => {
                    setErrors(err);
                    setSubmitting(false);
                },
                onFinish: () => setSubmitting(false),
            },
        );
    };

    return (
        <Modal open onClose={onClose} title="Tambah Akun Staf" subtitle="Buat akun untuk kasir, juru masak dapur, atau admin" width="max-w-md">
            <form onSubmit={submit} noValidate className="space-y-4">
                <Input
                    label="Nama Lengkap"
                    icon={User}
                    placeholder="Mis. Andi Wijaya"
                    value={name}
                    onValueChange={(val) => {
                        setName(val);
                        setErrors((prev) => ({ ...prev, name: '' }));
                    }}
                    error={errors.name}
                    autoFocus
                />

                <Input
                    label="Username Login"
                    placeholder="Mis. andi"
                    value={username}
                    onValueChange={(val) => {
                        setUsername(val.toLowerCase().replace(/[^a-z0-9_-]/g, ''));
                        setErrors((prev) => ({ ...prev, username: '' }));
                    }}
                    hint="Huruf kecil, tanpa spasi. Digunakan untuk login."
                    error={errors.username}
                />

                <div>
                    <label className="mb-2 block text-xs font-bold text-ink">Peran Staf</label>
                    <div className="grid gap-2">
                        {ROLES.map(({ id, label, desc, icon: Icon }) => (
                            <label
                                key={id}
                                className={cx(
                                    'flex cursor-pointer items-center gap-3 rounded-2xl border-2 p-3 transition',
                                    role === id ? 'border-gold bg-gold-tint/40 shadow-sm' : 'border-line bg-raised hover:border-line-strong',
                                )}
                            >
                                <input
                                    type="radio"
                                    name="role"
                                    value={id}
                                    checked={role === id}
                                    onChange={() => setRole(id)}
                                    className="sr-only"
                                />
                                <span className={cx('grid h-9 w-9 shrink-0 place-items-center rounded-xl', role === id ? 'bg-gold text-obsidian' : 'bg-line text-soft')}>
                                    <Icon className="h-4 w-4" aria-hidden="true" />
                                </span>
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-bold text-navy">{label}</p>
                                    <p className="text-xs text-soft">{desc}</p>
                                </div>
                            </label>
                        ))}
                    </div>
                    {errors.role && <p className="mt-1 text-xs text-danger">{errors.role}</p>}
                </div>

                <Input
                    label="Kata Sandi (Password)"
                    type="password"
                    icon={KeyRound}
                    placeholder="Minimal 4 karakter"
                    value={password}
                    onValueChange={(val) => {
                        setPassword(val);
                        setErrors((prev) => ({ ...prev, password: '' }));
                    }}
                    error={errors.password}
                />

                <div className="mt-6 grid grid-cols-2 gap-3 pt-2">
                    <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>
                        Batal
                    </Button>
                    <Button type="submit" variant="navy" disabled={submitting}>
                        {submitting ? 'Menyimpan…' : 'Simpan Akun'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
