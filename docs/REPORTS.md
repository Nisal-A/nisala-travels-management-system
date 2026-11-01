# Nisala Travels — Reports & Analytics Documentation

This document describes the reporting and analytics subsystem of the Nisala Travels Management System, detailing report definitions, filtering options, role-based access control, registry extensibility, and exchange rate architecture.

---

## 1. The 9 Reports

The system provides 9 centralized reports organized into **Financial** (4 reports) and **Operational** (5 reports) categories.

```
├── Financial Reports
│   ├── 1. Income & Expenses (income-expenses)
│   ├── 2. Cash & Bank (cash-bank)
│   ├── 3. Outstanding Balances (outstanding-balances)
│   └── 4. Tour Profitability (tour-profitability)
└── Operational Reports
    ├── 5. Booking Register (booking-register)
    ├── 6. Upcoming Tours (upcoming-tours)
    ├── 7. Passenger Count (passenger-count)
    ├── 8. Document Status (document-status)
    └── 9. Inquiry Follow-up (inquiry-followup)
```

---

### Financial Reports

#### 1. Income & Expenses (`income-expenses`)
* **Category:** Financial
* **Permission:** `reports.income-expenses`
* **Definition:** Summarizes agency cash inflows from completed customer payments against outgoing tour package cost lines and processed refunds. Evaluates total revenue, operating expenses, refund disbursements, and net agency margin across currencies with server-side decimal math (`bcmath` / `BigDecimal`).
* **Summary Tiles:** Total Inflows (LKR), Operating Expenses (LKR), Total Refunds Paid (LKR), Net Agency Margin (LKR).
* **Filters:**
  * Date range preset (`today`, `this_week`, `this_month`, `last_month`, `this_quarter`, `this_year`, `custom`)
  * Date from / Date to (`date_from`, `date_to`)
  * Currency filter (`currency`)

#### 2. Cash & Bank (`cash-bank`)
* **Category:** Financial
* **Permission:** `reports.cash-bank`
* **Definition:** Details all financial transactions segregated by payment instrument (Cash, Bank Transfer, Credit/Debit Card, Online Gateway) to assist with daily bank reconciliations and cashier balancing.
* **Summary Tiles:** Total Receipts Collected, Bank Deposits, Cash in Hand, Gateway Transactions.
* **Filters:**
  * Date range preset / Custom date range (`date_from`, `date_to`)
  * Payment method (`payment_method`: Cash, Bank Transfer, Card, Online)
  * Account / Reference number search

#### 3. Outstanding Balances (`outstanding-balances`)
* **Category:** Financial
* **Permission:** `reports.outstanding-balances`
* **Definition:** Receivables aging report tracking unpaid customer installments, total package dues, and grace period breaches against scheduled milestones (`payment_schedules`). Groups arrears into aging buckets: Current, 1–30 days, 31–60 days, 61–90 days, and 90+ days overdue.
* **Summary Tiles:** Total Outstanding (LKR), Overdue Amount (LKR), Bookings with Arrears, Critical Overdue (>60 days).
* **Filters:**
  * Aging bucket (`aging`: Current, 1-30, 31-60, 61-90, 90+)
  * Package filter (`tour_package_id`)
  * Customer search query (`customer_id` / `search`)

#### 4. Tour Profitability (`tour-profitability`)
* **Category:** Financial
* **Permission:** `reports.tour-profitability`
* **Definition:** Compares total booked revenue per tour package departure against aggregated supplier cost lines (flights, accommodation, transportation, local guides, fees) to determine gross profit and gross margin percentage per departure.
* **Summary Tiles:** Total Booked Revenue, Total Incurred Costs, Gross Profit (LKR), Average Profit Margin (%).
* **Filters:**
  * Date range / Tour departure date range (`date_from`, `date_to`)
  * Tour package (`tour_package_id`)
  * Destination (`destination_id`)

---

### Operational Reports

#### 5. Booking Register (`booking-register`)
* **Category:** Operational
* **Permission:** `reports.booking-register`
* **Definition:** Comprehensive master register of all customer reservations. Displays customer details, destination, tour package, booking date, travel date, traveler counts, booking status, total pricing, and balance dues.
* **Summary Tiles:** Total Bookings, Confirmed Bookings, Pending Bookings, Total Value per Currency.
* **Filters:**
  * Booking date range (`date_from`, `date_to`)
  * Travel departure date range (`travel_date_from`, `travel_date_to`)
  * Booking status (`status`: Pending, Confirmed, Completed, Cancelled)
  * Tour package (`tour_package_id`)
  * Destination (`destination_id`)

