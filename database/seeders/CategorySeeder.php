<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['name' => 'Makanan', 'slug' => 'makanan', 'display_order' => 1],
            ['name' => 'Paket Hemat', 'slug' => 'paket-hemat', 'display_order' => 2],
            ['name' => 'Camilan', 'slug' => 'camilan', 'display_order' => 3],
            ['name' => 'Minuman', 'slug' => 'minuman', 'display_order' => 4],
        ];

        foreach ($categories as $category) {
            Category::updateOrCreate(['slug' => $category['slug']], $category);
        }
    }
}
