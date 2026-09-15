# Nisala Travels Management System

Centralized travel agency management system for Nisala Travels — customer management, document handling, tour packages, bookings, payments, and business operations.

## Stack

| Layer     | Technology                          |
|-----------|-------------------------------------|
| Backend   | Laravel 12 (PHP 8.2+)               |
| Frontend  | React 19 + TypeScript               |
| Bridge    | Inertia.js v2                        |
| Styling   | Tailwind CSS v4                     |
| Build     | Vite 6                              |
| Testing   | Pest v3 / PHPUnit 11               |
| Database  | SQLite (dev) / MySQL (production)   |

---

## Prerequisites

- PHP 8.2+
- Composer 2.x
- Node.js 20+
- npm 10+

---

## Installation

```bash
# 1. Clone the repository
git clone <repo-url>
cd nisala-travels-management-system

# 2. Install PHP dependencies
composer install

# 3. Install JS dependencies
npm install

# 4. Copy environment file and generate app key
cp .env.example .env
php artisan key:generate

# 5. Create the SQLite database file
touch database/database.sqlite

# 6. Run migrations
php artisan migrate

# 7. Link storage
php artisan storage:link
```

---

## Development

```bash
# Run frontend dev server (Vite HMR)
npm run dev

# Run Laravel server (in a separate terminal)
php artisan serve

# Run both concurrently
composer run dev
```

Open [http://localhost:8000](http://localhost:8000) in your browser.

---

## Build for Production

```bash
npm run build
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

---

## Testing

```bash
# Run all tests
php artisan test

# Run with Pest directly
./vendor/bin/pest

# Run specific suite
./vendor/bin/pest --testsuite=Feature
```

---

## Git Branches

| Branch                          | Purpose                  |
|---------------------------------|--------------------------|
| `main`                          | Production-ready code    |
| `dev`                           | Integration branch       |
| `feature/NT-001-foundation`     | Project foundation setup |

---

## Project Structure

```
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   └── Middleware/HandleInertiaRequests.php
│   ├── Models/
│   └── Providers/
├── bootstrap/
│   ├── app.php
│   └── providers.php
├── config/
├── database/
│   ├── migrations/
│   ├── factories/
│   └── seeders/
├── public/
│   └── index.php
├── resources/
│   ├── css/app.css
│   ├── js/
│   │   ├── app.tsx         ← Inertia entry point
│   │   └── Pages/          ← React page components
│   └── views/
│       └── app.blade.php   ← Inertia root template
├── routes/
│   ├── web.php
│   └── console.php
├── tests/
├── vite.config.ts
├── tsconfig.json
└── package.json
```
