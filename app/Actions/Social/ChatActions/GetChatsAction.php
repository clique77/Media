<?php

namespace App\Actions\Social\ChatActions;

use App\Models\Chat;
use Exception;
use Illuminate\Contracts\Pagination\CursorPaginator;
use Spatie\QueryBuilder\QueryBuilder;
use Spatie\QueryBuilder\AllowedFilter;
use Illuminate\Database\Eloquent\Builder;

class GetChatsAction
{
    /**
     * Отримує список чатів для поточного користувача з можливістю фільтрації і сортування.
     * Підтримує пагінацію.
     *
     * @param int $perPage Кількість чатів на сторінці
     * @return CursorPaginator Пагіновані результати чатів
     * @throws Exception Якщо виникає помилка під час отримання чатів
     */
    public function __invoke(int $perPage = 20): CursorPaginator
    {
        try {
            $query = $this->buildBaseQuery();

            $this->applyFilters($query);
            $this->applySorting($query);

            if (!request()->has('sort')) {
                $query->orderByDesc('last_message_at');
            }

            return $query
                ->cursorPaginate($perPage)
                ->withQueryString();
        } catch (Exception $e) {
            throw new Exception('Помилка під час отримання чатів: ' . $e->getMessage());
        }
    }

    /**
     * Створює базовий запит для отримання чатів для поточного користувача.
     *
     * @return QueryBuilder Об'єкт запиту для чатів
     */
    private function buildBaseQuery(): QueryBuilder
    {
        $user = auth()->user();

        return QueryBuilder::for(Chat::class)
            ->with([
                'userOne:id,username,avatar,is_online,last_seen_at',
                'userTwo:id,username,avatar,is_online,last_seen_at'
            ])
            ->where(function ($query) use ($user) {
                $query->where('user_one_id', $user->id)
                    ->orWhere('user_two_id', $user->id);
            });
    }

    /**
     * Додає сортування за останнім повідомленням і за датою створення чату.
     *
     * @param QueryBuilder $query Об'єкт запиту для чатів
     */
    private function applySorting(QueryBuilder $query): void
    {
        $query->allowedSorts(['last_message_at', 'created_at']);
    }

    /**
     * Додає фільтрацію для пошуку за username співрозмовника.
     *
     * @param QueryBuilder $query Об'єкт запиту для чатів
     */
    private function applyFilters(QueryBuilder $query): void
    {
        $query->allowedFilters([
            AllowedFilter::callback('userTwo.username', function (Builder $query, $value) {
                $query->where(function (Builder $query) use ($value) {
                    $query->whereHas('userOne', function (Builder $subQuery) use ($value) {
                        $subQuery->where('username', 'LIKE', '%' . $value . '%')
                            ->orWhere('first_name', 'LIKE', '%' . $value . '%')
                            ->orWhere('last_name', 'LIKE', '%' . $value . '%');
                    })->orWhereHas('userTwo', function (Builder $subQuery) use ($value) {
                        $subQuery->where('username', 'LIKE', '%' . $value . '%')
                            ->orWhere('first_name', 'LIKE', '%' . $value . '%')
                            ->orWhere('last_name', 'LIKE', '%' . $value . '%');
                    });
                });
            }),
        ]);
    }
}
