<?php

namespace App\Actions\Social\CommentActions;

use App\Actions\Filters\RangeFilter;
use App\Models\User;
use Exception;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Auth;
use Spatie\QueryBuilder\AllowedFilter;
use Spatie\QueryBuilder\QueryBuilder;

class GetUserCommentsAction
{
    /**
     * Отримує всі коментарі поточного користувача з фільтрацією, сортуванням та пагінацією.
     *
     * @param int $perPage Кількість коментарів на сторінку
     * @return LengthAwarePaginator
     * @throws Exception
     */
    public function __invoke(int $perPage = 20): LengthAwarePaginator
    {
        try {
            /** @var User $user */
            $user = Auth::user();

            $query = QueryBuilder::for($user->comments()->with(['commentable']));

            return $this->applyPagination(
                $this->applySorting(
                    $this->applyFilters($query)
                ),
                $perPage
            );
        } catch (Exception $e) {
            throw new Exception('Помилка під час отримання коментарів користувача: ' . $e->getMessage());
        }
    }

    /**
     * Застосовує фільтри до запиту коментарів.
     *
     * @param QueryBuilder $query Запит до коментарів
     * @return QueryBuilder
     */
    private function applyFilters(QueryBuilder $query): QueryBuilder
    {
        return $query->allowedFilters([
            AllowedFilter::partial('commentable_type'),
            AllowedFilter::custom('created_at', new RangeFilter()),
            AllowedFilter::custom('likes_count', new RangeFilter()),
        ]);
    }

    /**
     * Застосовує сортування до запиту коментарів.
     *
     * @param QueryBuilder $query
     * @return QueryBuilder
     */
    private function applySorting(QueryBuilder $query): QueryBuilder
    {
        return $query->allowedSorts([
            'created_at',
            'likes_count',
        ]);
    }

    /**
     * Застосовує пагінацію до запиту коментарів.
     *
     * @param QueryBuilder $query
     * @param int $perPage
     * @return LengthAwarePaginator
     */
    private function applyPagination(QueryBuilder $query, int $perPage): LengthAwarePaginator
    {
        return $query->paginate($perPage);
    }
}
