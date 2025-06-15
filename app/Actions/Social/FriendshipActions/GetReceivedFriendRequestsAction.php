<?php

namespace App\Actions\Social\FriendshipActions;

use App\Models\User;
use Exception;
use Illuminate\Support\Facades\Auth;
use Spatie\QueryBuilder\QueryBuilder;
use Illuminate\Pagination\LengthAwarePaginator;

class GetReceivedFriendRequestsAction
{
    /**
     * Отримує запити на дружбу, які надійшли користувачу.
     *
     * @param User $user Користувач, для якого отримуються запити на дружбу.
     * @param int $perPage Кількість записів на сторінці (за замовчуванням 20).
     * @return LengthAwarePaginator Сторінковані запити на дружбу.
     * @throws Exception Якщо користувач не автентифікований або сталася інша помилка.
     */
    public function __invoke(User $user, int $perPage = 20): LengthAwarePaginator
    {
        try {
            $this->ensureUserIsAuthenticated($user);

            return $this->applyPagination(
                $this->applySorting(
                    QueryBuilder::for($user->receivedFriendRequests())
                ),
                $perPage
            );
        } catch (Exception $e) {
            throw new Exception('Не вдалося отримати запити на дружбу: ' . $e->getMessage());
        }
    }

    /**
     * Перевіряє, чи є поточний користувач тим, для кого отримуються запити на дружбу.
     *
     * @param User $user Користувач, для якого перевіряються права доступу.
     * @throws Exception Якщо користувач не має прав доступу.
     */
    private function ensureUserIsAuthenticated(User $user): void
    {
        if (Auth::id() !== $user->id) {
            throw new Exception('У вас немає прав для перегляду отриманих запитів на дружбу цього користувача.');
        }
    }

    /**
     * Додає сортування до запиту.
     *
     * @param QueryBuilder $query Запит, до якого додається сортування.
     * @return QueryBuilder Запит із доданим сортуванням.
     */
    private function applySorting(QueryBuilder $query): QueryBuilder
    {
        return $query->allowedSorts([
            'created_at',
        ]);
    }

    /**
     * Додає пагінацію до запиту.
     *
     * @param QueryBuilder $query Запит, до якого додається пагінація.
     * @param int $perPage Кількість записів на сторінці.
     * @return LengthAwarePaginator Пагінований результат запиту.
     */
    private function applyPagination(QueryBuilder $query, int $perPage): LengthAwarePaginator
    {
        return $query->paginate($perPage);
    }
}
