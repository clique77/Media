<?php

namespace App\Actions\Social\CommentActions;

use App\Models\Comment;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use Exception;
use Illuminate\Support\Facades\Schema;

class DeleteCommentAction
{
    /**
     * Видаляє переданий коментар з використанням транзакції та обробкою винятків.
     *
     * Цей метод видаляє конкретний коментар з бази даних в рамках транзакції. Якщо операція не вдається,
     * буде здійснено відкат транзакції, і буде викинуто виключення з повідомленням про помилку.
     *
     * @param Comment $comment Коментар, який необхідно видалити.
     * @return bool Повертає `true`, якщо видалення було успішним.
     * @throws Exception Якщо сталася помилка під час видалення коментаря.
     */
    public function __invoke(Comment $comment): bool
    {
        DB::beginTransaction();

        try {
            $commentable = $comment->commentable;

            $comment->delete();

            if ($commentable) {
                $this->decrementLikesCountIfApplicable($commentable);
            }

            DB::commit();
            return true;
        } catch (Exception $e) {
            DB::rollBack();

            throw new Exception('Помилка під час видалення коментаря: ' . $e->getMessage());
        }
    }

    /**
     * Зменшує лічильник likes_count у моделі, якщо така властивість існує.
     *
     * @param Model $commentable
     * @return void
     */
    private function decrementLikesCountIfApplicable(Model $commentable): void
    {
        if (Schema::hasColumn($commentable->getTable(), 'comments_count')) {
            $commentable->decrement('comments_count');
        }
    }
}
