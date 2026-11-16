<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\MenuItem;
use App\Services\ReportingService;
use App\Support\MenuPresenter;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Modul J — Analisis Menu.
 * Route: GET /admin/analisis-menu
 */
class MenuAnalyticsController extends Controller
{
    public function __construct(private readonly ReportingService $reporting) {}

    public function index(): Response
    {
        return Inertia::render('Admin/MenuAnalytics', [
            'analytics' => $this->reporting->menuAnalytics(),
            'menus' => MenuPresenter::collection(MenuItem::withTrashed()->get()),
        ]);
    }
}
