# MMasterPlan: Remaining Phases & Frontend Architecture

This document provides the detailed, actionable blueprint for completing the remaining modules of the Nisala Travels Management System. A heavy emphasis is placed on the UI/UX architecture (React, Inertia, Tailwind CSS, shadcn/ui) to ensure a dynamic, premium, and seamless experience for both staff and customers.

---

## Phase 9: Customer Portal (Self-Service UI)
**Objective:** Provide a secure, read-only interface where authenticated customers can manage their own data.
* **Backend Requirements:**
  * Strict IDOR protection mapping `auth()->user()->customer_id` across all endpoints.
  * Specialized lightweight APIs for fetching personal bookings and payment histories.
* **Frontend/UI Architecture:**
  * **Layout:** `CustomerPortalLayout.tsx` — distinct from the Office Admin Shell, featuring a cleaner, branded, and minimal aesthetic.
  * **Dashboard (`portal/Dashboard.tsx`):** A summary view highlighting upcoming trips, outstanding balances, and missing documents.
  * **My Bookings (`portal/Bookings.tsx`):** Card-based grid (rather than dense tables) showing trip details, downloadable itineraries, and traveler lists.
  * **My Documents (`portal/Documents.tsx`):** A secure dropzone UI for uploading passports and visas, with clear status indicators (Pending Verification, Verified, Rejected).
  * **My Payments (`portal/Payments.tsx`):** A list of transaction histories with a one-click "Download Receipt" feature.

## Phase 10: Public Website & Inquiry System
**Objective:** Replace the empty application root `/` with a premium, responsive marketing landing page that funnels leads into the backend.
* **Backend Requirements:**
  * `InquiryController` to receive form submissions and flag them for office staff.
  * Read-only public API routes for fetching active `TourPackages`.
* **Frontend/UI Architecture:**
  * **Layout:** `PublicLayout.tsx` with a sticky transparent-to-solid navigation bar, hero animations, and footer.
  * **Landing Page (`public/Home.tsx`):** Focus on high-quality travel imagery, micro-animations (Framer Motion), and a "Featured Tours" carousel.
  * **Tour Catalog (`public/Tours.tsx`):** A visually rich grid displaying available packages, complete with filtering by destination and date.
  * **Inquiry/Contact Form (`public/Contact.tsx`):** A sleek, multi-step form capturing lead details directly into the CRM as a "Lead" or "Inquiry" status.

## Phase 11: Notification & Alert System
**Objective:** Keep customers and staff informed proactively without relying strictly on dashboard logins.
* **Backend Requirements:**
  * Laravel Mailables & Notifications configuration (SMTP setup).
  * Queue Workers to process emails in the background to prevent UI freezing.
  * Event Listeners (e.g., `PaymentReceived`, `BookingConfirmed`, `DocumentRejected`).
* **Frontend/UI Architecture:**
  * **Toast Notifications:** Standardize the `shadcn/ui` toast system globally across all frontend actions.
  * **In-App Bell (`components/NotificationBell.tsx`):** A dropdown in the header indicating unread alerts for office staff (e.g., "New Lead Submitted", "Document Uploaded").

## Phase 12: Reporting & Analytics
**Objective:** Transform raw data into visual, actionable insights for Management and Finance.
* **Backend Requirements:**
  * Complex aggregation queries calculating monthly revenue, booking volumes, and conversion rates.
  * Export mechanisms (CSV/Excel) using `maatwebsite/excel` or native CSV generation.
* **Frontend/UI Architecture:**
  * **Interactive Dashboards (`Reports/Index.tsx`):** Integrate lightweight charting libraries (e.g., `recharts` or `chart.js` integrated with Tailwind).
  * **Revenue Charts:** Line graphs tracking payments over time.
  * **Booking Analytics:** Pie charts breaking down popular destinations and traveler demographics.
  * **Data Export:** Clean modals allowing staff to specify date ranges and instantly download reports.

## Phase 13: Audit Logging & Security Hardening
**Objective:** Finalize the security posture and ensure every critical action is traceable.
* **Backend Requirements:**
  * Integrate `spatie/laravel-activitylog` to automatically record who created/updated/deleted any Booking, Payment, or Customer.
* **Frontend/UI Architecture:**
  * **Activity Timeline (`Admin/AuditLog.tsx`):** A system timeline view for Super Admins showing a chronological feed of all system actions.

## Phase 14 & 15: Deployment & Polish
**Objective:** Push to production seamlessly.
* **Tasks:**
  * Finalize Tailwind CSS purging and Vite build optimizations.
  * Ensure mobile-responsiveness is pixel-perfect across all tables and cards.
  * Configure VPS, Nginx SSL certificates, database backups, and queue daemon supervisors.

---
*End of MMasterPlan*
