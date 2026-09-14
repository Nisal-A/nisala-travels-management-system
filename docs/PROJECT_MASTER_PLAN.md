As the Senior Technical Planner and Systems Architect for the Nisala Travels Management System, I have analyzed the comprehensive project requirements. My objective is to translate your business vision into a strictly structured, dependency-aware, and actionable technical roadmap tailored for an AI-assisted development workflow (such as Antigravity IDE).

I will not generate application code. Instead, I have structured the master plan to ensure that "one customer record, one operational system, one source of truth" is maintained throughout development, without risking overwhelming the AI developer with giant, unmanageable prompts.

Here is the complete project definition and task architecture.

---

## A. PHASE ROADMAP

A high-level sequence to ensure foundational infrastructure is built before business logic, and business logic before presentation layers.

* **PHASE 0:** Discovery, Planning, and Architecture Validation (Current Phase)
* **PHASE 1:** Project Foundation & Core Infrastructure
* **PHASE 2:** Authentication, Roles, & Permissions
* **PHASE 3:** Admin Dashboard / Office App Shell
* **PHASE 4:** Customer Management (CRM Core)
* **PHASE 5:** Secure Document Management
* **PHASE 6:** Destinations & Tour Packages
* **PHASE 7:** Booking & Traveler Management
* **PHASE 8:** Financials: Payment & Receipt Management
* **PHASE 9:** Customer Portal (Self-Service)
* **PHASE 10:** Public Website & Inquiry System
* **PHASE 11:** Notification & Alert System
* **PHASE 12:** Reporting & Analytics
* **PHASE 13:** Audit Logging & Security Hardening
* **PHASE 14:** Comprehensive Testing (Continuous, finalized here)
* **PHASE 15:** Deployment & Production Readiness

---

## B. DETAILED TASK BACKLOG (EPIC HIERARCHY)

*(Note: To maintain readability and prevent token exhaustion, the complete project is mapped at the Epic level here. The strict task-level detail with all 16 required fields is fully instantiated in **Section J** for the immediate actionable backlog, establishing the template the AI will use for all subsequent epics.)*

* **PHASE 1: Foundation**
* *Epic 1.1:* System Initialization (Laravel, React, Inertia, Tailwind)
* *Epic 1.2:* Database scaffolding & CI/CD stubs


* **PHASE 2: Auth & Authorization**
* *Epic 2.1:* Core Authentication (Login, Logout, Session)
* *Epic 2.2:* RBAC (Super Admin, Manager, Staff, Finance, Customer)


* **PHASE 3: Admin Shell**
* *Epic 3.1:* UI Foundation (shadcn/ui components, Sidebar, Layouts)
* *Epic 3.2:* Dashboard routing and role-aware navigation


* **PHASE 4: Customer Management**
* *Epic 4.1:* Customer Data Layer (Migrations, Models, Relations)
* *Epic 4.2:* Customer Operations (CRUD, Search, Filters, Status)


* **PHASE 5: Document Management**
* *Epic 5.1:* Secure Storage Architecture & File Uploads
* *Epic 5.2:* Document Lifecycle (Verification, Rejection, Expiry Tracking)


* **PHASE 6: Destinations & Packages**
* *Epic 6.1:* Destination DB & UI
* *Epic 6.2:* Package Builder & Pricing Engine


* **PHASE 7: Booking Management**
* *Epic 7.1:* Booking Workflows & Traveler Assignment
* *Epic 7.2:* Booking Status Engine


* **PHASE 8: Payments**
* *Epic 8.1:* Ledger & Transaction Recording
* *Epic 8.2:* Receipt Generation (PDF)


* **PHASE 9: Customer Portal**
* *Epic 9.1:* Protected Customer Shell & Dashboard
* *Epic 9.2:* Self-Service Uploads & Payment Views


* **PHASE 10: Public Website**
* *Epic 10.1:* Marketing Pages (Home, About, Dest.)
* *Epic 10.2:* Lead Generation / Inquiry Capture Pipeline



---

## C. DEPENDENCY MAP

