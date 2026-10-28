<?php

namespace App\Reports;

use App\Enums\UserRole;
use App\Models\User;
use App\Reports\Financial\IncomeExpensesReport;
use App\Reports\Operational\BookingRegisterReport;
use Illuminate\Support\Collection;

/**
 * Report Registry
 *
 * Central registry of all available reports in the system.
 * Filters reports according to user role and Spatie permissions.
 */
class ReportRegistry
{
    /**
     * Map of registered reports indexed by report key.
     *
     * @var array<string, BaseReport>
     */
    protected array $reports = [];

    public function __construct()
    {
        $this->registerDefaults();
    }

    /**
     * Register initial default reports.
     */
    protected function registerDefaults(): void
    {
        $this->register(new BookingRegisterReport());
        $this->register(new IncomeExpensesReport());
    }

    /**
     * Register a new report instance.
     */
    public function register(BaseReport $report): self
    {
        $this->reports[$report->key()] = $report;

        return $this;
    }

    /**
     * Get all registered reports.
     *
     * @return Collection<string, BaseReport>
     */
    public function all(): Collection
    {
        return collect($this->reports);
    }

    /**
     * Get a registered report by its key slug.
     */
    public function get(string $key): ?BaseReport
    {
        return $this->reports[$key] ?? null;
    }

    /**
     * Determine if a user is authorized to access a given report.
     */
    public function userCanAccess(User $user, BaseReport $report): bool
    {
        if ($user->hasRole(UserRole::SuperAdmin->value)) {
            return true;
        }

        $permission = $report->permission();

        try {
            return $user->can($permission) || $user->hasPermissionTo($permission);
        } catch (\Spatie\Permission\Exceptions\PermissionDoesNotExist) {
            return false;
        }
    }

    /**
     * Retrieve all reports permitted for a specific user.
     *
     * @return Collection<string, BaseReport>
     */
    public function forUser(User $user): Collection
    {
        return $this->all()->filter(fn (BaseReport $report) => $this->userCanAccess($user, $report));
    }

    /**
     * Group permitted reports by category for the hub view.
     *
     * @return array{
     *     financial: array<int, array>,
     *     operational: array<int, array>
     * }
     */
    public function groupedForUser(User $user): array
    {
        $allowed = $this->forUser($user);

        return [
            'financial' => $allowed
                ->filter(fn (BaseReport $r) => $r->category() === 'financial')
                ->map(fn (BaseReport $r) => $r->toDescriptor())
                ->values()
                ->all(),
            'operational' => $allowed
                ->filter(fn (BaseReport $r) => $r->category() === 'operational')
                ->map(fn (BaseReport $r) => $r->toDescriptor())
                ->values()
                ->all(),
        ];
    }
}
