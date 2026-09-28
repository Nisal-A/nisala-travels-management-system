<?php

namespace App\Http\Middleware;

use App\Enums\UserRole;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Middleware that restricts route access based on the authenticated user's role.
 *
 * Accepts one or more Spatie role names as parameters. The user must hold
 * at least one of the specified roles to proceed. If the user is authenticated
 * but lacks the required role, a 403 Forbidden response is returned.
 *
 * This middleware assumes the 'auth' middleware has already verified the user
 * is authenticated. It should always be placed after 'auth' in the middleware
 * stack.
 *
 * Usage in routes:
 *   Route::middleware('role:super_admin')->group(...);
 *   Route::middleware('role:super_admin,manager')->group(...);
 *
 * @see UserRole for available role identifiers
 */
class EnsureUserHasRole
{
    /**
     * Handle an incoming request.
     *
     * @param  string  ...$roles  One or more role names (passed as comma-separated middleware parameters)
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        // Guard: If somehow reached without authentication, abort 403.
        // (The 'auth' middleware should catch this first, but defense-in-depth.)
        if (! $request->user()) {
            abort(403);
        }

        // Check if the user has any of the required roles (server-side via Spatie)
        if (! $request->user()->hasAnyRole($roles)) {
            abort(403);
        }

        return $next($request);
    }
}
