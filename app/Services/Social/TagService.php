<?php

namespace App\Services\Social;

use App\Actions\Social\TagActions\GetTagsAction;
use Exception;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class TagService
{
    public function __construct(
        protected GetTagsAction $getTagsAction
    ) {
    }

    /**
     * Отримує список тегів.
     *
     * @throws Exception
     */
    public function getTags(int $perPage = 20): LengthAwarePaginator
    {
        return ($this->getTagsAction)($perPage);
    }
}
