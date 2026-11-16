<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreTableRequest;
use App\Http\Requests\Admin\UpdateTableRequest;
use App\Models\DiningTable;
use App\Models\RestaurantSetting;
use App\Support\CodeGenerator;
use App\Support\RestaurantPresenter;
use App\Support\TablePresenter;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Modul D (sisi admin) — Kelola Meja & QR.
 * Route: GET/POST/PUT /admin/meja, PATCH /admin/meja/{id}/status, POST /admin/meja/{id}/qr-ulang
 */
class TableManagementController extends Controller
{
    public function index(): Response
    {
        $tables = DiningTable::query()->with('activeSession.orders')->orderBy('number')->get();

        return Inertia::render('Admin/Tables', [
            'tables' => TablePresenter::collection($tables),
            'areas' => DiningTable::query()->select('area')->distinct()->orderBy('area')->pluck('area'),
            'restaurant' => RestaurantPresenter::toArray(RestaurantSetting::current()),
            'appUrl' => config('app.url'),
        ]);
    }

    public function store(StoreTableRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $number = str_pad($data['number'], 2, '0', STR_PAD_LEFT);

        DiningTable::query()->create([
            'number' => $number,
            'capacity' => $data['seats'],
            'area' => $data['area'],
            'qr_token' => CodeGenerator::qrToken(),
            'barcode_code' => CodeGenerator::barcodeCode($number),
            'is_active' => true,
        ]);

        return back()->with('status', "Meja {$number} ditambahkan.");
    }

    public function update(UpdateTableRequest $request, DiningTable $table): RedirectResponse
    {
        $data = $request->validated();

        $table->update([
            'capacity' => $data['seats'],
            'area' => $data['area'],
            'is_active' => $data['is_active'] ?? $table->is_active,
        ]);

        return back()->with('status', "Meja {$table->number} diperbarui.");
    }

    /**
     * Toggle aktif/nonaktif (tidak pernah dihapus, agar histori & laporan tetap utuh).
     */
    public function toggleStatus(DiningTable $table): RedirectResponse
    {
        $table->update(['is_active' => ! $table->is_active]);

        return back();
    }

    /**
     * Terbitkan ulang token QR (misal karena stiker lama bocor/dicuri).
     */
    public function regenerateQr(DiningTable $table): RedirectResponse
    {
        $table->update(['qr_token' => CodeGenerator::qrToken()]);

        return back()->with('status', "QR meja {$table->number} diperbarui.");
    }
}
