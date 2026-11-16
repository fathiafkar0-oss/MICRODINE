<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\MenuItem;
use App\Services\ReportingService;
use App\Support\MenuPresenter;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Modul J — Ringkasan Bisnis Admin.
 * Route: GET /admin
 */
class DashboardController extends Controller
{
    public function __construct(private readonly ReportingService $reporting) {}

    public function index(): Response
    {
        // withTrashed: menu yang sudah dihapus tetap boleh muncul di
        // "Menu terlaris hari ini" bila ia pernah terjual pada hari ini.
        $menus = MenuItem::withTrashed()->get();

        return Inertia::render('Admin/Dashboard', [
            'dashboard' => $this->reporting->dashboardSummary(),
            'menus' => MenuPresenter::collection($menus),
        ]);
    }
}
