/**
 * DATA CONTOH (mock) — fase frontend.
 * Angka dibuat sama dengan mockup di proposal (BAB II 2.3).
 * Backend cukup mengirim props dengan bentuk yang sama; halaman otomatis memakai props itu.
 */
import nasiGorengKampung from '@images/menu/makanan-3.jpg';
import kebabAyam from '@images/menu/kebab-ayam.jpg';
import pancakeStroberi from '@images/menu/pancake-stroberi-pisang.jpg';
import croissantAlmond from '@images/menu/croissant-cokelat-almond.jpg';
import crepesLumer from '@images/menu/crepes-cokelat-lumer.jpg';
import churros from '@images/menu/churros-saus-cokelat.jpg';
import crepesStroberi from '@images/menu/crepes-stroberi-pisang.jpg';
import matchaPanas from '@images/menu/matcha-latte-panas.jpg';
import esMatcha from '@images/menu/es-matcha-latte.jpg';
import esKopiKaramel from '@images/menu/es-kopi-karamel.jpg';
import strawberryMint from '@images/menu/strawberry-mint-soda.jpg';
import lavenderSoda from '@images/menu/lavender-lemon-soda.jpg';
import blueOcean from '@images/menu/blue-ocean-soda.jpg';
import esCampur from '@images/menu/es-campur-pink.jpg';
import mangoSmoothie from '@images/menu/mango-smoothie.jpg';
import mangoFloat from '@images/menu/mango-cream-float.jpg';
import taroShake from '@images/menu/taro-blueberry-shake.jpg';
import oreoShake from '@images/menu/oreo-chocolate-shake.jpg';
import brownieShake from '@images/menu/chocolate-brownie-shake.jpg';
import mieGorengJawa from '@images/menu/mie-goreng-jawa.jpg';
import paketHematAyam from '@images/menu/paket-hemat-ayam.jpg';
import sateAyam from '@images/menu/sate-ayam.jpg';
import tahuCrispy from '@images/menu/tahu-crispy.jpg';
import esTehManis from '@images/menu/es-teh-manis.jpg';
import esJerukPeras from '@images/menu/es-jeruk-peras.jpg';
import kopiArabika from '@images/menu/kopi-hitam-arabika.jpg';
import pangsitKuah from '@images/menu/pangsit-kuah.jpg';
import lumpiaGoreng from '@images/menu/lumpia-goreng.jpg';
import steakLadaHitam from '@images/menu/steak-lada-hitam.jpg';
import pangsitChiliOil from '@images/menu/pangsit-chili-oil.jpg';
import dimsumSiomay from '@images/menu/dimsum-siomay.jpg';
import cumiGoreng from '@images/menu/cumi-goreng-tepung.jpg';
import tempeMendoan from '@images/menu/tempe-mendoan.jpg';
import baksoKuah from '@images/menu/bakso-kuah.jpg';
import sotoAyam from '@images/menu/soto-ayam.jpg';
import burgerKeju from '@images/menu/burger-daging-keju.jpg';
import katsuCurry from '@images/menu/chicken-katsu-curry.jpg';

export const categories = ['Makanan', 'Paket Hemat', 'Camilan', 'Dessert', 'Minuman', 'Smoothie & Shake'];

