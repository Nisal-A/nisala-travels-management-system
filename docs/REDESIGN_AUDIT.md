# Nisala Travels Redesign Audit

## 1. Public-site Pages, Layouts, and Components
All frontend React components are located under `resources/js/`.

**Pages (resources/js/Pages/Public/):**
- `Home.tsx` (Homepage)
- `Contact.tsx` (Inquiry form & contact details)
- `Destinations/Index.tsx` (Destinations listing)
- `Tours/Index.tsx` (Tour packages listing)
- `Tours/Show.tsx` (Individual tour details)
- `Tours/Interactive.tsx` (Interactive map/tours page)

**Layouts:**
- `resources/js/components/layouts/PublicLayout.tsx` (Main layout wrapper for public pages containing Navbar and Footer)

**Components (resources/js/components/public/):**
- `Navbar.tsx` (Top navigation)
- `Footer.tsx` (Bottom footer)
- `AboutSection.tsx`
- `WhyChooseUsSection.tsx`
- `TestimonialsSection.tsx`
- `DestinationCard.tsx`
- `TourPackageCard.tsx`
- `Button.tsx`, `ImageFrame.tsx`, `InlineMessage.tsx`, `SectionHeading.tsx`, `Spinner.tsx`

---

## 2. Routes (routes/web.php)
The application handles both the public-facing website and the internal office system/customer portal.

**Public Routes (Inertia + API):**
- `GET /` -> `Public/Home`
- `GET /our-destinations` -> `Public/Destinations/Index`
- `GET /our-tours` -> `Public/Tours/Index`
- `GET /interactive-tours` -> `Public/Tours/Interactive`
- `GET /our-tours/{slug}` -> `Public/Tours/Show`
- `GET /contact` -> `Public/Contact`
- `GET /api/public/tours` -> `Api\PublicTourController@index`
- `GET /api/public/tours/featured` -> `Api\PublicTourController@featured`
- `GET /api/public/tours/{slug}` -> `Api\PublicTourController@show`
- `GET /api/public/destinations` -> `Api\PublicTourController@destinations`
- `POST /inquiries` -> `InquiryController@store`

**Guest/Shared:**
- `GET/POST /login` (Used by staff and customers)

**Office System / Portal Routes (Protected by auth/role middleware):**
- `/dashboard`
- `/saved-filters`
- `/admin/*` (Settings, Search, Global Notifications)
- `/employees`, `/customers`, `/documents`, `/destinations`, `/tours`, `/bookings`, `/payments`, `/reports`, `/calendar`
- `/portal/*` (Customer self-service portal)

---

## 3. Controllers, Form Requests, Models, and APIs (Public Site)
- **Controllers:** 
  - `App\Http\Controllers\Api\PublicTourController` (Serves read-only tour and destination data to the public frontend)
  - `App\Http\Controllers\InquiryController` (Handles contact form submissions)
- **Form Requests:** 
  - `App\Http\Requests\StoreInquiryRequest` (Validates public inquiry fields like `name`, `email`, `phone`, `tour_package_id`, etc.)
- **Models:** 
  - `App\Models\TourPackage`
  - `App\Models\Destination`
  - `App\Models\Customer` (Inquiries create a Customer lead with status 'New')
- **API Endpoints:** 
  - `GET /api/public/tours`, `GET /api/public/destinations`, `POST /inquiries`

---

## 4. Data Sources & Content
- **Tour Packages & Destinations:** Fetched dynamically from the database via `/api/public/...`.
  - *TourPackage DB fields:* `id`, `destination_id`, `package_name`, `description`, `duration_days`, `price`, `status`, `slug`, `gallery`, `price_from`, `is_featured`, `is_active`, etc.
  - *Destination DB fields:* `id`, `country`, `city_region`, `description`, `travel_information`, etc.
  - *Note on Data:* Currently, if the DB is empty (which happens frequently in the dev environment without seeders), the frontend has hardcoded fallbacks to display "Thailand" and "India" for destinations. Similar hardcoded arrays exist in `Tours/Index.tsx` to showcase "Semi Luxury" and "Luxury" examples when no data is returned.
