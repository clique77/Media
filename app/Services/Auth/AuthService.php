<?php

namespace App\Services\Auth;

use App\Events\Social\User\UserRegisteredEvent;
use App\Models\User;
use Exception;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class AuthService
{
    public function __construct(private JWTService $jwtService)
    {
    }

    /**
     * Реєстрація нового користувача та створення JWT токенів.
     * Після успішної реєстрації, генерується access та refresh токени.
     * Також відправляється подія про реєстрацію та повідомлення для підтвердження email.
     * Якщо операція реєстрації не вдається, транзакція відкочується.
     *
     * @param string $username Ім'я користувача.
     * @param string $email Електронна пошта користувача.
     * @param string $password Пароль користувача.
     * @return array Масив, що містить access_token та refresh_token.
     * @throws Exception Якщо під час реєстрації виникла помилка (наприклад, не вдалося зберегти користувача в базу).
     */
    public function register(string $username, string $email, string $password): array
    {
        DB::beginTransaction();
        try {
            $user = User::create([
                'username' => $username,
                'email' => $email,
                'password' => Hash::make($password),
            ]);

            if (!$user) {
                throw new Exception(__('auth.user_save_failed'));
            }

            $accessToken = $this->jwtService->createToken($user);
            $refreshToken = $this->jwtService->createRefreshToken($user);

            event(new UserRegisteredEvent($user));

            $user->sendEmailVerificationNotification();

            DB::commit();

            return [
                'access_token' => $accessToken,
                'refresh_token' => $refreshToken,
                'user' => $user->fresh(),
            ];
        } catch (Exception $e) {
            DB::rollBack();
            throw new Exception('Помилка під час реєстрації: ' . $e->getMessage());
        }
    }

    /**
     * Логіка для входу користувача в систему та створення JWT токенів.
     * Після успішного входу генеруються access та refresh токени.
     * Якщо користувач не знайдений або пароль неправильний, буде кинута помилка.
     *
     * @param string $email Електронна пошта користувача.
     * @param string $password Пароль користувача.
     * @return array Масив, що містить access_token та refresh_token.
     * @throws Exception Якщо користувача не знайдено або пароль неправильний.
     */
    public function login(string $email, string $password): array
    {
        try {
            $user = User::where('email', $email)->first();

            if (!$user || !Hash::check($password, $user->password)) {
                throw new Exception(__('auth.invalid_login'));
            }

            $accessToken = $this->jwtService->createToken($user);

            $refreshToken = $this->jwtService->createRefreshToken($user);

            return [
                'access_token' => $accessToken,
                'refresh_token' => $refreshToken,
                'user' => $user,
            ];
        } catch (Exception $e) {
            throw new Exception('Помилка під час входу в обліковий запис: ' . $e->getMessage());
        }
    }

    /**
     * Логіка для виходу користувача з системи.
     * Видаляє JWT токен для поточного користувача.
     *
     * @return bool Повертає true, якщо вихід був успішним, і false в іншому випадку.
     * @throws Exception Якщо виникає помилка під час виконання операції.
     */
    public function logout(): bool
    {
        return $this->jwtService->logout();
    }

    /**
     * Оновлення JWT токена.
     * Використовується для отримання нового access токену на основі refresh токену.
     *
     * @param string $token Refresh токен для отримання нового access токену.
     * @return string Новий access токен.
     * @throws Exception Якщо виникає помилка під час оновлення токену.
     */
    public function refreshToken(string $token): string
    {
        return $this->jwtService->refreshToken($token);
    }
}
