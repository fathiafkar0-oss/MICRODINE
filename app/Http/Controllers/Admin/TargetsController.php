<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateSalesTargetRequest;
use App\Services\ReportingService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Modul J — Target Penjualan Bulanan.
 * Route: GET /admin/target?bulan=YYYY-MM, PUT /admin/target
 */
class TargetsController extends Controller
{
    public function __construct(private readonly ReportingService $reporting) {}

    public function index(Request $request): Response
    {
        return Inertia::render('Admin/Targets', [
            'salesTarget' => $this->reporting->salesTarget($request->query('bulan')),
        ]);
    }

    public function update(UpdateSalesTargetRequest $request): RedirectResponse
    {
        $data = $request->validated();

        $this->reporting->setMonthlyTarget($data['month'], $data['monthly_target'], $request->user()->id);

        return back()->with('status', 'Target penjualan disimpan.');
    }
}
