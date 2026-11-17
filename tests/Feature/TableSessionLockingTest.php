<?php

namespace Tests\Feature;

use App\Enums\TableSessionStatus;
use App\Models\DiningTable;
use App\Models\Order;
use App\Models\TableSession;
use App\Services\TableSessionService;
use App\Services\UnservedOrdersException;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

/**
 * AGENTS.md invarian #4 — Single Active Table Session.
 * ARCHITECTURE.md §9.1: partial unique index PostgreSQL adalah garis
 * pertahanan terakhir; `lockForUpdate()` di TableSessionService mencegah
 * dua pemindaian QR bersamaan membuat dua sesi aktif.
 *
 * Pengujian konkurensi sungguhan (dua koneksi DB paralel) hanya berarti di
 * PostgreSQL — SQLite tidak mendukung row-level locking yang sama. Lihat
 * issue.md Bab 10: test ini `markTestSkipped` bila bukan di atas pgsql.
 */
class TableSessionLockingTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        if (! in_array(DB::connection()->getDriverName(), ['pgsql', 'sqlite'], true)) {
            $this->markTestSkipped('TableSessionLockingTest hanya relevan di atas PostgreSQL / SQLite (partial unique index).');
        }
    }

    public function test_second_scan_joins_existing_active_session_instead_of_creating_a_new_one(): void
    {
        $table = DiningTable::factory()->create();
        $service = app(TableSessionService::class);

        $first = $service->openOrJoin($table);
        $second = $service->openOrJoin($table);

        $this->assertFalse($first['joined']);
        $this->assertTrue($second['joined']);
        $this->assertSame($first['session']->id, $second['session']->id);
        $this->assertSame(1, TableSession::query()->where('dining_table_id', $table->id)->where('status', TableSessionStatus::Active->value)->count());
    }

    public function test_partial_unique_index_rejects_a_second_active_session_inserted_directly(): void
    {
        $table = DiningTable::factory()->create();
        TableSession::query()->create([
            'dining_table_id' => $table->id,
            'status' => TableSessionStatus::Active->value,
            'opened_at' => now(),
        ]);

        $this->expectException(QueryException::class);

        // Melewati service secara sengaja untuk membuktikan constraint
        // database sendiri (bukan hanya application-level lock) yang menolak.
        TableSession::query()->create([
            'dining_table_id' => $table->id,
            'status' => TableSessionStatus::Active->value,
            'opened_at' => now(),
        ]);
    }

    public function test_closing_session_with_unserved_paid_order_requires_force(): void
    {
        $table = DiningTable::factory()->create();
        $service = app(TableSessionService::class);
        $session = $service->openOrJoin($table)['session'];

        Order::factory()->for($session, 'tableSession')->paid()->create();

        $this->expectException(UnservedOrdersException::class);
        $service->close($session, force: false);
    }

    public function test_closing_session_with_force_succeeds_and_frees_the_table(): void
    {
        $table = DiningTable::factory()->create();
        $service = app(TableSessionService::class);
        $session = $service->openOrJoin($table)['session'];

        Order::factory()->for($session, 'tableSession')->paid()->create();

        $closed = $service->close($session, force: true);

        $this->assertSame(TableSessionStatus::Closed, $closed->status);
        $this->assertNull($table->refresh()->activeSession);
    }
}
