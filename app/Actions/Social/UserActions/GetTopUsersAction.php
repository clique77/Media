<?php

namespace App\Actions\Social\UserActions;

use App\Models\User;
use Exception;
use Illuminate\Database\Eloquent\Collection;

class GetTopUsersAction
{
    /**
     * Отримує топ-10 найактивніших користувачів за кількістю поставлених лайків і залишених коментарів.
     *
     * Цей метод підраховує кількість лайків, які користувач поставив іншим постам,
     * і коментарів, які він залишив під іншими постами, сортує за сумарною активністю
     * в порядку спадання і повертає колекцію з 10 найактивніших користувачів.
     * Кожен користувач у результаті містить поля likes_given і comments_given.
     *
     * @return Collection Колекція з 10 користувачів
     * @throws Exception Якщо сталася помилка при отриманні користувачів
     */
    public function __invoke(): Collection
    {
        try {
            return User::query()
                ->select('users.*')
                ->selectRaw('COUNT(likes.id) as likes_given')
                ->selectRaw('COUNT(comments.id) as comments_given')
                ->leftJoin('likes', 'users.id', '=', 'likes.user_id')
                ->leftJoin('comments', 'users.id', '=', 'comments.user_id')
                ->groupBy('users.id')
                ->orderByRaw('COUNT(likes.id) + COUNT(comments.id) DESC')
                ->take(10)
                ->get();
        } catch (Exception $e) {
            throw new Exception('Помилка під час отримання топ-10 користувачів: ' . $e->getMessage());
        }
    }
}
