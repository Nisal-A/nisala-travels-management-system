# Nisala Travels Management System: Master Plan v2 (Frontend-First)

**Stack:** Laravel + Inertia + React (TypeScript) + Tailwind CSS + shadcn/ui
**Focus:** Phases 9–17 rebuilt around UI/UX. Each phase is split into numbered sub-parts with deliverables and a "Done when" check.

---

## Review of the Original Plan

| Issue found | Fix in v2 |
|---|---|
| No design system or shared UI foundation before building pages | New **Phase 9** builds tokens, layouts, and reusable components first |
| Toasts placed in Phase 11, but every earlier phase needs them | Moved to Phase 9 |
| Portal called "read-only" but includes uploads | Renamed to "self-service"; upload rules defined |
| Phases 14 and 15 merged; no testing or accessibility phase | Split into QA (Phase 16) and Deployment (Phase 17) |
| Staff-side UX (tables, search, calendar) not covered | New **Phase 11: Staff Workspace UX** |
| Nothing on loading, empty, and error states | Required in every sub-part |
| Sri Lanka context missing (LKR, Sinhala/Tamil, WhatsApp) | Added to Phases 9, 12, 13 |
| Public site built before the internal shell is reusable | Reordered: foundation, portal, staff UX, public site |

---

## Phase 9: Frontend Foundation & Design System

**Objective:** One consistent visual language and component kit that every later phase reuses.

### 9.1 Design Tokens & Theme
- Brand palette (primary, accent, neutrals, status colors), typography scale, spacing, radii, shadows in `tailwind.config` and CSS variables.
- Light and dark mode with a persistent toggle.
- **Done when:** a style-guide page (`/dev/styleguide`) shows every token.

### 9.2 Core Component Kit
- Wrap shadcn/ui: Button, Input, Select, DatePicker, Dialog, Sheet, Tabs, Badge, Card, Tooltip, Skeleton.
- Custom: `StatusBadge` (Booking, Payment, Document states), `MoneyText` (LKR/USD formatting), `EmptyState`, `ErrorState`, `ConfirmDialog`, `PageHeader`, `Breadcrumbs`.
- **Done when:** components are typed, documented in the style guide, and keyboard-accessible.

### 9.3 Layout Shells
- `AdminLayout` (collapsible sidebar, top bar, breadcrumbs, user menu).
- `CustomerPortalLayout` (minimal, branded, bottom tab bar on mobile).
- `PublicLayout` (transparent-to-solid sticky nav, footer).
- **Done when:** all three layouts are responsive from 360px up.

### 9.4 Global UX Infrastructure
- Global toast system (success/error/undo), Inertia progress bar, page transitions.
- Standard form pattern: React Hook Form + Zod, inline server-error mapping.
- Global error boundary and 403/404/419/500 pages.
- **Done when:** any failed request shows a consistent, friendly message.

### 9.5 Localization & Formatting
- i18n scaffold (English now; Sinhala and Tamil ready), date and currency helpers.
- **Done when:** no hardcoded UI strings in shared components.

---

## Phase 10: Customer Portal (Self-Service)

**Objective:** Secure area where customers view trips, upload documents, and get receipts.

### 10.1 Backend Access Layer
- IDOR protection: all queries scoped by `auth()->user()->customer_id`; policies plus feature tests.
- Lightweight endpoints: dashboard summary, bookings, payments, documents.

### 10.2 Portal Dashboard (`portal/Dashboard.tsx`)
- Next-trip hero card with countdown, outstanding balance card, "action needed" list (missing/rejected documents), quick links.
- **Done when:** skeletons on load, friendly empty state for new customers.

### 10.3 My Bookings (`portal/Bookings.tsx`, `BookingDetail.tsx`)
- Card grid with status badge, dates, destination; detail page with tabbed sections: Overview, Travelers, Itinerary, Payments, Documents.
- Visual trip timeline and downloadable itinerary PDF.

### 10.4 My Documents (`portal/Documents.tsx`)
- Drag-and-drop zone with per-traveler grouping; image/PDF preview; upload progress.
- Status chips: Pending, Verified, Rejected (with staff reason and "Re-upload").
- Rules: file type/size limits, virus-safe storage, expiry warning (e.g. passport under 6 months).

### 10.5 My Payments (`portal/Payments.tsx`)
- Transaction list, balance summary, installment schedule, one-click receipt download.

### 10.6 Profile & Security
- Edit contact details, saved travelers, change password, active sessions list.

---

## Phase 11: Staff Workspace UX (Admin Shell)

**Objective:** Make daily office work fast, since staff spend the most time here.

### 11.1 Advanced Data Table
- Reusable table: server-side pagination, sortable columns, column visibility, saved filters, bulk actions, sticky header, mobile card fallback.

### 11.2 Global Search & Command Palette
- `Ctrl/Cmd+K` search across customers, bookings, and payments, plus quick actions ("New booking").

