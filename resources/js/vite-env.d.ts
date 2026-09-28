/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_APP_NAME: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}

/**
 * Global Ziggy route() helper, injected at runtime via the @routes
 * Blade directive. See: tighten/ziggy
 */
declare function route(name: string, params?: Record<string, unknown>): string;
