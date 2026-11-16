# MICRODINE — Agent Guidelines & Architecture Rules

## 1. Project Overview
MICRODINE is an integrated web-based restaurant management platform for Indonesian micro-enterprises combining Point of Sales (POS) and table QR self-ordering. The platform enforces a pay-first workflow to eliminate fake orders and unpaid dine-and-dash risks. Kitchen and cashier queues are synchronized in real-time using WebSockets without page refreshes. Financial integrity is preserved by recording historical Cost of Goods Sold (HPP) snapshots on every transaction, ensuring accurate profit reporting regardless of future price changes.

Sources of truth:
- `docs/proposal.pdf`: Official specification by SKS Team (Universitas Syiah Kuala, 2026).
- `docs/mockups/`: 9 UI screens (Customer mobile-first, Central Login, Cashier Kanban, Table Grid, Kitchen Display, Admin Analytics, Menu Master, Historical Audit, Target Projection).

## 2. Tech Stack & Target Versions
- **Backend**: Laravel 13.x (PHP 8.3+) — Monolithic Architecture (Single Codebase)
- **Frontend**: React 19+ via Inertia.js v3 (`@inertiajs/react ^3.11.0`, SPA, NO standalone REST API)
- **Styling**: Tailwind CSS v4 (`@tailwindcss/vite`) with semantic `@theme` tokens
- **Database**: PostgreSQL 16+ (Row-Level / Pessimistic Locking)
- **Real-Time Synchronization**: Laravel Reverb + Laravel Echo
- **Payment Gateway**: QRIS digital payment via `PaymentGatewayInterface` (Default Sandbox: Midtrans)

## 3. Directory Structure & Naming Conventions
```
app/
├── Actions/                  # Single-purpose action classes (e.g., CreateOrderAction.php)
├── Services/                 # Domain business services (e.g., OrderService.php, PaymentService.php)
├── Http/Controllers/         # Thin Inertia controllers (e.g., Cashier/OrderController.php)
├── Http/Requests/            # FormRequest validation classes
├── Models/                   # Eloquent models with strict typing & casts
resources/js/
├── Pages/                    # Inertia view pages (Customer/, Cashier/, Kitchen/, Admin/, Auth/, Landing/)
├── Components/
│   ├── UI/                   # Base UI components (Button, Input, Card, Modal, Table, Toggle, StatCard)
│   └── Shared/               # Domain composite widgets (Navbar, Sidebar, CashPaymentModal, SearchBar)
├── Layouts/                  # Role-specific layouts (CustomerLayout, CashierLayout, KitchenLayout, AdminLayout)
├── Hooks/                    # Reusable React hooks (useCart, useCountdown, useCurrency)
├── Utils/                    # Domain utilities (formatters, sound, storage)
└── Data/mock/                # Prototype mock datasets (menus, orders, reports, restaurant, staff, tables)
```
- **Conventions**: Classes & Components in PascalCase; methods, variables, and routes in camelCase/kebab-case; DB tables and columns in snake_case.

## 4. Development & Build Commands
- **Serve Backend**: `php artisan serve`
- **Serve WebSockets**: `php artisan reverb:start`
- **Frontend Dev**: `npm run dev` (Vite)
- **Concurrent Dev**: `composer run dev` (orchestrates server, queue, reverb, and vite concurrently)
- **Testing**: `php artisan test` (Pest / PHPUnit)
- **Code Style / Lint**: `./vendor/bin/pint` (PHP) & `npm run lint` (JS/React)
- **Production Build**: `npm run build`

## 5. Invariant Business Rules (NON-NEGOTIABLE)
1. **Pay-First Enforcement**: An order MUST enter the kitchen queue ONLY after `payment_status = 'paid'`. Pending or unpaid orders are strictly invisible to the kitchen display.
2. **Historical Price & HPP Snapshot**: `order_items` MUST store `unit_price` and `unit_hpp` captured at the exact moment of order creation. Future menu price or HPP modifications MUST NEVER alter past transaction records.
3. **Strict Revenue & Profit Calculation**: Revenue (omzet) and gross profit reports MUST ONLY aggregate transactions with `payment_status = 'paid'`. Pending, failed, or cancelled orders must be strictly excluded.
4. **Single Active Table Session**: One physical table = one active order session. Any subsequent QR scans at the same table automatically attach to the existing active session until the cashier confirms checkout/session closure.
5. **Post-Commit WebSockets Broadcast**: Event broadcasts (e.g., new paid order, food ready) MUST be triggered strictly after payment validation (QRIS webhook or cash confirmation) inside a database transaction commit callback (`DB::afterCommit()`).
6. **Static Admin-Configured HPP**: HPP is maintained as a static monetary figure input manually by Admin per menu item. NO dynamic raw ingredient inventory or recipe deduction logic.
7. **Configurable Regional Tax (PBJT/PB1)**: PBJT/PB1 tax calculation can be toggled on/off with configurable percentage rate set by Admin (default 10%).
8. **Idempotent Webhook & Signature Verification**: Payment gateway webhooks MUST verify cryptographic signatures and enforce idempotency to prevent duplicate transaction recording.

