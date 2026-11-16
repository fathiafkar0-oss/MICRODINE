<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\MenuItem;
use Illuminate\Database\Seeder;

/**
 * 15 menu demo. Nama & harga mengikuti mockup frontend
 * (resources/js/Data/mock/menus.js) sebagai acuan tampilan.
 */
class MenuItemSeeder extends Seeder
{
    public function run(): void
    {
        $menus = [
            // Makanan
            ['Makanan', 'Nasi Goreng Kampung', 'Nasi goreng bumbu kampung dengan telur mata sapi dan kerupuk.', 25000, 11500, true],
            ['Makanan', 'Ayam Bakar Madu', 'Ayam bakar olesan madu, nasi putih, lalapan, dan sambal.', 28000, 14000, true],
            ['Makanan', 'Mie Goreng Jawa', 'Mie goreng manis gurih dengan sayuran dan suwiran ayam.', 22000, 9500, true],
            ['Makanan', 'Sate Ayam (10 tusuk)', 'Sate ayam bumbu kacang dengan lontong.', 30000, 15000, false],
            ['Makanan', 'Nasi Ayam Geprek', 'Ayam goreng tepung dengan sambal bawang pedas.', 24000, 11000, true],
            // Paket Hemat
            ['Paket Hemat', 'Paket Hemat Ayam', 'Nasi, ayam goreng, tahu, tempe, dan es teh manis.', 25000, 13000, true],
            ['Paket Hemat', 'Paket Hemat Ikan', 'Nasi, ikan goreng, sayur, dan es teh manis.', 27000, 14500, true],
            ['Paket Hemat', 'Paket Hemat Vegetarian', 'Nasi, tahu, tempe, sayur, dan es teh manis.', 20000, 9000, true],
            // Camilan
            ['Camilan', 'Tahu Crispy', 'Tahu goreng tepung renyah, disajikan dengan saus cabai rawit.', 12000, 4000, true],
            ['Camilan', 'Pisang Goreng Keju', 'Pisang goreng dengan topping keju dan susu kental manis.', 15000, 6000, true],
            ['Camilan', 'Kentang Goreng', 'Kentang goreng dengan saus tomat dan mayones.', 16000, 6500, true],
            // Minuman
            ['Minuman', 'Es Teh Manis', 'Teh melati dingin dengan gula asli.', 5000, 1200, true],
            ['Minuman', 'Es Jeruk Peras', 'Jeruk peras segar dengan es batu.', 8000, 2800, true],
            ['Minuman', 'Es Campur', 'Es serut dengan aneka buah, cincau, dan sirup.', 12000, 4500, true],
            ['Minuman', 'Kopi Susu', 'Espresso dengan susu segar dan gula aren.', 18000, 7000, true],
        ];

        $categoryIds = Category::pluck('id', 'name');

        foreach ($menus as [$category, $name, $description, $price, $hpp, $available]) {
            MenuItem::updateOrCreate(
                ['name' => $name],
                [
                    'category_id' => $categoryIds[$category],
                    'description' => $description,
                    'price' => $price,
                    'hpp' => $hpp,
                    'is_available' => $available,
                    'show_in_catalog' => true,
                ],
            );
        }
    }
}
