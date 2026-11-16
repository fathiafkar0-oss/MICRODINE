import { BarChart3, ChefHat, ReceiptText } from 'lucide-react';

import kitchenImage from '@images/resto.jpg';
import cashierImage from '@images/resto2.jpg';
import reportImage from '@images/resto3.jpg';

/**
 * Tiga peran staf di portal. Fase frontend: peran dipilih manual.
 * Backend nanti: server menentukan peran dari akun, tab ini hanya membantu pengguna.
 */
export const STAFF_ROLES = [
    {
        id: 'kasir',
        label: 'Kasir',
        icon: ReceiptText,
        home: '/kasir',
        sample: 'dika.kasir',
        image: cashierImage,
        title: 'Meja kasir',
        caption: 'Terima pesanan, konfirmasi pembayaran tunai, dan atur meja.',
    },
    {
        id: 'dapur',
        label: 'Dapur',
        icon: ChefHat,
        home: '/dapur',
        sample: 'sari.dapur',
        image: kitchenImage,
        title: 'Dapur',
        caption: 'Lihat antrean pesanan yang sudah lunas dan tandai yang selesai.',
    },
    {
        id: 'admin',
        label: 'Admin',
        icon: BarChart3,
        home: '/admin',
        sample: 'rina.admin',
        image: reportImage,
        title: 'Ruang pemilik',
        caption: 'Pantau omzet, HPP, laba kotor, dan target penjualan.',
    },
];
