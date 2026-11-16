<?php

namespace Database\Seeders;

use App\Models\DiningTable;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

/**
 * 12 meja fisik: 8 di Area Dalam, 4 di Teras.
 */
class DiningTableSeeder extends Seeder
{
    public function run(): void
    {
        $tables = [
            ['01', 4, 'Area Dalam'],
            ['02', 4, 'Area Dalam'],
            ['03', 2, 'Area Dalam'],
            ['04', 4, 'Area Dalam'],
            ['05', 4, 'Area Dalam'],
            ['06', 2, 'Area Dalam'],
            ['07', 4, 'Area Dalam'],
            ['08', 4, 'Area Dalam'],
            ['09', 2, 'Teras'],
            ['10', 4, 'Teras'],
            ['11', 4, 'Teras'],
            ['12', 2, 'Teras'],
        ];

        foreach ($tables as [$number, $capacity, $area]) {
            DiningTable::updateOrCreate(
                ['number' => $number],
                [
                    'capacity' => $capacity,
                    'area' => $area,
                    'qr_token' => Str::random(32),
                    'barcode_code' => 'MJ-'.$number,
                    'is_active' => true,
                ],
            );
        }
    }
}
