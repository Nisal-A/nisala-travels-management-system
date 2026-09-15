# Database Index Strategy

To ensure high performance for the Nisala Travels Management System, indexes must be carefully applied to columns that are frequently used in `WHERE` clauses, `JOIN` conditions, and `ORDER BY` operations.

## Primary Keys & Foreign Keys
By default, Laravel and MySQL will automatically index:
1. All `id` primary key columns.
2. All foreign key columns (e.g., `user_id`, `customer_id`, `booking_id`) when defined using `$table->foreignId()`.

## Custom Indexes by Table

### 1. `users`
- `email` (Unique Index): Used for authentication login.
- `status` (Index): Frequently filtered to find active vs inactive users.

### 2. `customers`
- `customer_id` (Unique Index): Custom formatted ID (e.g., CUS-1001) for search.
- `nic` (Unique Index): National Identity Card search.
- `passport_number` (Unique Index): Passport search for ticketing.
- `phone` / `email` (Indexes): Highly queried for CRM lookups.

### 3. `bookings`
- `booking_reference` (Unique Index): E.g., BKG-2024-001, used for tracking.
- `travel_date` (Index): Queried to find upcoming departures.
- `booking_status` (Index): Filtering dashboard for "Pending", "Confirmed", etc.
- `payment_status` (Index): Financial reporting lookups.

### 4. `inquiries`
- `status` (Index): Filtering new vs converted leads.
- `created_at` (Index): Sorting newest inquiries on the dashboard.

### 5. `payments`
- `reference_number` (Index): Bank/Card reference tracking.
- `payment_date` (Index): Financial reporting by date range.

### 6. `customer_documents`
- `verification_status` (Index): Finding documents that require staff review.
- `expiry_date` (Index): Cron jobs scanning for expiring passports/visas.

## Over-Indexing Prevention
We will **avoid** indexing:
- Long text fields (e.g., `notes`, `address`, `description`).
- Low cardinality fields unless heavily filtered (e.g., `gender`).
- JSON payload columns (like `data` in `notifications`).
