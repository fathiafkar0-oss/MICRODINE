import { Head, router } from '@inertiajs/react';
import { Eye, EyeOff, Lock, ShieldCheck, User } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

import Logo from '@/Components/Shared/Logo';
import Button from '@/Components/UI/Button';
import Input from '@/Components/UI/Input';
import { cx } from '@/Utils/classNames';
import background from '@images/resto1.jpg';

const ROLES = [
    { id: 'kasir', label: 'Kasir', home: '/kasir', sample: 'dika.kasir' },
    { id: 'dapur', label: 'Dapur', home: '/dapur', sample: 'sari.dapur' },
    { id: 'admin', label: 'Admin', home: '/admin', sample: 'rina.admin' },
];
const FIELD_STYLE = { size: 'lg', labelClassName: 'text-gold-soft', fieldClassName: 'border-transparent bg-panel text-ink' };

/**
 * Portal masuk staf (satu pintu untuk semua peran, RBAC).
 * Route: GET /staf/masuk
 * Backend: ganti `submit` dengan useForm().post('/staf/masuk'); server menentukan
 * peran dari akun dan mengarahkan ke halaman yang sesuai.
 */
export default function Login() {
    const [role, setRole] = useState('kasir');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const active = ROLES.find((item) => item.id === role);

    const submit = (event) => {
        event.preventDefault();
        if (!username.trim() || !password) {
            toast.error('Username dan password wajib diisi');
            return;
        }
        toast.success(`Masuk sebagai ${active.label}`);
        router.visit(active.home);
    };

    return (
        <div className="relative grid min-h-dvh place-items-center overflow-hidden px-5 py-10">
            <Head title="Portal Karyawan" />
            <img src={background} alt="" className="absolute inset-0 h-full w-full object-cover" aria-hidden="true" />
            <div className="absolute inset-0 bg-navy/80" aria-hidden="true" />

            <form onSubmit={submit} className="relative w-full max-w-[400px] text-white">
                <Logo className="justify-center" />
                <h1 className="mt-6 text-[32px] font-extrabold leading-tight">Portal Karyawan</h1>
                <p className="mt-1 text-sm text-white/80">Masuk untuk mengelola pesanan, meja, dan laporan.</p>

                <div className="mt-6 grid grid-cols-3 gap-1 rounded-2xl bg-ivory p-1" role="tablist" aria-label="Pilih peran">
                    {ROLES.map((item) => (
                        <button
                            key={item.id}
                            type="button"
                            role="tab"
                            aria-selected={role === item.id}
                            onClick={() => setRole(item.id)}
                            className={cx('h-10 rounded-xl text-sm font-bold transition', role === item.id ? 'bg-gold text-obsidian' : 'text-navy hover:bg-white/60')}
                        >
                            {item.label}
                        </button>
                    ))}
                </div>

                <Input {...FIELD_STYLE} label="Username" icon={User} value={username} onValueChange={setUsername} autoComplete="username" placeholder={active.sample} className="mt-5" />
                <Input
                    {...FIELD_STYLE}
                    label="Password"
                    icon={Lock}
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onValueChange={setPassword}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    className="mt-4"
                    trailing={
                        <button
                            type="button"
                            onClick={() => setShowPassword((value) => !value)}
                            aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                            className="grid h-8 w-8 place-items-center rounded-lg text-faint hover:bg-raised"
                        >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                    }
                />

                <Button type="submit" size="lg" block className="mt-6">
                    Masuk ke Portal
                </Button>

                <p className="mt-4 flex items-center justify-center gap-2 text-xs text-white/75">
                    <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                    Akses dipisah sesuai peran: kasir, dapur, dan admin
                </p>
            </form>
        </div>
    );
}
