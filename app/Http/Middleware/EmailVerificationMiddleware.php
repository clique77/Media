<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Auth;

class EmailVerificationMiddleware
{
    /**
     * Обробляє запит.
     *
     * @param Request $request
     * @param Closure $next
     * @return mixed
     */
    public function handle(Request $request, Closure $next)
    {
        $userId = $request->route('id');
        $hash = $request->route('hash');

        $user = User::find($userId);

        if (!$user) {
            return response()->json([
                'message' => __('auth.user_not_found')
            ], 404);
        }

        if (! hash_equals(sha1($user->getEmailForVerification()), (string) $hash)) {
            return response()->json([
                'message' => __('auth.invalid_verification_link')
            ], 400);
        }

        if ($user->hasVerifiedEmail()) {
            return response()->json([
                'message' => __('auth.email_already_verified')
            ], 200);
        }

        $user->markEmailAsVerified();

        Auth::login($user);

        return $next($request);
    }
}
