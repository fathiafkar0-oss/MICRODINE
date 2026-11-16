<?php

namespace Database\Seeders;

use App\Models\RestaurantSetting;
use Illuminate\Database\Seeder;

class RestaurantSettingSeeder extends Seeder
{
    public function run(): void
    {
        RestaurantSetting::updateOrCreate([], [
            'restaurant_name' => 'Resto Nusantara',
            'address' => 'Jl. Tgk. H. M. Daud Beureueh No. 12, Banda Aceh',
            'phone' => '0651-123456',
            'tax_enabled' => true,
            'tax_rate_percent' => 10,
            'qris_expires_minutes' => 15,
        ]);
    }
}
