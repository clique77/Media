<?php

namespace App\Actions\Social\UserActions;

use App\Models\User;
use Exception;
use Illuminate\Support\Facades\Auth;

class GetUserAction
{
    /**
     * Отримує дані користувача.
     *
     * Цей метод отримує дані користувача за ідентифікатором і повертає єдиний набір даних,
     * який є безпечним для всіх користувачів, незалежно від рівня доступу.
     *
     * @param string $identifier Ідентифікатор користувача (ID або username)
     * @return array Масив з даними користувача
     * @throws Exception Якщо користувача не знайдено або сталася помилка
     */
    public function __invoke(string $identifier): array
    {
        try {
            $user = $this->findUserByIdentifier($identifier);

            if (!$user) {
                throw new Exception('Користувача не знайдено.');
            }

            return $this->getUserData($user);
        } catch (Exception $e) {
            throw new Exception('Помилка під час отримання користувача: ' . $e->getMessage());
        }
    }

    /**
     * Знаходить користувача за його ідентифікатором.
     *
     * @param string $identifier Ідентифікатор користувача (ID або username)
     * @return User|null Повертає об'єкт користувача або null, якщо не знайдено
     */
    private function findUserByIdentifier(string $identifier): ?User
    {
        return User::where('id', $identifier)
            ->orWhere('username', $identifier)
            ->first();
    }

    /**
     * Повертає дані користувача.
     *
     * @param User $user Користувач, чию інформацію потрібно повернути
     * @return array Масив з даними користувача, безпечними для всіх
     */
    private function getUserData(User $user): array
    {
        return collect($user->toArray())->except([
            'password',
            'google_id',
            'github_id',
        ])->toArray();
    }
}
