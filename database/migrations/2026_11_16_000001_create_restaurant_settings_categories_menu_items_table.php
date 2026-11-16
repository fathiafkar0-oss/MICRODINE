<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * ARCHITECTURE.md Bab 3.2: Tabel 2 (restaurant_settings), 3 (categories),
     * dan 4 (menu_items). Semua nilai uang disimpan sebagai integer Rupiah.
     */
    public function up(): void
    {
        // Baris tunggal (singleton) berisi identitas restoran & konfigurasi pajak.
        Schema::create('restaurant_settings', function (Blueprint $table) {
            $table->id();
            $table->string('restaurant_name', 100);
            $table->text('address')->nullable();
            $table->string('phone', 30)->nullable();
            $table->boolean('tax_enabled')->default(true);
            $table->integer('tax_rate_percent')->default(10);
            $table->integer('qris_expires_minutes')->default(15);
            $table->timestampsTz();
        });

        Schema::create('categories', function (Blueprint $table) {
            $table->id();
            $table->string('name', 50)->unique();
            $table->string('slug', 60)->unique();
            $table->integer('display_order')->default(0);
            $table->timestampsTz();
        });

        Schema::create('menu_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->constrained('categories');
            $table->string('name', 150);
            $table->text('description')->nullable();
            $table->bigInteger('price');
            $table->bigInteger('hpp');
            $table->string('image_path', 255)->nullable();
            $table->boolean('is_available')->default(true);
            $table->boolean('show_in_catalog')->default(true);
            $table->timestampsTz();
            $table->softDeletesTz();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('menu_items');
        Schema::dropIfExists('categories');
        Schema::dropIfExists('restaurant_settings');
    }
};