#### 6. Upcoming Tours (`upcoming-tours`)
* **Category:** Operational
* **Permission:** `reports.upcoming-tours`
* **Definition:** Forward-looking operational schedule of package departures over the next 90 days. Monitors group capacity limits, passenger occupancy, and seats remaining. Flags tours departing within 7 days and tours nearing full capacity (≤ 20% seats remaining).
* **Summary Tiles:** Active Upcoming Tours, Total Seats Available, Total Confirmed Passengers, Critical Departures (≤ 7 days).
* **Filters:**
  * Departure date range (`start_date_from`, `start_date_to`)
  * Destination (`destination_id`)
  * Occupancy filter (`occupancy`: all, nearly_full, available)

#### 7. Passenger Count (`passenger-count`)
* **Category:** Operational
* **Permission:** `reports.passenger-count`
* **Definition:** Operational manifest providing headcounts breakdown (Adults, Children, Infants) per tour departure. Essential for transport sizing, hotel room allocation, and group airline booking submissions.
* **Summary Tiles:** Total Passengers, Adults, Children, Infants, Average Group Size.
* **Filters:**
  * Travel date range (`date_from`, `date_to`)
  * Tour package (`tour_package_id`)
  * Destination (`destination_id`)

#### 8. Document Status (`document-status`)
* **Category:** Operational
* **Permission:** `reports.document-status`
* **Definition:** Tracks verification status and expiry dates of critical travel documents (Passports, Visas, Travel Insurance, IDs) for passengers on upcoming bookings. Highlights expired documents or passports expiring within 6 months of departure.
* **Summary Tiles:** Total Documents, Verified, Pending Verification, Expired / Expiring Soon.
* **Filters:**
  * Document verification status (`verification_status`: Verified, Pending, Rejected)
  * Expiry horizon (`expiry_horizon`: expired, within_30_days, within_6_months)
  * Document type (`document_type_id`: Passport, Visa, Insurance, NIC)

#### 9. Inquiry Follow-up (`inquiry-followup`)
* **Category:** Operational
* **Permission:** `reports.inquiry-followup`
* **Definition:** Sales lead conversion and customer inquiry tracker. Audits inquiry response times, assigned staff follow-ups, lead source channels, and conversion from public inquiry to confirmed booking.
* **Summary Tiles:** Total Leads, Unassigned Leads, Contacted / In Progress, Converted to Booking.
* **Filters:**
  * Inquiry submission date range (`date_from`, `date_to`)
  * Follow-up status (`status`: New, Contacted, Converted, Closed)
  * Assigned staff member (`assigned_to`)
  * Destination of interest (`destination_id`)

---

## 2. Who Can See Them (Role Access Matrix)

Access control is strictly enforced on both backend routes (`ReportController`, `ReportExporter`, `BaseReport`) and frontend navigation (`ReportRegistry`, `AppLayout`, `Reports/Index`).

| Role | Hub (`/reports`) | Operational Reports (5) | Financial Reports (4) | Exports (CSV / Excel / PDF) |
|---|---|---|---|---|
| **Super Admin** (`super_admin`) | 200 OK | 200 OK | 200 OK | 200 OK (All reports) |
| **Manager** (`manager`) | 200 OK | 200 OK | 200 OK | 200 OK (All reports) |
| **Finance** (`finance`) | 200 OK | 403 Forbidden | 200 OK | 200 OK (Financial only) |
| **Staff** (`staff`) | 200 OK | 200 OK | 403 Forbidden | 200 OK (Operational only) |
| **Customer** (`customer`) | 403 Forbidden | 403 Forbidden | 403 Forbidden | 403 Forbidden |
| **Guest** (Unauthenticated) | 302 Redirect (`/login`) | 302 Redirect (`/login`) | 302 Redirect (`/login`) | 302 Redirect (`/login`) |

---

## 3. Performance & Hardening Architecture

### 3.1 Database Indexing Strategy
To avoid full table scans (`type: ALL`) during report aggregation and filtering, targeted composite and single-column indexes are implemented:
* `payments(payment_date, status)` — Optimizes date-bounded financial inflow queries and cashier reports.
* `payment_schedules(due_date)` — Enables fast range scanning for receivables aging and overdue checks.
* `customer_documents(expiry_date, verification_status)` — Accelerates document compliance and expiry horizon filtering.
* `tour_packages(start_date)` — Speeds up upcoming tour departures indexing.
* `refunds(status, paid_on)` — Optimizes refund disbursement lookups for financial margins.
* `package_cost_lines(incurred_on)` — Accelerates tour expense aggregation across reporting intervals.

