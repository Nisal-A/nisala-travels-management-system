<?php

namespace App\Reports\Export;

use App\Models\ActivityLog;
use App\Models\AppSetting;
use App\Models\User;
use App\Reports\BaseReport;
use Carbon\Carbon;
use Illuminate\Http\Response;
use Mpdf\Mpdf;
use OpenSpout\Common\Entity\Row;
use OpenSpout\Writer\XLSX\Writer;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ReportExporter
{
    /**
     * Maximum number of rows allowed per export.
     */
    public const ROW_CAP = 20000;

    /**
     * Export the given report in the specified format.
     */
    public function export(BaseReport $report, string $format, array $filters, ?User $user = null): Response|StreamedResponse|BinaryFileResponse
    {
        $normalizedFormat = strtolower($format);
        if ($normalizedFormat === 'xlsx') {
            $normalizedFormat = 'excel';
        }

        if (! in_array($normalizedFormat, ['csv', 'excel', 'pdf'], true)) {
            abort(400, "Unsupported export format '{$format}'. Supported formats are: csv, excel, pdf.");
        }

        // 1. Calculate matching row count
        $query = $report->queryBuilder($filters);
        $totalRows = ! empty($query->groups)
            ? \Illuminate\Support\Facades\DB::query()->fromSub($query, 'sub_count')->count()
            : (clone $query)->count();

        // 2. Enforce 20,000 row cap
        if ($totalRows > self::ROW_CAP) {
            $message = 'The export exceeds the maximum limit of ' . number_format(self::ROW_CAP) . ' rows (' . number_format($totalRows) . ' rows found). Please narrow your filters and try again.';

            return new Response($message, 422, [
                'Content-Type' => 'text/plain; charset=UTF-8',
            ]);
        }

        // 3. Write ActivityLog entry
        ActivityLog::create([
            'log_name' => 'report_export',
            'description' => "Exported report '{$report->title()}' as " . strtoupper($normalizedFormat) . " ({$totalRows} rows)",
            'subject_type' => null,
            'subject_id' => null,
            'causer_type' => $user ? get_class($user) : null,
            'causer_id' => $user?->id,
            'properties' => [
                'user' => $user?->name ?? 'System',
                'user_id' => $user?->id,
                'report' => $report->key(),
                'format' => $normalizedFormat,
                'filters' => $filters,
                'row_count' => $totalRows,
            ],
        ]);

        // 4. Delegate to format-specific handler
        return match ($normalizedFormat) {
            'csv' => $this->exportCsv($report, $filters),
            'excel' => $this->exportExcel($report, $filters),
            'pdf' => $this->exportPdf($report, $filters, $user),
        };
    }

    /**
     * Stream CSV export with UTF-8 BOM.
     */
    public function exportCsv(BaseReport $report, array $filters): StreamedResponse
    {
        $columns = $report->columns();
        $columnKeys = array_column($columns, 'key');
        $columnLabels = array_column($columns, 'label');
        $filename = $report->key() . '-report-' . now()->format('Y-m-d-His') . '.csv';

        $query = $report->queryBuilder($filters);

        $response = new StreamedResponse(function () use ($query, $report, $columnKeys, $columnLabels) {
            $handle = fopen('php://output', 'w');

            // Write UTF-8 Byte Order Mark (BOM) for correct Unicode rendering in Excel
            fwrite($handle, "\xEF\xBB\xBF");

            // Header row
            fputcsv($handle, $columnLabels);

            // Stream rows in chunks
            $query->chunk(500, function ($records) use ($handle, $report, $columnKeys) {
                foreach ($records as $record) {
                    $row = $report->transformRow($record);
                    $line = [];
                    foreach ($columnKeys as $key) {
                        $line[] = $row[$key] ?? '';
                    }
                    fputcsv($handle, $line);
                }
            });

            fclose($handle);
        });

        $response->headers->set('Content-Type', 'text/csv; charset=UTF-8');
        $response->headers->set('Content-Disposition', 'attachment; filename="' . $filename . '"');
        $response->headers->set('Cache-Control', 'no-cache, no-store, must-revalidate');
        $response->headers->set('Pragma', 'no-cache');
        $response->headers->set('Expires', '0');

        return $response;
    }

    /**
     * Low-memory streaming Excel export using OpenSpout.
     */
    public function exportExcel(BaseReport $report, array $filters): BinaryFileResponse
    {
        $columns = $report->columns();
        $columnKeys = array_column($columns, 'key');
        $columnLabels = array_column($columns, 'label');
        $filename = $report->key() . '-report-' . now()->format('Y-m-d-His') . '.xlsx';

        $tempPath = tempnam(sys_get_temp_dir(), 'rpt_') . '.xlsx';

        $writer = new Writer();
        $writer->openToFile($tempPath);

        // Header row
        $writer->addRow(Row::fromValues($columnLabels));

        // Process rows in chunks
        $query = $report->queryBuilder($filters);
        $query->chunk(500, function ($records) use ($writer, $report, $columnKeys) {
            foreach ($records as $record) {
                $row = $report->transformRow($record);
                $line = [];
                foreach ($columnKeys as $key) {
                    $val = $row[$key] ?? '';
                    $line[] = is_numeric($val) && ! str_starts_with((string) $val, '0') && strlen((string) $val) < 12
                        ? (float) $val
                        : (string) $val;
                }
                $writer->addRow(Row::fromValues($line));
            }
        });

        $writer->close();

        return response()->download($tempPath, $filename, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ])->deleteFileAfterSend(true);
    }

    /**
     * PDF export rendered via mPDF with A4 letterhead, filters, generated metadata, and page numbers.
     */
    public function exportPdf(BaseReport $report, array $filters, ?User $user = null): Response
    {
        $company = AppSetting::getCompanyProfile();
        $landscape = $report->isLandscape();
        $orientation = $landscape ? 'L' : 'P';
        $columns = $report->columns();
        $summaryCards = $report->summary($filters);

        $nowColombo = Carbon::now('Asia/Colombo');
        $generatedAt = $nowColombo->format('Y-m-d h:i A');
        $generatedBy = $user?->name ?? 'System';

        // Prepare logo
        $logoHtml = '';
        $logoFile = $this->resolveLogoFile($company['logo_path']);
        if ($logoFile && file_exists($logoFile)) {
            $logoHtml = '<img src="' . htmlspecialchars($logoFile, ENT_QUOTES) . '" style="max-height: 50px; max-width: 200px;" alt="Logo" />';
        }

        // Format active filters string
        $filtersDescription = $this->formatFiltersDescription($report, $filters);

        // Configure mPDF
        $mpdf = new Mpdf([
            'mode' => 'utf-8',
            'format' => 'A4',
            'orientation' => $orientation,
            'margin_left' => 12,
            'margin_right' => 12,
            'margin_top' => 12,
            'margin_bottom' => 16,
            'margin_header' => 6,
            'margin_footer' => 8,
            'tempDir' => storage_path('app'),
        ]);

        // Build HTML
        $html = $this->buildPdfHtml(
            $report,
            $filters,
            $company,
            $logoHtml,
            $filtersDescription,
            $generatedAt,
            $generatedBy,
            $summaryCards,
            $columns
        );

        $mpdf->WriteHTML($html);

        $pdfOutput = $mpdf->Output('', \Mpdf\Output\Destination::STRING_RETURN);
        $filename = $report->key() . '-report-' . now()->format('Y-m-d-His') . '.pdf';

        return new Response($pdfOutput, 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ]);
    }

    /**
     * Resolve the absolute path to the company logo file.
     */
    protected function resolveLogoFile(string $logoPath): ?string
    {
        $candidates = [
            public_path(ltrim(str_replace('public/', '', $logoPath), '/\\')),
            base_path($logoPath),
            public_path('images/nisala-travels-full-logo.png'),
            public_path('images/nisala-travels-logo.png'),
        ];

        foreach ($candidates as $candidate) {
            if (file_exists($candidate)) {
                return $candidate;
            }
        }

        return null;
    }

    /**
     * Human-readable representation of active filters.
     */
    protected function formatFiltersDescription(BaseReport $report, array $filters): string
    {
        $parts = [];

        if (! empty($filters['date_from']) || ! empty($filters['date_to'])) {
            $from = $filters['date_from'] ?? 'Earliest';
            $to = $filters['date_to'] ?? 'Latest';
            $parts[] = "Date: {$from} to {$to}";
        }

        if (! empty($filters['status'])) {
            $parts[] = 'Status: ' . ucfirst((string) $filters['status']);
        }

        if (! empty($filters['search'])) {
            $parts[] = 'Search: "' . htmlspecialchars($filters['search']) . '"';
        }

        foreach ($report->filters() as $def) {
            $name = $def['name'];
            if (in_array($name, ['date_range', 'date_from', 'date_to', 'status', 'search'], true)) {
                continue;
            }
            if (! empty($filters[$name])) {
                $parts[] = "{$def['label']}: {$filters[$name]}";
            }
        }

        return ! empty($parts) ? implode(' | ', $parts) : 'All Records (No active filters)';
    }

    /**
     * Build the full HTML markup for the PDF document.
     */
    protected function buildPdfHtml(
        BaseReport $report,
        array $filters,
        array $company,
        string $logoHtml,
        string $filtersDescription,
        string $generatedAt,
        string $generatedBy,
        array $summaryCards,
        array $columns
    ): string {
        $title = htmlspecialchars($report->title(), ENT_QUOTES, 'UTF-8');
        $companyName = htmlspecialchars($company['company_name'], ENT_QUOTES, 'UTF-8');
        $address = htmlspecialchars($company['address'], ENT_QUOTES, 'UTF-8');
        $phones = htmlspecialchars($company['phones'], ENT_QUOTES, 'UTF-8');
        $website = htmlspecialchars($company['website'], ENT_QUOTES, 'UTF-8');
        $email = htmlspecialchars($company['email'], ENT_QUOTES, 'UTF-8');
        $regNumber = ! empty($company['registration_number']) ? 'Reg: ' . htmlspecialchars($company['registration_number'], ENT_QUOTES, 'UTF-8') : '';

        // Summary Tiles Markup
        $summaryHtml = '';
        if (! empty($summaryCards)) {
            $summaryHtml .= '<div style="margin-bottom: 15px;">';
            $summaryHtml .= '<table style="width: 100%; border-collapse: collapse; margin: 0;"><tr>';
            foreach ($summaryCards as $metric) {
                $mVal = htmlspecialchars((string) $metric['value'], ENT_QUOTES, 'UTF-8');
                if (($metric['format'] ?? '') === 'money') {
                    $mVal = number_format((float) $metric['value'], 2) . ' ' . ($metric['currency'] ?? 'LKR');
                }
                $mLabel = htmlspecialchars($metric['label'], ENT_QUOTES, 'UTF-8');

                $summaryHtml .= '<td style="border: 1px solid #e2e8f0; background-color: #f8fafc; padding: 6px 10px; text-align: center;">';
                $summaryHtml .= '<div style="font-size: 7.5pt; color: #64748b; text-transform: uppercase;">' . $mLabel . '</div>';
                $summaryHtml .= '<div style="font-size: 11pt; font-weight: bold; color: #0f172a; margin-top: 2px;">' . $mVal . '</div>';
                $summaryHtml .= '</td>';
            }
            $summaryHtml .= '</tr></table></div>';
        }

        // Table Header
        $tableHeaderHtml = '<tr>';
        foreach ($columns as $col) {
            $align = $col['align'] ?? (($col['format'] ?? '') === 'money' || ($col['format'] ?? '') === 'number' ? 'right' : 'left');
            $tableHeaderHtml .= '<th style="text-align: ' . $align . ';">' . htmlspecialchars($col['label'], ENT_QUOTES, 'UTF-8') . '</th>';
        }
        $tableHeaderHtml .= '</tr>';

        // Table Rows (stream from query builder)
        $tableRowsHtml = '';
        $query = $report->queryBuilder($filters);
        $rowCount = 0;

        $query->chunk(500, function ($records) use ($report, $columns, &$tableRowsHtml, &$rowCount) {
            foreach ($records as $record) {
                $rowCount++;
                $row = $report->transformRow($record);
                $tableRowsHtml .= '<tr>';
                foreach ($columns as $col) {
                    $key = $col['key'];
                    $align = $col['align'] ?? (($col['format'] ?? '') === 'money' || ($col['format'] ?? '') === 'number' ? 'right' : 'left');
                    $val = $row[$key] ?? '';

                    $display = htmlspecialchars((string) $val, ENT_QUOTES, 'UTF-8');
                    if (($col['format'] ?? '') === 'money' && is_numeric($val)) {
                        $display = number_format((float) $val, 2);
                    }

                    $tableRowsHtml .= '<td style="text-align: ' . $align . ';">' . $display . '</td>';
                }
                $tableRowsHtml .= '</tr>';
            }
        });

        if ($rowCount === 0) {
            $colSpan = count($columns);
            $tableRowsHtml = '<tr><td colspan="' . $colSpan . '" style="text-align: center; color: #94a3b8; padding: 18px;">No matching records found for the selected filters.</td></tr>';
        }

        return <<<HTML
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            font-size: 9pt;
            color: #1e293b;
        }
        .letterhead {
            width: 100%;
            border-bottom: 2px solid #2563eb;
            padding-bottom: 8px;
            margin-bottom: 12px;
        }
        .company-name {
            font-size: 14pt;
            font-weight: bold;
            color: #1e3a8a;
            margin: 0;
        }
        .company-sub {
            font-size: 8pt;
            color: #475569;
            margin-top: 2px;
        }
        .report-title {
            font-size: 13pt;
            font-weight: bold;
            color: #0f172a;
            margin: 0 0 4px 0;
        }
        .report-meta {
            font-size: 8pt;
            color: #64748b;
            margin-bottom: 12px;
            background-color: #f1f5f9;
            padding: 5px 8px;
            border-radius: 4px;
        }
        table.data-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 8.5pt;
        }
        table.data-table th, table.data-table td {
            border: 1px solid #cbd5e1;
            padding: 5px 7px;
        }
        table.data-table th {
            background-color: #f1f5f9;
            font-weight: bold;
            color: #1e293b;
        }
        table.data-table tr:nth-child(even) td {
            background-color: #f8fafc;
        }
    </style>
