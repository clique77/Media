<?php

namespace App\Services\Social;

use App\Actions\Social\PostViewActions\GetPostViewsAction;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Exception;

class PostViewService
{
    public function __construct(
        protected GetPostViewsAction $getPostViewsAction
    ) {
    }

    /**
     * Повертає список переглядів постів поточного користувача.
     *
     * @param int $perPage
     * @return LengthAwarePaginator
     * @throws Exception
     */
    public function getPostViews(int $perPage = 20): LengthAwarePaginator
    {
        return ($this->getPostViewsAction)($perPage);
    }
}
