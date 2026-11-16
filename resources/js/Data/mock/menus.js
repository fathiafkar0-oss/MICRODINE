/**
 * DATA CONTOH (mock) — fase frontend.
 * Angka dibuat sama dengan mockup di proposal (BAB II 2.3).
 * Backend cukup mengirim props dengan bentuk yang sama; halaman otomatis memakai props itu.
 */
import nasiGorengKampung from '@images/menu/makanan-3.jpg';

export const categories = ['Makanan', 'Paket Hemat', 'Camilan', 'Minuman'];

/** hpp = Harga Pokok Penjualan per porsi (ditetapkan admin). */
export const menus = [
    { id: 'M-010', name: 'Nasi Goreng Kampung', category: 'Makanan', hpp: 11500, price: 25000, available: true, image: nasiGorengKampung, description: 'Nasi goreng bumbu kampung dengan telur mata sapi dan kerupuk.' },
    { id: 'M-011', name: 'Ayam Bakar Madu', category: 'Makanan', hpp: 14000, price: 28000, available: true, image: null, description: 'Ayam bakar olesan madu, nasi putih, lalapan, dan sambal.' },
    { id: 'M-012', name: 'Mie Goreng Jawa', category: 'Makanan', hpp: 9500, price: 22000, available: true, image: null, description: 'Mie goreng manis gurih dengan sayuran dan suwiran ayam.' },
    { id: 'M-013', name: 'Paket Hemat Ayam', category: 'Paket Hemat', hpp: 13000, price: 25000, available: true, image: null, description: 'Nasi, ayam goreng, tahu, tempe, dan es teh manis.' },
    { id: 'M-014', name: 'Sate Ayam (10 tusuk)', category: 'Makanan', hpp: 15000, price: 30000, available: false, image: null, description: 'Sate ayam bumbu kacang dengan lontong.' },
    { id: 'M-015', name: 'Tahu Crispy', category: 'Camilan', hpp: 4000, price: 12000, available: true, image: null, description: 'Tahu goreng tepung renyah, disajikan dengan saus cabai rawit.' },
    { id: 'M-016', name: 'Es Teh Manis', category: 'Minuman', hpp: 1200, price: 5000, available: true, image: null, description: 'Teh melati dingin dengan gula asli.' },
    { id: 'M-017', name: 'Es Jeruk Peras', category: 'Minuman', hpp: 2800, price: 8000, available: true, image: null, description: 'Jeruk peras segar dengan es batu.' },
];

export const menuById = Object.fromEntries(menus.map((menu) => [menu.id, menu]));
