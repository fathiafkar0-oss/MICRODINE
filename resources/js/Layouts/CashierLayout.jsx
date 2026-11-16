import { Head, usePage } from '@inertiajs/react';
import { ChefHat, History, LayoutGrid, SquarePlus } from 'lucide-react';

import Navbar from '@/Components/Shared/Navbar';
import Sidebar from '@/Components/Shared/Sidebar';
import { staff } from '@/Data/mock/staff';
import { findActiveHref, flattenNav } from '@/Utils/navigation';

export const CASHIER_NAV = [
    {
        heading: 'Kasir',
        items: [
            { href: '/kasir', label: 'Antrean Pesanan', icon: ChefHat },
            { href: '/kasir/pesanan', label: 'Pesanan Manual', icon: SquarePlus },
            { href: '/kasir/meja', label: 'Manajemen Meja', icon: LayoutGrid },
            { href: '/kasir/histori', label: 'Histori Pesanan', icon: History },
        ],
    },
];

/**
 * Kerangka halaman kasir: sidebar navy (desktop) + navbar (ponsel).
 * Pengguna dari props `auth.user` (diisi backend); fase frontend memakai staf contoh.
 */
export default function CashierLayout({ title, children }) {
    const { url, props } = usePage();
    const user = props.auth?.user ?? staff.kasir;
    const activeHref = findActiveHref(url, CASHIER_NAV);

    return (
        <div className="min-h-dvh bg-canvas lg:pl-64">
            <Head title={title} />
            <Sidebar portal="Portal Kasir" sections={CASHIER_NAV} activeHref={activeHref} user={user} showKitchenShortcut />
            <Navbar portal="Portal Kasir" items={flattenNav(CASHIER_NAV)} activeHref={activeHref} />
            <main className="mx-auto w-full max-w-[1400px] px-4 pb-28 pt-5 md:px-8 md:pt-8 lg:pb-10">{children}</main>
        </div>
    );
}
