<?php

namespace App\Http\Controllers;

use App\Reports\ReportRegistry;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ReportController extends Controller
{
    /**
     * Reports Hub — display cards for all reports the authenticated user may view.
     */
    public function index(Request $request, ReportRegistry $registry): Response
    {
        $user = $request->user();

        $grouped = $registry->groupedForUser($user);
        $permittedReports = $registry->forUser($user)
            ->map(fn ($r) => $r->toDescriptor())
            ->values()
            ->all();

        return Inertia::render('Reports/Index', [
            'reports' => $permittedReports,
            'grouped' => $grouped,
        ]);
    }

    /**
     * Report View — generic page driven by report definition.
     */
    public function show(Request $request, string $report, ReportRegistry $registry): Response
    {
        $reportInstance = $registry->get($report);

        if (! $reportInstance) {
            abort(404, 'Report not found.');
        }

        if (! $registry->userCanAccess($request->user(), $reportInstance)) {
            abort(403, 'Unauthorized to access this report.');
        }

        $filters = $request->query();
        $tableData = $reportInstance->getData($filters);
        $summary = $reportInstance->summary($filters);

        return Inertia::render('Reports/Show', [
            'report' => $reportInstance->toDescriptor(),
            'initialData' => [
                ...$tableData,
                'summary' => $summary,
            ],
            'filters' => $filters,
        ]);
    }

    /**
     * Report Data Endpoint — returns JSON payload for DataTable and summary tiles.
     */
    public function data(Request $request, string $report, ReportRegistry $registry): JsonResponse
    {
        $reportInstance = $registry->get($report);

        if (! $reportInstance) {
            abort(404, 'Report not found.');
        }

        if (! $registry->userCanAccess($request->user(), $reportInstance)) {
            abort(403, 'Unauthorized to access this report.');
        }

        $filters = $request->query();
        $tableData = $reportInstance->getData($filters);
        $summary = $reportInstance->summary($filters);

        return response()->json([
            ...$tableData,
            'summary' => $summary,
        ]);
    }

    /**
     * Export Report Endpoint — streams CSV/Excel or renders PDF with A4 letterhead, row cap, and activity logging.
     */
    public function export(Request $request, string $report, string $format, ReportRegistry $registry, \App\Reports\Export\ReportExporter $exporter): mixed
    {
        $reportInstance = $registry->get($report);

        if (! $reportInstance) {
            abort(404, 'Report not found.');
        }

        if (! $registry->userCanAccess($request->user(), $reportInstance)) {
            abort(403, 'Unauthorized to access this report.');
        }

        $filters = $request->query();

        return $exporter->export($reportInstance, $format, $filters, $request->user());
    }
}
