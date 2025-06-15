<?php

namespace App\Services\Auth;

use App\Events\Social\User\UserRegisteredEvent;
use App\Models\User;
use Carbon\Carbon;
use Exception;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;
use Symfony\Component\HttpFoundation\RedirectResponse;
use voku\helper\ASCII;

class OAuth2Service
{
    public function __construct(private JWTService $jwtService)
    {
    }

    /**
     * Redirect на Google для авторизації.
     */
    public function redirectToGoogle(): RedirectResponse|\Illuminate\Http\RedirectResponse
    {
        return Socialite::driver('google')->stateless()->redirect();
    }

    /**
     * Callback після авторизації через Google.
     *
     * @throws Exception
     */
    public function handleGoogleCallback(): array
    {
        try {
            $googleUser = Socialite::driver('google')->stateless()->user();
        } catch (Exception $e) {
            throw new Exception(__('auth.google_data_failed'));
        }

        $user = $this->findOrCreateUser($googleUser, 'google');

        $accessToken = $this->jwtService->createToken($user);

        $refreshToken = $this->jwtService->createRefreshToken($user);

        return [
            'access_token' => $accessToken,
            'refresh_token' => $refreshToken,
        ];
    }

    /**
     * Redirect на GitHub для авторизації.
     */
    public function redirectToGitHub(): RedirectResponse|\Illuminate\Http\RedirectResponse
    {
        return Socialite::driver('github')->stateless()->redirect();
    }

    /**
     * Callback після авторизації через GitHub.
     *
     * @throws Exception
     */
    public function handleGitHubCallback(): array
    {
        try {
            $gitHubUser = Socialite::driver('github')->stateless()->user();
        } catch (Exception $e) {
            throw new Exception(__('auth.github_data_failed'));
        }

        $user = $this->findOrCreateUser($gitHubUser, 'github');

        $accessToken = $this->jwtService->createToken($user);

        $refreshToken = $this->jwtService->createRefreshToken($user);

        return [
            'access_token' => $accessToken,
            'refresh_token' => $refreshToken,
        ];
    }

    /**
     * Знайти або створити користувача в базі даних.
     */
    private function findOrCreateUser($socialUser, $provider): User
    {
        $user = User::where($provider . '_id', $socialUser->getId())->first();

        if (!$user) {
            $user = User::where('email', $socialUser->getEmail())->first();

            if ($user) {
                $user->update([
                    $provider . '_id' => $socialUser->getId(),
                ]);
            } else {
                $username = $this->getUsernameFromSocialUser($socialUser, $provider);

                if (!$username) {
                    $username = $this->generateUniqueUsername($socialUser->getName());
                }

                $user = User::create([
                    'username' => $username,
                    'email' => $socialUser->getEmail(),
                    'avatar' => $socialUser->getAvatar() ?? asset('storage/avatars/default-avatar.png'),
                    $provider . '_id' => $socialUser->getId(),
                    'password' => bcrypt(Str::random(16)),
                ]);

                $user->markEmailAsVerified();

                event(new UserRegisteredEvent($user));
            }
        }

        return $user;
    }

    /**
     * Отримує username від соціального провайдера, якщо доступний.
     *
     * @param mixed $socialUser
     * @param string $provider
     * @return string|null
     */
    private function getUsernameFromSocialUser(mixed $socialUser, string $provider): ?string
    {
        switch ($provider) {
            case 'github':
                $username = $socialUser->getNickname();
                return $username ? $this->ensureUniqueUsername($username) : null;
            default:
                return null;
        }
    }

    /**
     * Генерує унікальний username на основі імені.
     *
     * @param string $name
     * @return string
     */
    private function generateUniqueUsername(string $name): string
    {
        $baseUsername = ASCII::to_ascii($name);
        $baseUsername = Str::slug($baseUsername, '');
        $baseUsername = strtolower($baseUsername);

        if (empty($baseUsername)) {
            $baseUsername = 'user';
        }

        if (!User::where('username', $baseUsername)->exists()) {
            return $baseUsername;
        }

        do {
            $randomDigits = rand(100, 999);
            $username = $baseUsername . $randomDigits;
        } while (User::where('username', $username)->exists());

        return $username;
    }

    /**
     * Забезпечує унікальність username, додаючи цифри при необхідності.
     *
     * @param string $username
     * @return string
     */
    private function ensureUniqueUsername(string $username): string
    {
        $baseUsername = Str::slug($username, '');
        $baseUsername = strtolower($baseUsername);

        if (!User::where('username', $baseUsername)->exists()) {
            return $baseUsername;
        }

        do {
            $randomDigits = rand(100, 999);
            $newUsername = $baseUsername . $randomDigits;
        } while (User::where('username', $newUsername)->exists());

        return $newUsername;
    }
}
