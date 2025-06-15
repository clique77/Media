<?php

namespace App\Actions\Social\FriendshipActions;

use App\Actions\Filters\RangeFilter;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Spatie\QueryBuilder\AllowedFilter;
use Spatie\QueryBuilder\QueryBuilder;

class GetFriendsAction
{
    /**
     * Отримує список друзів користувача з фільтрацією, сортуванням та пагінацією.
     *
     * @param User $user Користувач, для якого потрібно отримати список друзів
     * @return Collection Пагінований список друзів
     */
    public function __invoke(User $user): Collection
    {
        return
            $this->applySorting(
                $this->applyFilters($user->friends())
            )->get();
    }

    /**
     * Застосовує фільтри до запиту.
     *
     * @param BelongsToMany $query Запит для відношення між користувачами (друзі)
     * @return QueryBuilder Оброблений запит з дозволеними фільтрами
     */
    private function applyFilters(BelongsToMany $query): QueryBuilder
    {
        return QueryBuilder::for($query)->allowedFilters([
            AllowedFilter::exact('country'),
            AllowedFilter::exact('gender'),
            AllowedFilter::exact('is_online'),
            AllowedFilter::custom('birthday', new RangeFilter()),
            AllowedFilter::partial('username'),
            AllowedFilter::partial('first_name'),
            AllowedFilter::partial('last_name'),
        ]);
    }

    /**
     * Застосовує сортування до запиту.
     *
     * @param QueryBuilder $query Запит, до якого буде застосоване сортування
     * @return QueryBuilder Оброблений запит з дозволеними варіантами сортування
     */
    private function applySorting(QueryBuilder $query): QueryBuilder
    {
        return $query->allowedSorts([
            'username',
            'first_name',
            'last_name',
            'birthday',
        ]);
    }
}