### 11.3 Dashboard Home
- KPI tiles (today's bookings, pending payments, expiring documents, new leads), recent activity, tasks due.

### 11.4 Booking Workflow UI
- Multi-step booking wizard (customer, package, travelers, pricing, payment) with autosaved drafts.
- Booking detail page: status stepper, notes thread, document checklist, payment ledger.

### 11.5 Calendar & Departures
- Month/week view of departures and deadlines (visa, balance due); click-through to booking.

### 11.6 Document Verification Queue
- Split view: file preview on the left, approve/reject with reason on the right; keyboard shortcuts.

### 11.7 Lead & Inquiry Pipeline
- Kanban board (New, Contacted, Quoted, Won, Lost) with drag and drop, follow-up reminders, one-click "Convert to Customer/Booking".

---

## Phase 12: Public Website & Inquiry System

**Objective:** Premium marketing site that turns visitors into leads.

### 12.1 Backend
- `InquiryController` with validation, honeypot and rate limiting; read-only public `TourPackages` API; saved as Lead in the CRM.

### 12.2 Home (`public/Home.tsx`)
- Hero with search bar (destination, month), Featured Tours carousel, why-choose-us, testimonials, FAQ, Framer Motion scroll animations (respect reduced-motion).

### 12.3 Tour Catalog (`public/Tours.tsx`)
- Filters: destination, duration, price range, date; sort; URL-synced filters; skeleton loading.

### 12.4 Tour Detail (`public/TourDetail.tsx`)
- Image gallery, day-by-day itinerary accordion, inclusions/exclusions, price card, sticky "Enquire" button, related tours.

### 12.5 Contact / Inquiry (`public/Contact.tsx`)
- Multi-step form (trip interest, dates and travelers, contact details); success screen; WhatsApp click-to-chat button.

### 12.6 Trust & SEO
- Meta tags, Open Graph, sitemap, structured data, image optimization (WebP, lazy load), privacy policy and terms pages.

---

## Phase 13: Notifications & Alerts

**Objective:** Proactive communication for customers and staff.

### 13.1 Backend
- Mailables/Notifications, SMTP config, queue workers, events (`PaymentReceived`, `BookingConfirmed`, `DocumentRejected`, `InquirySubmitted`).
- Optional channel: WhatsApp/SMS provider abstraction.

### 13.2 In-App Notification Center
- `NotificationBell.tsx` with unread badge, grouped dropdown, mark-as-read, full `/notifications` page; polling or broadcasting.

### 13.3 Email Templates
- Branded responsive templates: booking confirmation, payment receipt, document rejected, trip reminder.

### 13.4 Preferences
- Customer and staff toggles per channel and event type.

---

## Phase 14: Reporting & Analytics

**Objective:** Visual, exportable insight for Management and Finance.

### 14.1 Backend Aggregations
- Monthly revenue, booking volume, conversion rate, outstanding balances, agent performance; cached queries.

### 14.2 Reports Dashboard (`Reports/Index.tsx`)
- `recharts` charts: revenue line, bookings bar, destination pie, lead funnel; date-range picker with presets and comparison to previous period.

### 14.3 Finance Views
- Receivables aging, payment method split, refunds.

### 14.4 Export Center
- Modal for date range and format (CSV/Excel/PDF); queued large exports with a download-ready notification.

---

## Phase 15: Audit Logging & Security Hardening

### 15.1 Activity Logging
- `spatie/laravel-activitylog` on Booking, Payment, Customer, Document, User.

### 15.2 Audit Timeline (`Admin/AuditLog.tsx`)
- Super Admin feed with filters (user, model, action, date) and before/after diff viewer.

### 15.3 Hardening
- Role/permission matrix UI, 2FA for staff, session timeout, login throttling, security headers/CSP, upload scanning.

---

## Phase 16: Quality, Accessibility & Performance

### 16.1 Testing
- Vitest and React Testing Library for components; Playwright for critical flows (login, book, pay, upload).

### 16.2 Accessibility
- WCAG AA contrast, focus states, ARIA labels, keyboard navigation, screen-reader pass.

### 16.3 Responsive Audit
- Test at 360, 768, 1024, 1440px; tables convert to cards on mobile.

### 16.4 Performance
- Code splitting, lazy routes, Lighthouse target 90+, bundle analysis.

---

## Phase 17: Deployment & Operations

### 17.1 Build
- Tailwind purge, Vite production build, env config.

### 17.2 Infrastructure
- VPS, Nginx, SSL, Supervisor queue workers, scheduler cron.

### 17.3 Reliability
- Automated DB and file backups with restore test, error monitoring (Sentry), uptime checks.

### 17.4 Launch
- Staging sign-off, data migration, staff training guide, go-live checklist.

---

## Suggested Order & Dependencies

1. **Phase 9** (blocks everything)
2. **Phase 10** and **Phase 11** (can run in parallel)
3. **Phase 12** (reuses the component kit and feeds the lead pipeline from 11.7)
4. **Phase 13** (hooks into events from 10–12)
5. **Phase 14** then **Phase 15**
6. **Phase 16** (continuous, final pass before launch), **Phase 17**

*End of Master Plan v2*