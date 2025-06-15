<?php

namespace App\Services\Auth;

use App\Models\RefreshToken;
use App\Models\User;
use Carbon\Carbon;
use Exception;
use Tymon\JWTAuth\Exceptions\JWTException;
use Tymon\JWTAuth\Facades\JWTAuth;

class JWTService
{
    /**
     * Створення токена для користувача.
     *
     * @param User $user
     * @return string
     * @throws Exception
     */
    public function createToken(User $user): string
    {
        try {
            return JWTAuth::fromUser($user);
        } catch (JWTException $e) {
            throw new Exception(__('jwt.token_creation_failed'));
        }
    }

    /**
     * Перевірка токена та отримання користувача.
     *
     * @param string $token
     * @return User
     * @throws Exception
     */
    public function authenticate(string $token): User
    {
        try {
            return JWTAuth::setToken($token)->authenticate();
        } catch (JWTException $e) {
            throw new Exception(__('jwt.authentication_failed'));
        }
    }

    /**
     * Логіка для виходу користувача.
     *
     * @return bool
     * @throws Exception
     */
    public function logout(): bool
    {
        try {
            $token = JWTAuth::getToken();
            $user = JWTAuth::authenticate($token);
            $refreshToken = RefreshToken::where('user_id', $user->id)->first();

            if ($refreshToken) {
                $refreshToken->delete();
            }

            JWTAuth::invalidate($token);

            return true;
        } catch (JWTException $e) {
            throw new Exception(__('jwt.logout_failed'));
        }
    }

    /**
     * Оновлення токена.
     *
     * @param string $refreshToken
     * @return string
     * @throws Exception
     */
    public function refreshToken(string $refreshToken): string
    {
        try {
            $token = RefreshToken::where('token', $refreshToken)
                ->where('expires_at', '>', Carbon::now())
                ->first();

            if (!$token) {
                throw new Exception(__('jwt.invalid_refresh_token'));
            }

            JWTAuth::setToken($refreshToken);
            $payload = JWTAuth::getPayload();

            if (!$payload->get('refresh')) {
                throw new Exception(__('jwt.invalid_refresh_token'));
            }

            return JWTAuth::refresh();
        } catch (JWTException $e) {
            throw new Exception(__('jwt.token_refresh_failed'));
        }
    }

    /**
     * @param $user
     * @return string
     * @throws Exception
     */
    public function createRefreshToken($user): string
    {
        try {
            $refreshTTL = config('jwt.refresh_ttl');
            $expirationTime = Carbon::now()->addMinutes($refreshTTL)->timestamp;

            $refreshToken = JWTAuth::claims([
                'refresh' => true,
                'exp' => $expirationTime,
            ])->fromUser($user);

            RefreshToken::create([
                'user_id' => $user->id,
                'token' => $refreshToken,
                'expires_at' => Carbon::createFromTimestamp($expirationTime),
            ]);

            return $refreshToken;
        } catch (JWTException $e) {
            throw new Exception(__('jwt.refresh_token_creation_failed'));
        }
    }
}
