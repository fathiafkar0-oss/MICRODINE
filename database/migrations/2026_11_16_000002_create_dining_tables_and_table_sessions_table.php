<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * ARCHITECTURE.md Bab 3.2: Tabel 5 (dining_tables) dan 6 (table_sessions).
     */
    public function up(): void
    {
        Schema::create('dining_tables', function (Blueprint $table) {
            $table->id();
            $table->string('number', 10)->unique();
            $table->integer('capacity')->default(4);
            $table->string('area', 50)->default('Area Dalam');
            $table->string('qr_token', 64)->unique();
            $table->string('barcode_code', 32)->unique();
            $table->boolean('is_active')->default(true);
            $table->timestampsTz();
        });

        Schema::create('table_sessions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('dining_table_id')->constrained('dining_tables');
            $table->string('status', 20)->default('active');
            $table->timestampTz('opened_at');
            $table->timestampTz('closed_at')->nullable();
            $table->foreignId('closed_by')->nullable()->constrained('users');
            $table->timestampsTz();
        });

        // Invarian #4: satu meja hanya boleh punya SATU sesi aktif.
        // Partial unique index ini didukung PostgreSQL dan SQLite.
        DB::statement(
            "CREATE UNIQUE INDEX unique_active_table_session
             ON table_sessions (dining_table_id)
             WHERE status = 'active'"
        );
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Index ikut terhapus bersama tabelnya.
        Schema::dropIfExists('table_sessions');
        Schema::dropIfExists('dining_tables');
    }
};
