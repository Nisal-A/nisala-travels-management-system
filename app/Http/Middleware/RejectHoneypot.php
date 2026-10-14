<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response;

class RejectHoneypot
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $website = $request->input('website');

        if (is_string($website) && $website !== '') {
            $reference = 'NT-'.strtoupper(Str::random(8));

            return response()->json(['reference' => $reference], 201);
        }

        return $next($request);
    }
}
