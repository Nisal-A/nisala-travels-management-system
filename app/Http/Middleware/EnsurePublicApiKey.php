<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsurePublicApiKey
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $expectedKey = config('services.nisala_web.key');

        if (empty($expectedKey)) {
            return response()->json(['message' => 'Service unavailable'], 503);
        }

        $headerKey = $request->header('X-Nisala-Key');

        if (!is_string($headerKey) || !hash_equals((string) $expectedKey, $headerKey)) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $clientIp = $request->header('X-Client-IP');
        $resolvedIp = ($clientIp && filter_var($clientIp, FILTER_VALIDATE_IP)) ? $clientIp : $request->ip();

        $request->attributes->set('client_ip', $resolvedIp);

        return $next($request);
    }
}
