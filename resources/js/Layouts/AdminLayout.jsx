import { Head, usePage } from '@inertiajs/react';
import { ChefHat, LayoutDashboard, LayoutGrid, MonitorPlay, Receipt, Settings, Target, UtensilsCrossed } from 'lucide-react';

import Navbar from '@/Components/Shared/Navbar';
import Sidebar from '@/Components/Shared/Sidebar';
import { staff } from '@/Data/mock/staff';
import { findActiveHref, flattenNav } from '@/Utils/navigation';

export const ADMIN_NAV = [
    {
        heading: 'Admin',
        items: [
            { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
            { href: '/admin/menu', label: 'Menu & HPP', icon: UtensilsCrossed },
            { href: '/admin/laporan', label: 'Transaksi & Laporan', icon: Receipt },
            { href: '/admin/target', label: 'Target Penjualan', icon: Target },
            { href: '/admin/pengaturan', label: 'Pengaturan Restoran', icon: Settings },
        ],
    },
    {
        heading: 'Operasional',
        items: [
            { href: '/kasir', label: 'Antrean Pesanan', icon: ChefHat },
            { href: '/kasir/meja', label: 'Manajemen Meja', icon: LayoutGrid },
            { href: '/dapur', label: 'Layar Dapur', icon: MonitorPlay },
        ],
    },
];

/**
 * Kerangka halaman admin: sidebar navy (desktop) + navbar (ponsel).
 * Hanya peran admin yang boleh membuka halaman ini (dicek juga di server).
 */
export default function AdminLayout({ title, children }) {
    const { url, props } = usePage();
    const user = props.auth?.user ?? staff.admin;
    const activeHref = findActiveHref(url, ADMIN_NAV);

    return (
        <div className="min-h-dvh bg-canvas lg:pl-64">
            <Head title={title} />
            <Sidebar portal="Portal Admin" sections={ADMIN_NAV} activeHref={activeHref} user={user} />
            <Navbar portal="Portal Admin" items={flattenNav(ADMIN_NAV)} activeHref={activeHref} />
            <main className="mx-auto w-full max-w-[1400px] px-4 pb-28 pt-5 md:px-8 md:pt-8 lg:pb-10">{children}</main>
        </div>
    );
}
