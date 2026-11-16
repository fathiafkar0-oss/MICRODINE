<?php

namespace Database\Factories;

use App\Models\RestaurantSetting;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<RestaurantSetting>
 */
class RestaurantSettingFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'restaurant_name' => 'Resto Nusantara',
            'address' => fake()->address(),
            'phone' => fake()->phoneNumber(),
            'tax_enabled' => true,
            'tax_rate_percent' => 10,
            'qris_expires_minutes' => 15,
        ];
    }
}
