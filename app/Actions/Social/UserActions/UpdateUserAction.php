<?php

namespace App\Actions\Social\UserActions;

use App\Models\User;
use Exception;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use App\Facades\Files\FileFacade;

class UpdateUserAction
{
    /**
     * Оновлює дані користувача з новими значеннями.
     *
     * Цей метод оновлює дані користувача, застосовуючи транзакцію бази даних для забезпечення
     * цілісності. У разі помилки під час оновлення транзакція буде скасована.
     *
     * @param User $user Користувач, дані якого потрібно оновити
     * @param array $data Масив з новими даними для оновлення
     * @return User Оновлений користувач
     * @throws Exception Якщо сталася помилка під час оновлення користувача
     */
    public function __invoke(User $user, array $data): User
    {
        DB::beginTransaction();

        try {
            if (isset($data['avatar']) && $data['avatar'] instanceof UploadedFile) {
                if ($user->avatar) {
                    FileFacade::deleteFile($user->avatar);
                }
                $avatarPath = FileFacade::saveFile($data['avatar'], 'avatars');
                $data['avatar'] = '/storage/' . $avatarPath;
            } else {
                $data['avatar'] = $user->avatar;
            }

            $this->updateUser($user, $data);

            DB::commit();

            return $user;
        } catch (Exception $e) {
            DB::rollBack();
            throw new Exception('Не вдалося оновити користувача: ' . $e->getMessage());
        }
    }

    /**
     * Оновлює дані користувача.
     *
     * Цей метод фактично виконує оновлення даних користувача за допомогою методу `update()`.
     *
     * @param User $user Користувач, дані якого потрібно оновити
     * @param array $data Масив з новими даними для оновлення
     * @return void
     */
    private function updateUser(User $user, array $data): void
    {
        $user->update($this->prepareUpdateUserData($user, $data));
    }

    /**
     * Підготовка даних для оновлення користувача.
     *
     * Цей метод формує масив з новими даними користувача, зберігаючи існуючі значення,
     * якщо нові не надані.
     *
     * @param User $user Користувач, дані якого потрібно оновити
     * @param array $data Масив з новими даними для оновлення
     * @return array Підготовлений масив даних для оновлення
     */
    private function prepareUpdateUserData(User $user, array $data): array
    {
        return [
            'username' => $data['username'] ?? $user->username,
            'first_name' => $data['first_name'] ?? $user->first_name,
            'last_name' => $data['last_name'] ?? $user->last_name,
            'avatar' => $data['avatar'] ?? $user->avatar,
            'gender' => $data['gender'] ?? $user->gender,
            'biography' => $data['biography'] ?? $user->biography,
            'birthday' => $data['birthday'] ?? $user->birthday,
            'country' => $data['country'] ?? $user->country,
            'is_online' => $data['is_online'] ?? $user->is_online,
            'last_seen_at' => $data['last_seen_at'] ?? $user->last_seen_at,
        ];
    }

}
