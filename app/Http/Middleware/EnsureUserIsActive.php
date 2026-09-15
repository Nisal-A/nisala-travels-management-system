<?php

namespace App\Http\Middleware;

use App\Enums\UserStatus;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

/**
 * Middleware that verifies the authenticated user's account is still active.
 *
 * If a user's status has been changed to inactive or suspended after they
 * logged in, this middleware will log them out and redirect to login with
 * an appropriate error message.
 */
class EnsureUserIsActive
{
    public function handle(Request $request, Closure $next): Response
    {
        if (Auth::check() && Auth::user()->status !== UserStatus::Active) {
            Auth::logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            return redirect()->route('login')->withErrors([
                'email' => __('Your account has been :status. Please contact an administrator.', [
                    'status' => Auth::user()?->status?->label() ?? 'deactivated',
                ]),
            ]);
        }

        return $next($request);
    }
}
