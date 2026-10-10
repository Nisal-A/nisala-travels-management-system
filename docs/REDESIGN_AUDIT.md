# REDESIGN AUDIT REPORT

## 1. Public-site pages, layouts, and components
All public-facing frontend files live under `resources/js/`:
- **Pages**:
  - `resources/js/Pages/Public/Home.tsx`
  - `resources/js/Pages/Public/Tours/Index.tsx`
  - `resources/js/Pages/Public/Tours/Show.tsx`
  - `resources/js/Pages/Public/Contact.tsx`
- **Layouts**:
  - `resources/js/components/layouts/PublicLayout.tsx`
- **Components**:
  - `resources/js/components/common/Reveal.tsx`
  - `resources/js/components/common/WhatsAppButton.tsx` (noted as missing/referenced in layouts/pages)

## 2. Routes (web.php)
**Public Routes**:
- `GET /` (Home)
- `GET /tours` (Tours Index)
- `GET /tours/{slug}` (Tour Detail)
- `GET /contact` (Contact)
- `GET api/public/tours` (Fetch tours list)
- `GET api/public/tours/featured` (Fetch featured tours)
- `GET api/public/tours/{slug}` (Fetch tour details)
- `GET api/public/destinations` (Fetch destinations)
- `POST /inquiries` (Contact/Enquiry submission)

**Office System Routes (Must NOT be affected)**:
- Authenticated generic: `/dashboard`, `/saved-filters`
- Admin/Staff role-protected: `/admin/*`, `/customers/*`, `/documents/*`, `/destinations/*`, `/tours/*`, `/bookings/*`, `/payments/*`, `/employees/*`, `/reports/*`, `/settings/*`, `/calendar/*`
- Customer Portal: `/portal/*` (Bookings, payments, documents, profile)

## 3. Controllers, Form Requests, Models, API Endpoints
- **Controllers**: 
  - `App\Http\Controllers\Api\PublicTourController` (handles all `/api/public/` routes)
  - `App\Http\Controllers\InquiryController` (handles `POST /inquiries`)
- **Form Requests**: 
  - `StoreInquiryRequest` (validates inquiries, includes honeypot `website_field`, strips HTML from messages)
- **Models**: 
  - `TourPackage`, `Destination`, `Customer` (inquiries can create/update leads)
- **API Endpoints**: 
  - `/api/public/tours`
  - `/api/public/tours/featured`
  - `/api/public/tours/{slug}`
  - `/api/public/destinations`
  - `/inquiries`

## 4. Data Sources (Tours, Destinations, Company)
- **Tour Packages & Destinations**: The API routes fetch this data from the database (`tour_packages` and `destinations` tables). However, there is an inconsistency: the `Home.tsx` uses a static TypeScript file (`resources/js/content/tours.ts`) for featured tours, bypassing the API.
- **Real Field Names (`tour_packages`)**: `id`, `destination_id`, `package_name`, `description`, `duration_days`, `start_date`, `end_date`, `price`, `currency`, `capacity`, `available_seats`, `hotel_information`, `transportation_information`, `meals`, `included_items`, `excluded_items`, `terms`, `status`, `slug`, `short_description`, `hero_image`, `gallery`, `price_from`, `is_featured`, `is_active`.
- **India/Thailand & Luxury Levels**: 
  - There are specific tours explicitly for India and Thailand in the static `tours.ts` file, and destinations are seeded/managed in the database for them.
  - **Luxury / Semi Luxury**: There is NO field for "Luxury" or "Semi Luxury" tiers in the database schema (`tour_packages` table). The data does not currently have structural support for tracking these levels natively outside of generic text fields or tags.
- **Company Data**: Stored entirely in static files at `resources/js/content/site.ts`.

## 5. Existing Styling System
- **Tailwind Setup**: Tailwind v4 is initialized via CSS (`@import 'tailwindcss';`) in `resources/css/app.css`.
- **CSS Variables**: Extensive theming system using `oklch` definitions across both light and dark modes located in `resources/css/theme.css`. Includes brand palettes, layout borders, status colors, and chart variations.
- **shadcn/ui**: Utilized (`@import 'shadcn/tailwind.css';`), providing standardized UI components.
- **Fonts**: Uses `@fontsource-variable/inter` (sans) and `@fontsource-variable/fraunces` (serif) through custom CSS `@theme inline` definitions.

## 6. Existing SEO
- **Titles/Meta Tags**: The `@inertiajs/react` `<Head>` component manages titles dynamically. `resources/views/app.blade.php` has a static `meta description` and no Open Graph tags.
- **Structured Data**: `PublicLayout.tsx` includes JSON-LD for a `@type: TravelAgency` schema.
- **Sitemap/Robots**: `public/sitemap.xml` and `public/robots.txt` exist in the repository.

## 7. Image Assets and Logo
- **Assets Directory**: Images live physically in `public/images/hero`, `public/images/india`, and `public/images/thailand`. 
- **Logo Status**: The logo is referenced in code via an absolute URL (`https://nisalatravels.lk/images/brand/logo.png`) but the file **DOES NOT EXIST** locally within the project (`public/images/brand/` directory is missing).

## 8. Testimonials and Contact Details
- **Contact Details**: Found in `resources/js/content/site.ts`. Some data is placeholder (`// SAMPLE: replace with real`), including phone, email, WhatsApp, address, and social links.
- **Testimonials**: Provided by `resources/js/content/testimonials.ts` using static placeholder data.
- **Missing Elements**: Real contact and testimonial data needs to be populated. 

## 9. Visual Inconsistencies & Broken Elements
- **Missing Local Logo**: Local development environments will render a broken image for the logo.
- **Data Splitting**: `Home.tsx` loads featured tours from static `tours.ts`, while `Show.tsx` and `Index.tsx` query the database.
- **Mock Itineraries**: `Show.tsx` statically generates days ("Day 1", "Day 2", etc.) because there is no relationship in the database for an itinerary schedule.

## 10. "Must Not Break" List
- **API Contracts**: The `POST /inquiries` endpoint logic (rate limiting, honeypot, event firing).
- **Global Layouts & Views**: `resources/views/app.blade.php` serves Inertia globally, ensure no core scripts/tags are corrupted.
- **Middleware Rules**: Role definitions in `routes/web.php` for `role:super_admin,manager,staff,finance` and `role:customer`.
- **Office System Layouts**: `AppLayout.tsx` and `CustomerPortalLayout.tsx`. 
- **Cache Invalidations**: The `TourPackage` model `booted()` method flushes cache upon saves/deletions.

## Open Questions for the User
1. Since the logo file is missing locally, would you like me to create a temporary text-based placeholder, or do you have the `logo.png` file available to upload?
2. `Home.tsx` relies on static data (`tours.ts`) instead of the database API used by the rest of the application. Should this be refactored to fetch featured tours from the API?
3. Currently, there is no database column representing "Semi Luxury" vs "Luxury" tiers. Should we introduce this field as part of the redesign, or rely on tags?
4. Itineraries in `Show.tsx` are dynamically generated dummy data since no relational table exists for daily breakdowns. Are we adding this table, or keeping the mock behavior for now?
5. You requested placeholder usage where real company data is missing (e.g. phone/address in `site.ts`). Should I populate those explicitly as `[TODO: add company address]`, or leave them as the current `SAMPLE` data?