## 6. Roles & Role-Based Access Control (RBAC)
- **Customer (`pelanggan`)**: No login required; authenticated via unique table QR parameter/token.
  - Allowed routes: `/meja/{table}`, `/meja/{table}/keranjang`, `/meja/{table}/checkout`, `/pesanan/{code}`, `/pesanan/{code}/bayar`
- **Cashier (`kasir`)**: Authenticated staff via `/staf/masuk`.
  - Allowed routes: `/kasir`, `/kasir/pesanan` (Kanban), `/kasir/meja` (Table Grid), `/kasir/histori` (Daily History & Receipt Re-print)
- **Kitchen (`dapur`)**: Authenticated kitchen staff.
  - Allowed routes: `/dapur` (Real-time Kitchen Display System)
- **Admin (`admin`)**: Authenticated executive via `/staf/masuk`.
  - Allowed routes: `/admin`, `/admin/menu` (Menu CRUD & Margin), `/admin/laporan` (Reports & Audit), `/admin/target` (Sales Target), `/admin/pengaturan` (Settings & Tax)

## 7. Coding Standards
- **Validation**: All user inputs validated via dedicated `FormRequest` classes.
- **Business Logic**: Encapsulated in `Services/` or `Actions/`, never in controllers.
- **Currency & Money**: Always stored and calculated as integer Rupiah (`int` / `bigint`), never floating-point.
- **Timezone**: Strictly `Asia/Jakarta` (WIB) across backend and database.
- **Language Policy**: UI text, labels, and customer-facing messages in Indonesian (Bahasa Indonesia); source code, variable names, database schemas, and developer comments in English.

## 8. Testing & Quality Assurance
- Test framework: Pest / PHPUnit.
- Every invariant rule in Section 5 MUST have corresponding automated tests (unit or feature).
- Mandatory test suites: `PayFirstOrderTest`, `HppSnapshotTest`, `TableSessionLockingTest`, `WebhookIdempotencyTest`.

## 9. Security Requirements
- Zero secrets in repository. All credentials managed via `.env` with safe templates in `.env.example`.
- All staff routes protected by Laravel auth middleware and role policies.
- Public customer routes (table scan, order submission) MUST be rate-limited (throttled) to prevent abuse.

## 10. Agent Operating Guidelines
- Before coding, read `AGENTS.md`, `PRD.md`, `ARCHITECTURE.md`, `DESIGN.md`, and `PLAN.md`.
- Strictly work on one assigned task from `PLAN.md` per branch.
- Never invent or expand scope beyond the approved PRD.
- Clarify ambiguities with the user; never make speculative assumptions on business logic.

## 11. Git & GitHub Workflow
- **Remote**: `https://github.com/fathiafkar0-oss/MICRODINE.git`, default branch `main`.
- **Branching**: `feat/T-0xx-<short-title>`, `fix/T-0xx-...`, `docs/...` branched from up-to-date `main` (`git pull --rebase origin main`).
- **Commits**: Conventional Commits in English with Task ID (e.g., `feat(T-012): add table session locking`).
- **Pre-Push Quality Gate**: Must pass lint, test, and build before pushing.
- **Pull Requests**: Push branch, open PR with task summary, testing steps, and acceptance criteria. Never merge PR without user approval.
- **Strictly Prohibited**: Direct push to `main` after setup, force push (`--force`) to `main`, committing `.env` or sensitive credentials.
- **Team Collaboration (4 Developers)**: Run `git pull --rebase origin main` before creating new branches; strictly maintain 1 person per functional area to avoid merge conflicts. If a conflict occurs, never overwrite teammate code; pause and seek resolution.
