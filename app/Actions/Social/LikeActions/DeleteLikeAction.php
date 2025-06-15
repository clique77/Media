<?php

namespace App\Actions\Social\LikeActions;

use App\Models\Like;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use Exception;
use Illuminate\Support\Facades\Schema;

class DeleteLikeAction
{
    /**
     * Видаляє переданий лайк з використанням транзакції та обробкою винятків.
     *
     * Цей метод видаляє конкретний лайк з бази даних в рамках транзакції. Якщо операція не вдається,
     * буде здійснено відкат транзакції, і буде викинуто виключення з повідомленням про помилку.
     *
     * @param Like $like Лайк, який необхідно видалити.
     * @return bool Повертає `true`, якщо видалення було успішним.
     * @throws Exception Якщо сталася помилка під час видалення лайка.
     */
    public function __invoke(Like $like): bool
    {
        DB::beginTransaction();

        try {
            $likeable = $like->likeable;

            $like->delete();

            if ($likeable) {
                $this->decrementLikesCountIfApplicable($likeable);
            }

            DB::commit();
            return true;
        } catch (Exception $e) {
            DB::rollBack();

            throw new Exception('Помилка під час видалення лайка: ' . $e->getMessage());
        }
    }

    /**
     * Зменшує лічильник likes_count у моделі, якщо така властивість існує.
     *
     * @param Model $likeable
     * @return void
     */
    private function decrementLikesCountIfApplicable(Model $likeable): void
    {
        if (Schema::hasColumn($likeable->getTable(), 'likes_count')) {
            $likeable->decrement('likes_count');
        }
    }
}
