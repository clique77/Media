<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Support\Facades\App;

class SetLocaleMiddleware
{
    public function handle($request, Closure $next)
    {
        $locale = $request->header('Accept-Language', 'en');

        if (in_array($locale, ['en', 'uk'])) {
            App::setLocale($locale);
        }

        return $next($request);
    }
}
