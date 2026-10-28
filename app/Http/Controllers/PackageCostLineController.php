<?php

namespace App\Http\Controllers;

use App\Enums\Currency;
use App\Enums\SupplierType;
use App\Models\PackageCostLine;
use App\Models\TourPackage;
use App\Services\Currency\ExchangeRateService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;

class PackageCostLineController extends Controller
{
    public function index(Request $request)
    {
        Gate::authorize('viewAny', PackageCostLine::class);

        $query = PackageCostLine::with(['tourPackage:id,package_name', 'supplier:id,name,supplier_code'])
            ->filterAndSort($request->all());

        return response()->json($query->paginate(20));
    }

    public function forTour(TourPackage $tour)
    {
        Gate::authorize('viewAny', PackageCostLine::class);

        $costLines = $tour->costLines()->with('supplier')->orderBy('incurred_on', 'desc')->get();

        return response()->json($costLines);
    }

    public function store(Request $request)
    {
        Gate::authorize('create', PackageCostLine::class);

        $validated = $request->validate([
            'tour_package_id' => ['required', 'exists:tour_packages,id'],
            'supplier_id' => ['nullable', 'exists:suppliers,id'],
            'category' => ['required', Rule::enum(SupplierType::class)],
            'description' => ['required', 'string', 'max:255'],
            'amount' => ['required', 'numeric', 'min:0'],
            'currency' => ['nullable', 'string', 'max:10'],
            'incurred_on' => ['required', 'date'],
            'paid_on' => ['nullable', 'date'],
            'notes' => ['nullable', 'string'],
        ]);

        $currencyCode = $validated['currency'] ?? 'LKR';
        $currencyEnum = Currency::tryFrom($currencyCode) ?? Currency::LKR;

        $exchangeService = app(ExchangeRateService::class);
        $rate = $exchangeService->latest($currencyEnum);
        $amountLkr = $exchangeService->convertToLkr((string) $validated['amount'], $currencyEnum);

        $costLine = PackageCostLine::create([
            ...$validated,
            'currency' => $currencyCode,
            'exchange_rate_to_lkr' => (string) $rate,
            'amount_lkr' => (string) $amountLkr,
        ]);

        if ($request->wantsJson()) {
            return response()->json($costLine->load('supplier'), 201);
        }

        return back()->with('success', 'Cost line added successfully.');
    }

    public function update(Request $request, PackageCostLine $packageCostLine)
    {
        Gate::authorize('update', $packageCostLine);

        $validated = $request->validate([
            'supplier_id' => ['nullable', 'exists:suppliers,id'],
            'category' => ['required', Rule::enum(SupplierType::class)],
            'description' => ['required', 'string', 'max:255'],
            'amount' => ['required', 'numeric', 'min:0'],
            'currency' => ['nullable', 'string', 'max:10'],
            'incurred_on' => ['required', 'date'],
            'paid_on' => ['nullable', 'date'],
            'notes' => ['nullable', 'string'],
        ]);

        $currencyCode = $validated['currency'] ?? $packageCostLine->currency;
        $currencyEnum = Currency::tryFrom($currencyCode) ?? Currency::LKR;

        $exchangeService = app(ExchangeRateService::class);
        $rate = $exchangeService->latest($currencyEnum);
        $amountLkr = $exchangeService->convertToLkr((string) $validated['amount'], $currencyEnum);

        $packageCostLine->update([
            ...$validated,
            'currency' => $currencyCode,
            'exchange_rate_to_lkr' => (string) $rate,
            'amount_lkr' => (string) $amountLkr,
        ]);

        if ($request->wantsJson()) {
            return response()->json($packageCostLine->load('supplier'));
        }

        return back()->with('success', 'Cost line updated successfully.');
    }

    public function destroy(Request $request, PackageCostLine $packageCostLine)
    {
        Gate::authorize('delete', $packageCostLine);

        $packageCostLine->delete();

        if ($request->wantsJson()) {
            return response()->json(['message' => 'Cost line deleted successfully.']);
        }

        return back()->with('success', 'Cost line removed successfully.');
    }
}
