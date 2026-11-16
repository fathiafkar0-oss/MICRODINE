<?php

namespace App\Http\Controllers\Cashier;

use App\Http\Controllers\Controller;
use App\Http\Requests\Cashier\CloseSessionRequest;
use App\Models\DiningTable;
use App\Models\TableSession;
use App\Services\TableSessionService;
use App\Services\UnservedOrdersException;
use App\Support\TablePresenter;
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

    public function closeSession(CloseSessionRequest $request, TableSession $session): RedirectResponse
    {
        try {
            $this->sessions->close($session, (bool) $request->validated('force', false), $request->user()->id);
        } catch (UnservedOrdersException $e) {
            // `withErrors` (bukan JsonResponse 409) agar tetap jadi redirect yang
            // dipahami Inertia's router.post (lihat `useFlashToast` onError untuk
            // toast pesan ini, dan `unservedCount` flash untuk tombol "tutup paksa").
            return back()->withErrors(['session' => $e->getMessage()])->with('unservedCount', $e->unservedCount);
        }

        return back()->with('status', 'Sesi meja ditutup. Meja kembali tersedia.');
    }
}
