<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Services\Auth\AuthService;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class AuthController extends Controller
{
    public function __construct(private AuthService $authService)
    {
    }

    /**
     * Реєстрація нового користувача.
     *
     * @param RegisterRequest $request
     * @return JsonResponse|RedirectResponse
     */
    public function register(RegisterRequest $request): JsonResponse|RedirectResponse
    {
        try {
            $validatedData = $request->validated();

            $data = $this->authService->register(
                $validatedData['username'],
                $validatedData['email'],
                $validatedData['password']
            );

            return response()->json([
                'message' => __('auth.register_success'),
                'access_token' => $data['access_token'],
                'user' => $data['user']
            ], 201)->cookie('refresh_token', $data['refresh_token'], 20160, null, null, false, true);
        } catch (Exception $e) {
            return response()->json(['error' => $e->getMessage()], 400);
        }
    }


    /**
     * Логін користувача.
     *
     * @param LoginRequest $request
     * @return JsonResponse
     */
    public function login(LoginRequest $request): JsonResponse
    {
        try {
            $validatedData = $request->validated();

            $data = $this->authService->login(
                $validatedData['email'],
                $validatedData['password']
            );

            return response()->json([
                'message' => __('auth.login_success'),
                'access_token' => $data['access_token'],
                'user' => $data['user'],
            ])->cookie('refresh_token', $data['refresh_token'], 20160, null, null, false, true);
        } catch (Exception $e) {
            return response()->json(['error' => $e->getMessage()], 400);
        }
    }

    /**
     * Логаут користувача.
     *
     * @return JsonResponse
     */
    public function logout(): JsonResponse
    {
        try {
            $this->authService->logout();

            return response()->json(['message' => __('auth.logout_success')])
                ->withoutCookie('refresh_token');
        } catch (Exception $e) {
            return response()->json(['error' => __('auth.logout_failed') . ': ' . $e->getMessage()], 400);
        }
    }

    /**
     * Оновлення JWT токена
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function refreshToken(Request $request): JsonResponse
    {
        try {
            $refreshToken = $request->cookie('refresh_token');

            if (!$refreshToken) {
                return response()->json(['error' => __('auth.token_required')], 400);
            }

            $newToken = $this->authService->refreshToken($refreshToken);

            return response()->json([
                'access_token' => $newToken,
                'message' => __('auth.token_refreshed')
            ]);
        } catch (Exception $e) {
            return response()->json(['error' => $e->getMessage()], 401);
        }
    }
}