</head>
<body>
    <!-- HTML Page Footer -->
    <htmlpagefooter name="ReportFooter">
        <table style="width: 100%; border-top: 1px solid #cbd5e1; font-size: 7.5pt; color: #64748b; padding-top: 4px;">
            <tr>
                <td style="text-align: left; border: none; padding: 0;">
                    Generated by: {$generatedBy} at {$generatedAt} (Asia/Colombo)
                </td>
                <td style="text-align: right; border: none; padding: 0;">
                    Page {PAGENO} of {nbpg}
                </td>
            </tr>
        </table>
    </htmlpagefooter>
    <sethtmlpagefooter name="ReportFooter" value="on" />

    <!-- Letterhead -->
    <table class="letterhead">
        <tr>
            <td style="width: 25%; text-align: left; vertical-align: middle; border: none; padding: 0;">
                {$logoHtml}
            </td>
            <td style="width: 75%; text-align: right; vertical-align: middle; border: none; padding: 0;">
                <div class="company-name">{$companyName}</div>
                <div class="company-sub">{$address}</div>
                <div class="company-sub">Tel: {$phones} | Web: {$website} | Email: {$email}</div>
                {$regNumber}
            </td>
        </tr>
    </table>

    <!-- Report Title & Metadata -->
    <div class="report-title">{$title}</div>
    <div class="report-meta">
        <strong>Filters:</strong> {$filtersDescription}
    </div>

    <!-- Summary Metrics -->
    {$summaryHtml}

    <!-- Data Table -->
    <table class="data-table">
        <thead>
            {$tableHeaderHtml}
        </thead>
        <tbody>
            {$tableRowsHtml}
        </tbody>
    </table>
</body>
</html>
HTML;
    }
}