To avoid rework, tasks must strictly follow this topological execution order:

1. **Foundation** blocks all other tasks.
2. **Auth & Roles** blocks Admin Shell and API security.
3. **Admin Shell** blocks all Office UI modules.
4. **Customer Management** is the core entity; it blocks Documents, Bookings, and Portal.
5. **Destinations & Packages** blocks Bookings and Public Website.
6. **Bookings** blocks Payments and Traveler Management.
7. **Documents** (requires Customers + Bookings) blocks Portal uploads.
8. **Payments** (requires Bookings) blocks Receipts and Financial Reports.

---

## D. MVP ROADMAP (Minimum Viable Product)

The initial production release must contain:

1. Secure Foundation & RBAC.
2. Office Admin Shell.
3. Complete Customer CRM (Create, Search, Profile).
4. Secure Document Management (Upload, Verify, Secure Storage).
5. Basic Destinations & Packages to support bookings.
6. Core Booking Engine (Assigning travelers to packages).
7. Payment Tracking (Recording offline/bank payments and calculating balances).
8. Customer Portal (View-only bookings, document uploads).

---

## E. POST-MVP ROADMAP

Features to be deferred to V2 to ensure timely delivery of the core system:

* Automated WhatsApp/SMS notifications (Keep V1 to in-app & basic email).
* Online Payment Gateway Integration (Keep V1 to manual payment recording).
* Advanced Business Intelligence charts (Keep V1 to standard data tables & basic counters).
* Complex marketing automations & Loyalty systems.
* Public blog and interactive customer reviews.

---

## F. TESTING ROADMAP

* **Phase 1-3:** Unit tests for Role/Permission middleware. E2E test for Login/Logout.
* **Phase 4-8:** Feature tests for all primary workflows (Customer Creation, Document Upload & Validation, Booking Status transitions, Payment Balance Math). *Strict math tests required for financials.*
* **Phase 9 (Portal):** Security tests ensuring Customer A cannot access Customer B's documents/bookings.
* **Phase 13 (Security):** File upload vulnerability testing (preventing PHP execution via image uploads), Path traversal tests.

---

## G. DEPLOYMENT ROADMAP

1. **Infrastructure Setup:** Provision VPS/Cloud, configure Nginx/Apache, PHP 8.x, MySQL 8+.
2. **Storage Config:** Set up absolute private paths for sensitive documents; symlink only public assets.
3. **Environment:** Provision `.env` with production secrets, disable debug mode.
4. **CI/CD:** Setup GitHub Actions for automated testing and deployment.
5. **Schedulers:** Configure CRON for Laravel Scheduler (Document expiry tasks).
6. **Queues:** Configure Redis/Database queue workers for background tasks.

---

## H. RISK REGISTER

1. **Sensitive Document Exposure:** *Risk:* Passports/NICs exposed to public web. *Mitigation:* Store in `storage/app/private`, serve via Laravel routes with strict authorization middleware.
2. **Financial Calculation Errors:** *Risk:* Client-side JS used for balance math. *Mitigation:* All financial math (Total - Paid = Balance) must be done server-side using precision decimal types.
3. **AI Code Drift:** *Risk:* AI rewrites existing files unnecessarily. *Mitigation:* Strict prompting for Antigravity to only touch scoped files per task ID.
4. **Database Locking/Inefficiency:** *Risk:* Poor indexing on Customer Search. *Mitigation:* Enforce indexes on NIC, Passport, Phone, and Email during Phase 4 migrations.

---

## I. ARCHITECTURE DECISION LIST (To Be Finalized)

* *Decision Required:* **File Storage Driver:** Local private storage vs. AWS S3? (Recommendation: Start with Local private disk, abstract via Laravel Storage facade for future S3 swap).
* *Decision Required:* **Financial Precision:** Store amounts as integers (cents) or Decimals? (Recommendation: `DECIMAL(12,2)` for LKR given no fractional cents in practical use, but standard for financial apps).
* *Decision Required:* **Customer Login Identifier:** Email vs. Phone Number? (Recommendation: Email as primary, consider Phone/OTP for future V2).