### 3.2 Summary Tiles Caching
Summary metric tiles are cached to protect database resources during concurrent dashboard viewing:
* **TTL:** 5 minutes (300 seconds).
* **Cache Store:** Existing database cache store (`Cache::store('database')`).
* **Cache Key Formula:** `report_summary:{report_key}:{user_role}:{md5_normalized_filters}`.
* **Row Data Rule:** Row data (`data`) and paginated table queries are **never cached**. Fresh data is queried on every request to prevent operational staleness.

---

## 4. How to Add a New Report to the Registry

The reporting system is built on a modular registry pattern:

### Step 1: Create Report Class
Create a new report class in `app/Reports/Financial/` or `app/Reports/Operational/` extending `App\Reports\BaseReport`:

```php
namespace App\Reports\Operational;

use App\Reports\BaseReport;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class MyCustomReport extends BaseReport
{
    public function key(): string
    {
        return 'my-custom-report';
    }

    public function title(): string
    {
        return 'My Custom Report';
    }

    public function description(): string
    {
        return 'Operational tracking of custom business metrics.';
    }

    public function category(): string
    {
        return 'operational'; // 'financial' or 'operational'
    }

    public function filters(): array
    {
        return [
            ['name' => 'date_range', 'label' => 'Period', 'type' => 'date_range'],
            ['name' => 'status', 'label' => 'Status', 'type' => 'select', 'options' => [
                ['value' => 'active', 'label' => 'Active'],
                ['value' => 'completed', 'label' => 'Completed'],
            ]],
        ];
    }

    public function columns(): array
    {
        return [
            ['key' => 'id', 'label' => 'ID', 'sortable' => true],
            ['key' => 'name', 'label' => 'Name', 'sortable' => true],
            ['key' => 'created_at', 'label' => 'Date', 'format' => 'date'],
        ];
    }

    public function query(array $filters): LengthAwarePaginator|array
    {
        return $this->queryBuilder($filters)->paginate(15);
    }

    public function summary(array $filters): array
    {
        return [
            ['key' => 'total_count', 'label' => 'Total Records', 'value' => 42, 'format' => 'number'],
        ];
    }

    public function queryBuilder(array $filters)
    {
        // Return Eloquent or Query Builder instance
    }

    public function transformRow(mixed $record): array
    {
        return [
            'id' => $record->id,
            'name' => $record->name,
            'created_at' => $record->created_at?->toDateString(),
        ];
    }
}
```

### Step 2: Register in `ReportRegistry`
Add the report instance in `app/Reports/ReportRegistry.php`:

```php
protected function registerDefaults(): void
{
    // ...
    $this->register(new MyCustomReport());
}
```

### Step 3: Seed Spatie Permission
Add permission `reports.my-custom-report` to `database/seeders/ReportPermissionSeeder.php` under `OPERATIONAL_PERMISSIONS` or `FINANCIAL_PERMISSIONS` and re-seed:

```bash
php artisan db:seed --class=ReportPermissionSeeder
```

The report will automatically appear on the Reports Hub (`/reports`), render in `Show.tsx`, and support CSV/Excel/PDF exports without requiring new controller methods or frontend routes.

---

## 5. How Exchange Rates Work

Nisala Travels operates multi-currency bookings (LKR, USD, EUR, GBP) while maintaining accounts in Sri Lankan Rupees (LKR).

* **Base Currency:** LKR (`rate_to_lkr = 1.000000`).
* **Storage:** Rates are stored in the `exchange_rates` database table (`currency`, `rate_to_lkr`, `fetched_at`, `source`).
* **Conversion Precision:** Calculations use the `brick/math` `BigDecimal` library with `RoundingMode::HALF_UP` to 2 decimal places, avoiding IEEE-754 floating-point inaccuracies.
* **Point-in-Time Historical Conversion:** When evaluating payments or refunds from past dates, `ExchangeRateService::convertToLkr($amount, $currency, $timestamp)` queries the rate effective at or immediately preceding that transaction timestamp (`fetched_at <= $timestamp`).
* **Automated Refresh:** The `rates:refresh` command fetches the latest rates twice daily via the scheduler (06:00 and 14:00 Asia/Colombo). If network requests fail, existing stored rates are preserved with a warning log.

