import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { ThemeProvider } from './components/theme-provider';

import { GlobalErrorBoundary } from './GlobalErrorBoundary';

const appName = import.meta.env.VITE_APP_NAME || 'Nisala Travels';

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.tsx`,
            import.meta.glob('./Pages/**/*.tsx'),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);
        root.render(
            <GlobalErrorBoundary>
                <ThemeProvider defaultTheme="system" storageKey="theme">
                    <App {...props} />
                </ThemeProvider>
            </GlobalErrorBoundary>
        );
    },
    progress: {
        color: '#4F46E5',
    },
});