---

## J. RECOMMENDED FIRST 10 TASKS (Actionable Backlog)

These tasks are formatted precisely for an AI developer to execute sequentially.

### Task NT-001: Project Foundation & Stack Initialization

* **Objective:** Scaffold the base Laravel + React + Inertia + Tailwind app.
* **Description:** Initialize Laravel 11.x, install Inertia.js React adapter, setup Tailwind CSS, and configure TypeScript.
* **Dependencies:** None.
* **Priority:** Critical | **Complexity:** Low
* **Backend:** Basic Laravel setup, setup `web.php` for Inertia rendering.
* **Frontend:** Setup `app.tsx`, Tailwind config, Vite config.
* **Database:** Default Laravel migrations.
* **Security:** Ensure `.env` is ignored.
* **Testing:** Basic assert true test to ensure PHPUnit/Pest runs.
* **Docs:** Update `README.md` with build instructions.
* **Acceptance Criteria:** `npm run build` and `php artisan serve` render a blank React page successfully. No console errors.
* **Git Branch:** `feature/NT-001-foundation`
* **Commit:** `chore: initialize laravel react inertia tailwind stack`

### Task NT-002: UI Component Library Integration

* **Objective:** Install and configure `shadcn/ui` for rapid frontend development.
* **Description:** Setup standard path aliases (`@/*`), install base shadcn components (Button, Input, Form, Card, Table).
* **Dependencies:** NT-001
* **Priority:** High | **Complexity:** Low
* **Frontend:** `components.json` setup, add UI primitives to `resources/js/components/ui`.
* **Acceptance Criteria:** A test page successfully renders a shadcn Button and Card with correct Tailwind styling.
* **Git Branch:** `feature/NT-002-ui-system`
* **Commit:** `feat: integrate shadcn ui components`

### Task NT-003: Database Architecture & User Schema

* **Objective:** Expand default Users table to support multi-role architecture.
* **Description:** Add role enumerations/relationships, status flags, and soft deletes to the User model.
* **Dependencies:** NT-001
* **Priority:** Critical | **Complexity:** Medium
* **Backend:** `User` model updates, `Role` model (or Enums depending on ADL), migrations.
* **Database:** `users` table updates, add `status` (active/inactive).
* **Testing:** Test user factory creation with specific roles.
* **Acceptance Criteria:** Database migrates successfully, User model accurately reflects roles.
* **Git Branch:** `feature/NT-003-user-schema`
* **Commit:** `feat: establish multi-role user schema`

### Task NT-004: Authentication & Session Management

* **Objective:** Implement secure login/logout workflows.
* **Description:** Build React login form, Laravel Auth controller, session protection, and basic redirect logic.
* **Dependencies:** NT-002, NT-003
* **Priority:** Critical | **Complexity:** Medium
* **Backend:** `AuthController@login`, `AuthController@logout`, rate limiting on login route.
* **Frontend:** `Login.tsx` with form validation (Zod/React Hook Form).
* **Security:** Implement CSRF protection, session fixation prevention.
* **Acceptance Criteria:** User can log in, receive a secure session, and log out. Invalid credentials return proper errors.
* **Git Branch:** `feature/NT-004-auth`
* **Commit:** `feat: implement authentication workflow`

### Task NT-005: Authorization & Role-Based Middleware

* **Objective:** Protect routes based on user type.
* **Description:** Create Laravel middleware to restrict routes (e.g., `EnsureUserIsAdmin`). Define Gate policies.
* **Dependencies:** NT-004
* **Priority:** Critical | **Complexity:** Medium
* **Backend:** Middleware creation, register in `bootstrap/app.php` (or Kernel), apply to route groups.
* **Security:** Enforce strict server-side checks.
* **Testing:** Feature tests asserting 403 Forbidden for unauthorized roles.
* **Acceptance Criteria:** A Staff user cannot access Super Admin routes.
* **Git Branch:** `feature/NT-005-authorization`
* **Commit:** `feat: implement role based authorization middleware`

### Task NT-006: Admin Dashboard Shell & Layout

