import { Head, router } from '@inertiajs/react';
import { ArrowRight, Eye, EyeOff, Lock, ShieldCheck, User } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

import LoginField from '@/Pages/Auth/Partials/LoginField';
import LoginBackdrop from '@/Pages/Auth/Partials/LoginBackdrop';
import IosSwitch from '@/Pages/Auth/Partials/IosSwitch';
import RoleTabs from '@/Pages/Auth/Partials/RoleTabs';
import { STAFF_ROLES } from '@/Pages/Auth/Partials/staffRoles';

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
    const [remember, setRemember] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState(false);
    const active = STAFF_ROLES.find((item) => item.id === role);

    const submit = (event) => {
        event.preventDefault();
        if (!username.trim() || !password) {
            setError(true);
            toast.error('Username dan password wajib diisi');
            return;
        }
        toast.success(`Selamat bertugas, masuk sebagai ${active.label}`);
        router.visit(active.home);
    };

    return (
        <LoginBackdrop roles={STAFF_ROLES} active={active}>
            <Head title="Portal Karyawan" />
            <p className="animate-hero-rise font-script text-2xl text-gold [animation-delay:200ms] [@media(max-height:820px)]:hidden">Selamat bertugas</p>
            <div className="mt-4 w-full max-w-[440px] [@media(max-height:820px)]:mt-0 animate-hero-rise [animation-delay:350ms]">
                <form
                    onSubmit={submit}
                    noValidate
                    className="relative rounded-[30px] border border-white/70 bg-ivory-paper px-6 py-8 shadow-[0_40px_90px_-30px_rgba(0,0,0,0.75)] sm:px-10 sm:py-9"
                >
                    {/* Garis emas tipis di dalam kartu: sentuhan klasik pada sudut membulat ala iPhone */}
                    <span className="pointer-events-none absolute inset-[7px] rounded-[24px] border border-gold/30" aria-hidden="true" />

                    <div className="text-center">
                        <p className="flex items-center justify-center gap-3 text-[11px] font-semibold uppercase tracking-[0.3em] text-gold">
                            <span className="h-px w-6 bg-gold/60" aria-hidden="true" />
                            Khusus Staf
                            <span className="h-px w-6 bg-gold/60" aria-hidden="true" />
                        </p>
                        <h1 className="mt-3 font-display text-[2.6rem] font-semibold leading-none text-navy">Portal Karyawan</h1>
                        <p className="mt-3 text-sm text-soft [@media(max-height:820px)]:hidden">Masuk untuk mengelola pesanan, meja, dan laporan.</p>
                    </div>

                    <div className="mt-7">
                        <RoleTabs roles={STAFF_ROLES} value={role} onChange={setRole} />
                    </div>

                    <LoginField
                        label="Username"
                        icon={User}
                        value={username}
                        onChange={(event) => {
                            setUsername(event.target.value);
                            setError(false);
                        }}
                        autoComplete="username"
                        placeholder={`mis. ${active.sample}`}
                        aria-invalid={error && !username.trim()}
                        className="mt-6"
                    />
                    <LoginField
                        label="Password"
                        icon={Lock}
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(event) => {
                            setPassword(event.target.value);
                            setError(false);
                        }}
                        autoComplete="current-password"
                        placeholder="••••••••"
                        aria-invalid={error && !password}
                        className="mt-5"
                        trailing={
                            <button
                                type="button"
                                onClick={() => setShowPassword((value) => !value)}
                                aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                                className="grid h-8 w-8 place-items-center rounded-full text-faint transition-colors hover:bg-navy/5 hover:text-navy"
                            >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        }
                    />

                    {error && (
                        <p role="alert" className="mt-3 animate-fade-in text-sm text-crimson">
                            Username dan password wajib diisi.
                        </p>
                    )}

                    <IosSwitch label="Ingat saya di perangkat ini" checked={remember} onChange={setRemember} className="mt-5 px-1" />

                    <button
                        type="submit"
                        className="group relative mt-6 flex h-[54px] w-full items-center justify-center gap-2.5 overflow-hidden rounded-[14px] bg-navy text-[15px] font-semibold tracking-[0.01em] text-ivory shadow-[0_10px_24px_-10px_rgba(10,29,75,0.6)] transition-[background-color,transform] duration-200 hover:bg-obsidian active:scale-[0.98]"
                    >
                        {/* Kilau emas yang melintas saat tombol diarahkan kursor */}
                        <span
                            className="absolute inset-y-0 -left-1/3 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-gold/25 to-transparent transition-transform duration-700 group-hover:translate-x-[400%]"
                            aria-hidden="true"
                        />
                        <span className="relative">Masuk sebagai {active.label}</span>
                        <ArrowRight className="relative h-4 w-4 text-gold transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
                    </button>

                    <p className="mt-5 flex items-center justify-center gap-2 text-xs text-faint [@media(max-height:820px)]:hidden">
                        <ShieldCheck className="h-4 w-4 text-gold" strokeWidth={1.5} aria-hidden="true" />
                        Akses dipisah sesuai peran: kasir, dapur, dan admin
                    </p>
                </form>

                <p className="mt-5 text-center font-display text-lg italic text-ivory/75">Lupa password? Hubungi admin restoran Anda.</p>
            </div>
        </LoginBackdrop>
    );
}
