<?php

namespace App\Actions\Social\PostActions;

use App\Models\Post;
use Exception;

class DeletePostAction
{
    /**
     * Видаляє пост з бази даних.
     * У разі помилки, наприклад, при проблемах з файлами або базою даних, генерується виняток.
     *
     * @param Post $post Пост, який потрібно видалити
     * @return bool true, якщо пост успішно видалений
     * @throws Exception Якщо виникла помилка під час видалення поста
     */
    public function __invoke(Post $post): bool
    {
        try {
            $post->delete();
            return true;
        } catch (Exception $e) {
            throw new Exception('Помилка під час видалення поста. Можлива проблема з файлами або базою даних.');
        }
    }
}
