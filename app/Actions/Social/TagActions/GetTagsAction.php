<?php

namespace App\Actions\Social\TagActions;

use App\Actions\Filters\RangeFilter;
use App\Models\Tag;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Spatie\QueryBuilder\QueryBuilder;
use Spatie\QueryBuilder\AllowedFilter;
use Exception;

class GetTagsAction
{
    /**
     * Повертає список тегів з фільтрацією, сортуванням та пагінацією.
     *
     * @param int $perPage Кількість елементів на сторінку
     * @return LengthAwarePaginator
     * @throws Exception
     */
    public function __invoke(int $perPage = 20): LengthAwarePaginator
    {
        try {
            return QueryBuilder::for(Tag::class)
                ->withCount('posts')
                ->allowedFilters([
                    AllowedFilter::partial('name'),
                    AllowedFilter::custom('created_at', new RangeFilter()),
                ])
                ->allowedSorts(['created_at', 'name', 'posts_count'])
                ->paginate(20);
        } catch (Exception $e) {
            throw new Exception('Сталася помилка при завантаженні тегів.');
        }
    }
}
