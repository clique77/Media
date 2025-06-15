<?php

namespace App\Actions\Social\ReportActions;

use App\Actions\Filters\RangeFilter;
use App\Models\Report;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Auth;
use Spatie\QueryBuilder\QueryBuilder;
use Spatie\QueryBuilder\AllowedFilter;
use Exception;

class GetReportsAction
{
    /**
     * Повертає список репортів, створених поточним користувачем,
     * з фільтрацією, сортуванням та пагінацією.
     *
     * @param int $perPage Кількість елементів на сторінку
     * @return LengthAwarePaginator
     * @throws Exception
     */
    public function __invoke(int $perPage = 20): LengthAwarePaginator
    {
        try {
            return QueryBuilder::for(Report::class)
                ->where('user_id', Auth::id())
                ->with(['post'])
                ->allowedFilters([
                    AllowedFilter::partial('reason'),
                    AllowedFilter::partial('post.title'),
                    AllowedFilter::custom('created_at', new RangeFilter()),
                ])
                ->allowedSorts(['created_at'])
                ->paginate($perPage)
                ->withQueryString();
        } catch (Exception $e) {
            throw new Exception('Сталася помилка при завантаженні списку ваших репортів.');
        }
    }
}
