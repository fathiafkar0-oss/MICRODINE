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
     * ARCHITECTURE.md Bab 3.2: Tabel 7-11 (orders, order_items, payments,
     * order_status_logs, sales_targets).
     */
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('order_code', 20)->unique();
            $table->string('daily_queue_number', 10);
            $table->foreignId('table_session_id')->constrained('table_sessions');
            $table->string('customer_name', 100);
            $table->string('source', 10);
            $table->string('payment_method', 10);
            $table->string('payment_status', 20)->default('pending');
            $table->string('kitchen_status', 20)->default('queued');
            $table->bigInteger('subtotal');
            $table->bigInteger('tax_amount')->default(0);
            $table->bigInteger('total');
            $table->timestampTz('paid_at')->nullable();
            $table->timestampTz('cancelled_at')->nullable();
            $table->timestampsTz();
        });

        Schema::create('order_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained('orders')->cascadeOnDelete();
            $table->foreignId('menu_item_id')->nullable()->constrained('menu_items')->nullOnDelete();
            $table->string('name_snapshot', 150);
            $table->integer('qty');
            $table->text('notes')->nullable();
            $table->bigInteger('unit_price_snapshot');
            $table->bigInteger('unit_hpp_snapshot');
            $table->bigInteger('subtotal_price');
            $table->bigInteger('subtotal_hpp');
            $table->timestampsTz();
        });

        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained('orders');
            $table->string('provider', 30);
            $table->string('provider_ref', 100)->nullable();
            $table->bigInteger('amount');
            $table->string('status', 20);
            $table->boolean('signature_valid')->default(false);
            $table->jsonb('raw_payload')->nullable();
            $table->string('idempotency_key', 100)->unique();
            $table->timestampTz('expires_at');
            $table->timestampsTz();
        });

        Schema::create('order_status_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained('orders')->cascadeOnDelete();
            $table->string('actor_type', 20);
            $table->foreignId('actor_id')->nullable()->constrained('users');
            $table->string('from_status', 30);
            $table->string('to_status', 30);
            $table->text('notes')->nullable();
            $table->timestampTz('created_at')->nullable();
        });

        Schema::create('sales_targets', function (Blueprint $table) {
            $table->id();
            $table->string('month_year', 7)->unique();
            $table->bigInteger('target_amount');
            $table->jsonb('weekly_targets');
            $table->foreignId('created_by')->constrained('users');
            $table->timestampsTz();
        });

        // Indeks pelaporan finansial: hanya transaksi lunas yang dipindai.
        DB::statement(
            "CREATE INDEX idx_orders_reporting
             ON orders (payment_status, paid_at)
             WHERE payment_status = 'paid'"
        );
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sales_targets');
        Schema::dropIfExists('order_status_logs');
        Schema::dropIfExists('payments');
        Schema::dropIfExists('order_items');
        Schema::dropIfExists('orders');
    }
};
