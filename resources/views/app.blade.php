<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="description" content="Centralized travel agency management system for Nisala Travels.">

        <title inertia>{{ config('branding.company_name', 'Nisala Travels') }}</title>

        <!-- Favicon and App Icons -->
        <link rel="icon" type="image/x-icon" href="{{ asset('favicon.ico') }}">
        <link rel="icon" type="image/png" sizes="16x16" href="{{ asset('favicon-16x16.png') }}">
        <link rel="icon" type="image/png" sizes="32x32" href="{{ asset('favicon-32x32.png') }}">
        <link rel="apple-touch-icon" sizes="180x180" href="{{ asset('apple-touch-icon.png') }}">
        <link rel="manifest" href="{{ asset('site.webmanifest') }}">
        
        <!-- Theme Color -->
        <meta name="theme-color" content="{{ config('branding.colors.primary', '#C9A227') }}">

        <!-- Open Graph / Social -->
        <meta property="og:title" content="{{ config('branding.company_name', 'Nisala Travels') }}">
        <meta property="og:description" content="{{ config('branding.tagline', 'Premium Travel & Tour Packages') }}">
        <meta property="og:image" content="{{ asset(config('branding.logos.og_image', '/brand/og-image.jpg')) }}">
        <meta property="og:url" content="{{ url()->current() }}">
        <meta property="og:type" content="website">
        
        <meta name="twitter:card" content="summary_large_image">
        <meta name="twitter:title" content="{{ config('branding.company_name', 'Nisala Travels') }}">
        <meta name="twitter:description" content="{{ config('branding.tagline', 'Premium Travel & Tour Packages') }}">
        <meta name="twitter:image" content="{{ asset(config('branding.logos.og_image', '/brand/og-image.jpg')) }}">

        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">

        <!-- Theme Initialization -->
        <script>
            (function() {
                try {
                    var theme = localStorage.getItem('theme');
                    if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                        document.documentElement.classList.add('dark');
                    } else {
                        document.documentElement.classList.remove('dark');
                    }
                } catch (e) {}
            })();
        </script>

        <!-- Scripts -->
        @routes
        @viteReactRefresh
        @vite(['resources/js/app.tsx'])
        @inertiaHead
    </head>
    <body class="font-sans antialiased">
        @inertia
    </body>
</html>
