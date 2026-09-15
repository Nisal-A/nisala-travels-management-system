# Database Architecture Decisions & Open Business Rules

The following document captures the recommended decisions made during the NT-003 Database Design phase, as well as open business questions that require confirmation before final implementation.

## Recommended Design Decisions (Implemented in Plan)

1. **Role & Permission Management (Spatie Permission):**
   - *Decision:* We will use `spatie/laravel-permission` (or a similar table structure) for RBAC instead of a simple string Enum on the `users` table.
   - *Reason:* The requirements specify granular permissions (e.g., `customers.create`, `documents.verify`) and the ability to add new roles later. A database-backed RBAC system is essential for this scalability.

2. **Decoupled User Identity:**
   - *Decision:* The `users` table will strictly handle authentication (email, password, status). Customer-specific data (NIC, Passport, DOB) lives in `customers`, and employee-specific data (Department, joining date) lives in `employees`.
   - *Reason:* A user might start as a customer and later become an employee, or vice versa. Decoupling Auth from Profile data prevents bloated tables and ensures security.

3. **Booking Travelers:**
   - *Decision:* A separate `booking_travelers` table is created. Not every traveler requires a full `customers` profile.
   - *Reason:* Families booking together often only have one primary customer who pays. The children or spouses do not need separate system login accounts or full CRM profiles, just basic identification for ticketing.

4. **Financial Truth:**
   - *Decision:* We will not store a `balance_due` column on the `bookings` table.
   - *Reason:* Storing calculated balances leads to sync issues. The balance is derived dynamically: `Sum(Payments) - Package Price`.

## Open Business Decisions (Require Approval)

> [!CAUTION]
> Please review and provide direction on the following open questions before we begin writing migrations.

1. **Customer Account Creation:**
   - When a booking is created manually by staff for a walk-in client, should a `users` authentication account be automatically generated and emailed to them, or should they only exist as a CRM `customers` record until they explicitly request portal access?
   - *Recommendation:* Create the `customers` record immediately, but only create the `users` account if the client requests Customer Portal access. This keeps the auth table clean.

2. **Inquiry to Customer Conversion:**
   - When an Inquiry is "Converted", does it automatically generate a Booking and a Customer record? 
   - *Recommendation:* Yes, providing a seamless "Convert to Booking" button on the UI that maps Inquiry data to the Customer and Booking tables.

3. **Payment Receipt Generation:**
   - Do payment receipts need to be physically stored as generated PDF files in cloud storage (S3/local disk), or can they be generated dynamically on-the-fly from the `payments` data when a user clicks "Download Receipt"?
   - *Recommendation:* Generate dynamically on-the-fly to save storage space. We only need to store the `receipt_number` in a `payment_receipts` table if sequential, legal receipt numbering is strictly required by accounting.

4. **Document Verification:**
   - If a customer uploads a Passport, does it require manual verification by staff before the booking can proceed to "Ready for Travel"?
   - *Recommendation:* Yes, added a `verification_status` and `verified_by` column to `customer_documents` to enforce this workflow.

5. **Currency Handling:**
   - Does Nisala Travels accept multiple currencies (e.g., LKR and USD), or is the system strictly single-currency?
   - *Recommendation:* Added a `currency` column to both `tour_packages` and `payments` to support multi-currency, as is standard in travel agencies.