- **Company Information (Contact/Socials):** Static data located in `resources/js/content/site.ts`. Contains email, phone, address, and social links.
- **Testimonials:** Static dummy data located in `resources/js/content/testimonials.ts`.
- **FAQs:** Static dummy data located in `resources/js/content/faqs.ts`.

---

## 5. Existing Styling System
- **Framework:** Tailwind CSS v4 (`@tailwindcss/vite` and `tailwindcss` v4.0.8).
- **CSS Variables:** The system heavily utilizes CSS variables for tokens in `resources/css/app.css` and `resources/css/theme.css`. Colors (e.g., `--color-primary`), spacing, radiuses, and fonts are mapped in the `@theme inline` block.
- **Fonts:** Uses `@fontsource-variable` for Inter (sans), Fraunces (serif), and Geist.
- **Components/UI:** Shadcn/ui is installed (`shadcn/tailwind.css` is imported) along with Radix UI primitives and Lucide icons. Framer-motion and Tailwind-animate are used for animations.

---

## 6. Existing SEO
- **Setup:** Very basic. 
- **Tags:** Uses Inertia's `<Head>` component in page files (e.g., `<Head title="Premium Travel & Tour Packages to Thailand & India | Nisala Travels" />` in `Home.tsx`). `app.blade.php` has a single hardcoded `<meta name="description">` fallback.
- **Missing Elements:** There are currently no Open Graph (OG) tags, Twitter cards, structured JSON-LD data, or dynamic sitemap generation for public pages.

---

## 7. Image Assets & Logo
- **Assets Directory:** Public images are served from `public/images/`. Some images might also exist in `storage/app/public` if uploaded via the admin panel.
- **Logo Location:** The Nisala Travels logo is located at `public/images/nisala-travels-logo.png`. (A hashed version `Logo-BvnQS7fV.js` was also found in the build assets).

---

## 8. Existing Contact Details & Testimonials
- **Contact Details:** Defined in `content/site.ts`. They include phone (`+94 77 123 4567`), email (`hello@nisalatravels.com`), WhatsApp (`+94771234567`), and address (`123 Travel Road, Colombo 03`). They are currently placeholders/samples ("replace with real").
- **Testimonials:** Exists in `content/testimonials.ts` (e.g., "Sarah & James - Honeymoon in Maldives", "David Chen - Business Retreat"). Currently marked as mock data for the redesign.

---

## 9. Visual Inconsistencies or Broken Elements
- Empty DB states cause the UI to rely on hardcoded fallback arrays (e.g., Destinations and Tours indexing) instead of standard empty states.
- Missing actual image columns in the `destinations` table (frontend forces an `undefined` or hardcoded image path fallback).
- "Sample" tags scattered across the contact data.
- SEO `<Head>` tags are incomplete and inconsistent across subpages.

---

## 10. Must Not Break List
The following files and systems are shared with the internal management system and must remain intact:
1. **`routes/web.php` structure**: Do not alter or remove the `auth`, `role`, or `active` protected route groups.
2. **`resources/views/app.blade.php`**: The root HTML template.
3. **Database schemas and models**: `TourPackage`, `Destination`, `Customer`. Changing these breaks the admin CRUD panels.
4. **Backend Controllers**: `InquiryController`, `CustomerController` etc.
5. **Tailwind Config / CSS Variables**: Modifying core tokens (like `--sidebar-*`, `--color-primary`, `--radius`) might unexpectedly change the Admin Dashboard UI.
6. **Authentication Flow**: The `/login` page and session logic.

---

## Open Questions for the User
1. Do we need to build a seeder to populate the `destinations` and `tour_packages` tables for local development, or should we keep the hardcoded frontend fallbacks?
2. Should we implement full SEO (Open Graph, structured data) for the public pages as part of this redesign?
3. Since the `Destination` model lacks an `image` column, should we add one via a migration, or just rely on a default placeholder image in the UI?
4. Can you provide the real contact details and testimonials to replace the placeholders in `site.ts` and `testimonials.ts`?