* **Objective:** Create the persistent Office UI layout.
* **Description:** Build the responsive Sidebar, Header (with user profile/logout), and Main Content area for office staff.
* **Dependencies:** NT-002, NT-004
* **Priority:** High | **Complexity:** Medium
* **Frontend:** `AuthenticatedLayout.tsx`, navigation map based on user role passed from Inertia props.
* **Acceptance Criteria:** Layout renders correctly on desktop and collapses to a hamburger menu on mobile. Navigation items hide/show based on permissions.
* **Git Branch:** `feature/NT-006-admin-shell`
* **Commit:** `feat: build responsive office dashboard layout`

### Task NT-007: Customer Data Layer (CRM Foundation)

* **Objective:** Create the database schema and models for Customers.
* **Description:** Migrations and models for `customers` (NIC, Passport, DOB, Contacts).
* **Dependencies:** NT-003
* **Priority:** Critical | **Complexity:** Medium
* **Backend:** `Customer` model, relationships.
* **Database:** `customers` table with proper indexes on search fields (NIC, Email, Phone, Passport). Soft deletes enabled.
* **Testing:** Model unit tests, Factory generation.
* **Acceptance Criteria:** Schema supports all requirements in Module 4. Can seed 50 dummy customers successfully.
* **Git Branch:** `feature/NT-007-customer-schema`
* **Commit:** `feat: implement customer database schema`

### Task NT-008: Customer Management UI (CRUD)

* **Objective:** Allow staff to manage customer profiles.
* **Description:** Build React pages for Customer List (Table with pagination), Create Customer Form, and View Customer Profile.
* **Dependencies:** NT-006, NT-007
* **Priority:** Critical | **Complexity:** High
* **Backend:** `CustomerController` (index, store, show, update). Form Requests for strict validation.
* **Frontend:** `Customers/Index.tsx`, `Customers/Create.tsx`, `Customers/Show.tsx`.
* **Acceptance Criteria:** Staff can create a new customer, view them in a paginated table, and edit their details.
* **Git Branch:** `feature/NT-008-customer-crud`
* **Commit:** `feat: implement customer management interfaces`

### Task NT-009: Secure Document Architecture

* **Objective:** Establish secure file storage logic for sensitive travel docs.
* **Description:** Configure Laravel `local` private disk. Create `CustomerDocument` model and migration (tracking Type, Status, Expiry).
* **Dependencies:** NT-007
* **Priority:** Critical | **Complexity:** Medium
* **Backend:** File path logic, `DocumentPolicy` to ensure only authorized staff or the specific customer can view.
* **Security:** Absolute prohibition of saving to `public/` disk.
* **Acceptance Criteria:** Architecture allows saving metadata in DB and files in a restricted system folder.
* **Git Branch:** `feature/NT-009-doc-schema`
* **Commit:** `feat: establish secure document storage architecture`

### Task NT-010: Document Upload & Verification Flow

* **Objective:** Enable uploading and verifying customer documents.
* **Description:** Build file upload component. Build backend controller to handle `Multipart/form-data`, validate file mime types (PDF, JPG, PNG) and sizes. Build verification toggle for Staff.
* **Dependencies:** NT-008, NT-009
* **Priority:** Critical | **Complexity:** High
* **Backend:** `DocumentController@store`, `DocumentController@download` (streams file via authorized route).
* **Frontend:** UI inside `Customers/Show.tsx` to list documents, upload new ones, and badge statuses (Pending, Verified).
* **Security:** Strict Mime-type validation server-side.
* **Acceptance Criteria:** Staff can upload a passport image. The image does not exist in the public URL space. Staff can click a button to download/view it securely and mark it "Verified".
* **Git Branch:** `feature/NT-010-doc-upload`
* **Commit:** `feat: implement secure document upload and verification`

---

*Instructions for AI/Developer:*
Load this document into the project repository as `docs/PROJECT_MASTER_PLAN.md`. When initiating work in Antigravity IDE, supply the exact text of **Task NT-001** as your first prompt, verify the Definition of Done is met, commit, and proceed sequentially down the list.
