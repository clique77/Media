<?php

namespace App\Actions\Social\PostViewActions;

use App\Actions\Filters\RangeFilter;
use App\Models\PostView;
use Illuminate\Support\Facades\Auth;
use Spatie\QueryBuilder\QueryBuilder;
use Spatie\QueryBuilder\AllowedFilter;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Exception;

class GetPostViewsAction
{
    /**
     * Повертає список переглядів постів поточного користувача.
     *
     * @param int $perPage Кількість записів на сторінку
     * @return LengthAwarePaginator
     * @throws Exception
     */
    public function __invoke(int $perPage = 20): LengthAwarePaginator
    {
        try {
            $user = Auth::user();

            return QueryBuilder::for(PostView::class)
                ->where('user_id', $user->id)
                ->with('post')
                ->allowedFilters([
                    AllowedFilter::partial('post.title'),
                    AllowedFilter::exact('post_id'),
                    AllowedFilter::custom('created_at', new RangeFilter()),
                ])
                ->allowedSorts(['created_at'])
                ->cursorPaginate($perPage)
                ->withQueryString();
        } catch (Exception $e) {
            throw new Exception('Сталася помилка при отриманні переглядів постів.');
        }
    }
}
