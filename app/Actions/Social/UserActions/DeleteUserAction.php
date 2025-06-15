<?php

namespace App\Actions\Social\UserActions;

use App\Models\User;
use Exception;

class DeleteUserAction
{
    /**
     * Видаляє користувача з бази даних.
     *
     * Цей метод видаляє користувача, зберігаючи всі зв'язки, якщо вони є, і підтверджує видалення.
     *
     * @param User $user Об'єкт користувача, якого потрібно видалити
     * @return bool Повертає true, якщо користувач був успішно видалений
     * @throws Exception Якщо сталася помилка під час видалення (наприклад, проблема з базою даних або файлами)
     */
    public function __invoke(User $user): bool
    {
        try {
            $user->delete();
            return true;
        } catch (Exception $e) {
            throw new Exception('Помилка під час видалення користувача. Можлива проблема з файлами або базою даних.');
        }
    }
}
