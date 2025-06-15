<?php

namespace App\Services\Social;

use App\Actions\Social\LikeActions\CreateLikeAction;
use App\Actions\Social\LikeActions\DeleteLikeAction;
use App\Actions\Social\LikeActions\GetUserLikesAction;
use App\Models\Comment;
use App\Models\Like;
use App\Models\Movie;
use App\Models\Post;
use Exception;
use Illuminate\Contracts\Pagination\CursorPaginator;

class LikeService
{
    public function __construct(
        protected CreateLikeAction $createLikeAction,
        protected DeleteLikeAction $deleteLikeAction,
        protected GetUserLikesAction $getUserLikesAction,
    ) {
    }

    /**
     * Створює лайк до вказаного об'єкта.
     *
     * @param Movie|Post|Comment $likeable Об'єкт, який лайкають (Post, Comment тощо)
     * @return Like
     * @throws Exception
     */
    public function create(Movie|Post|Comment $likeable): Like
    {
        return ($this->createLikeAction)($likeable);
    }

    /**
     * Видаляє лайк користувача до конкретного об'єкта.
     *
     * @param Like $like
     * @return bool
     * @throws Exception
     */
    public function delete(Like $like): bool
    {
        return ($this->deleteLikeAction)($like);
    }

    /**
     * Отримує всі лайки поточного користувача з фільтрацією та сортуванням.
     *
     * @return CursorPaginator
     * @throws Exception
     */
    public function getUserLikes(): CursorPaginator
    {
        return ($this->getUserLikesAction)();
    }
}