/** hpp = Harga Pokok Penjualan per porsi (ditetapkan admin). */
export const menus = [
    { id: 'M-010', name: 'Nasi Goreng Kampung', category: 'Makanan', hpp: 11500, price: 25000, available: true, image: nasiGorengKampung, description: 'Nasi goreng bumbu kampung dengan telur mata sapi dan kerupuk.' },
    { id: 'M-011', name: 'Ayam Bakar Madu', category: 'Makanan', hpp: 14000, price: 28000, available: true, image: null, description: 'Ayam bakar olesan madu, nasi putih, lalapan, dan sambal.' },
    { id: 'M-012', name: 'Mie Goreng Jawa', category: 'Makanan', hpp: 9500, price: 22000, available: true, image: mieGorengJawa, description: 'Mie goreng manis gurih dengan sayuran dan suwiran ayam.' },
    { id: 'M-013', name: 'Paket Hemat Ayam', category: 'Paket Hemat', hpp: 13000, price: 25000, available: true, image: paketHematAyam, description: 'Nasi, ayam goreng, tahu, tempe, dan es teh manis.' },
    { id: 'M-014', name: 'Sate Ayam (10 tusuk)', category: 'Makanan', hpp: 15000, price: 30000, available: false, image: sateAyam, description: 'Sate ayam bumbu kacang dengan lontong.' },
    { id: 'M-015', name: 'Tahu Crispy', category: 'Camilan', hpp: 4000, price: 12000, available: true, image: tahuCrispy, description: 'Tahu goreng tepung renyah, disajikan dengan saus cabai rawit.' },
    { id: 'M-016', name: 'Es Teh Manis', category: 'Minuman', hpp: 1200, price: 5000, available: true, image: esTehManis, description: 'Teh melati dingin dengan gula asli.' },
    { id: 'M-017', name: 'Es Jeruk Peras', category: 'Minuman', hpp: 2800, price: 8000, available: true, image: esJerukPeras, description: 'Jeruk peras segar dengan es batu.' },
    // Menu baru dengan foto (aset di resources/images/menu)
    { id: 'M-018', name: 'Kebab Ayam Pedas', category: 'Makanan', hpp: 9500, price: 22000, available: true, image: kebabAyam, description: 'Tortila panggang isi ayam bumbu pedas, selada, bawang, dan saus mayo.' },
    { id: 'M-019', name: 'Pancake Stroberi Pisang', category: 'Dessert', hpp: 10000, price: 25000, available: true, image: pancakeStroberi, description: 'Pancake lembut bertumpuk dengan stroberi, pisang, dan saus cokelat.' },
    { id: 'M-020', name: 'Croissant Cokelat Almond', category: 'Dessert', hpp: 9000, price: 22000, available: true, image: croissantAlmond, description: 'Croissant renyah berlapis saus cokelat dan taburan almond panggang.' },
    { id: 'M-021', name: 'Crepes Cokelat Lumer', category: 'Dessert', hpp: 7500, price: 20000, available: true, image: crepesLumer, description: 'Crepes gulung isi cokelat lumer dengan siraman cokelat dan gula halus.' },
    { id: 'M-022', name: 'Churros Saus Cokelat', category: 'Camilan', hpp: 6500, price: 18000, available: true, image: churros, description: 'Churros renyah bertabur gula kayu manis, dicocol saus cokelat hangat.' },
    { id: 'M-023', name: 'Crepes Stroberi Pisang', category: 'Dessert', hpp: 9500, price: 24000, available: true, image: crepesStroberi, description: 'Crepes isi cokelat dengan stroberi, pisang, dan saus vanila.' },
    { id: 'M-024', name: 'Matcha Latte Panas', category: 'Minuman', hpp: 8000, price: 22000, available: true, image: matchaPanas, description: 'Matcha Jepang dengan susu hangat dan latte art.' },
    { id: 'M-025', name: 'Es Matcha Latte', category: 'Minuman', hpp: 8500, price: 24000, available: true, image: esMatcha, description: 'Matcha dingin berlapis susu segar dan es batu.' },
    { id: 'M-026', name: 'Es Kopi Karamel', category: 'Minuman', hpp: 8000, price: 22000, available: true, image: esKopiKaramel, description: 'Kopi susu dingin dengan krim, saus karamel, dan kacang.' },
    { id: 'M-027', name: 'Strawberry Mint Soda', category: 'Minuman', hpp: 6000, price: 18000, available: true, image: strawberryMint, description: 'Soda segar dengan stroberi, jeruk nipis, dan daun mint.' },
    { id: 'M-028', name: 'Lavender Lemon Soda', category: 'Minuman', hpp: 6000, price: 18000, available: true, image: lavenderSoda, description: 'Soda ungu bunga telang dan lavender dengan irisan lemon.' },
    { id: 'M-029', name: 'Blue Ocean Soda', category: 'Minuman', hpp: 5500, price: 17000, available: true, image: blueOcean, description: 'Soda biru blueberry dengan lemon dan daun mint.' },
    { id: 'M-030', name: 'Es Campur Pink', category: 'Minuman', hpp: 6000, price: 15000, available: true, image: esCampur, description: 'Susu merah muda dengan selasih, jeli, dan agar-agar warna-warni.' },
    { id: 'M-031', name: 'Mango Smoothie', category: 'Smoothie & Shake', hpp: 9000, price: 22000, available: true, image: mangoSmoothie, description: 'Mangga segar diblender dengan susu, krim, dan potongan mangga.' },
    { id: 'M-032', name: 'Mango Cream Float', category: 'Smoothie & Shake', hpp: 9500, price: 24000, available: true, image: mangoFloat, description: 'Es mangga berlapis krim kocok dan saus mangga.' },
    { id: 'M-033', name: 'Taro Blueberry Shake', category: 'Smoothie & Shake', hpp: 9000, price: 23000, available: true, image: taroShake, description: 'Shake taro dengan selai blueberry dan buah blueberry segar.' },
    { id: 'M-034', name: 'Oreo Chocolate Shake', category: 'Smoothie & Shake', hpp: 10000, price: 25000, available: true, image: oreoShake, description: 'Shake cokelat dengan krim, meses, dan biskuit Oreo.' },
    { id: 'M-035', name: 'Chocolate Brownie Shake', category: 'Smoothie & Shake', hpp: 11000, price: 27000, available: true, image: brownieShake, description: 'Shake cokelat pekat dengan krim dan potongan brownies.' },
    { id: 'M-036', name: 'Kopi Hitam Arabika', category: 'Minuman', hpp: 5000, price: 18000, available: true, image: kopiArabika, description: 'Kopi arabika Gayo diseduh manual, tanpa gula.' },
    { id: 'M-037', name: 'Pangsit Kuah', category: 'Makanan', hpp: 8000, price: 20000, available: true, image: pangsitKuah, description: 'Pangsit isi ayam udang dalam kuah kaldu bening dan daun ketumbar.' },
    { id: 'M-038', name: 'Lumpia Goreng', category: 'Camilan', hpp: 5500, price: 15000, available: true, image: lumpiaGoreng, description: 'Lumpia renyah isi sayur dan ayam, disajikan dengan saus sambal manis.' },
    { id: 'M-039', name: 'Steak Daging Lada Hitam', category: 'Makanan', hpp: 26000, price: 55000, available: true, image: steakLadaHitam, description: 'Irisan steak sapi saus lada hitam dengan kentang goreng dan salad.' },
    { id: 'M-040', name: 'Pangsit Chili Oil', category: 'Camilan', hpp: 7500, price: 20000, available: true, image: pangsitChiliOil, description: 'Pangsit rebus isi ayam dengan minyak cabai, wijen, dan daun bawang.' },
    { id: 'M-041', name: 'Dimsum Siomay', category: 'Camilan', hpp: 7000, price: 18000, available: true, image: dimsumSiomay, description: 'Siomay ayam udang kukus dengan taburan wortel dan saus sambal.' },
    { id: 'M-042', name: 'Cumi Goreng Tepung', category: 'Camilan', hpp: 11000, price: 25000, available: true, image: cumiGoreng, description: 'Cumi goreng tepung renyah dengan sambal dan selada.' },
    { id: 'M-043', name: 'Tempe Mendoan', category: 'Camilan', hpp: 4000, price: 12000, available: true, image: tempeMendoan, description: 'Tempe tipis berbalut tepung bumbu, disajikan dengan kecap cabai rawit.' },
    { id: 'M-044', name: 'Bakso Kuah', category: 'Makanan', hpp: 8500, price: 20000, available: true, image: baksoKuah, description: 'Bakso sapi dengan mi kuning, bihun, sawi, dan kuah kaldu gurih.' },
    { id: 'M-045', name: 'Soto Ayam', category: 'Makanan', hpp: 8000, price: 20000, available: true, image: sotoAyam, description: 'Soto kuah kuning dengan suwiran ayam, telur, tauge, dan bawang goreng.' },
    { id: 'M-046', name: 'Burger Daging Keju', category: 'Makanan', hpp: 13500, price: 30000, available: true, image: burgerKeju, description: 'Burger patty sapi panggang dengan keju, selada, tomat, dan acar.' },
    { id: 'M-047', name: 'Chicken Katsu Curry', category: 'Makanan', hpp: 13500, price: 32000, available: true, image: katsuCurry, description: 'Ayam katsu renyah dengan nasi hangat dan kari Jepang.' },
];

export const menuById = Object.fromEntries(menus.map((menu) => [menu.id, menu]));
