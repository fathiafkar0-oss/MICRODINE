<?php

namespace App\Http\Controllers\Cashier;

use App\Http\Controllers\Controller;
use App\Http\Requests\Cashier\CloseSessionRequest;
use App\Models\DiningTable;
use App\Models\TableSession;
use App\Services\TableSessionService;
use App\Services\UnservedOrdersException;
use App\Support\TablePresenter;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Modul D (sisi kasir) — Grid Manajemen Meja.
 * Route: GET /kasir/meja, POST /kasir/meja/{sessionId}/close
 */
class TableManagementController extends Controller
{
    public function __construct(private readonly TableSessionService $sessions) {}

    public function index(): Response
    {
        $tables = DiningTable::query()->active()->with('activeSession.orders')->orderBy('number')->get();

        return Inertia::render('Cashier/Tables', [
            'tables' => TablePresenter::collection($tables),
            'appUrl' => config('app.url'),
        ]);
    }

    public function closeSession(CloseSessionRequest $request, TableSession $session): RedirectResponse|JsonResponse
    {
        try {
            $this->sessions->close($session, (bool) $request->validated('force', false), $request->user()->id);
        } catch (UnservedOrdersException $e) {
            return response()->json([
                'error' => [
                    'code' => 'UNSERVED_ORDERS_EXIST',
                    'message' => $e->getMessage(),
                    'unserved_count' => $e->unservedCount,
                ],
            ], 409);
        }

        return back()->with('status', 'Sesi meja ditutup. Meja kembali tersedia.');
    }
}
