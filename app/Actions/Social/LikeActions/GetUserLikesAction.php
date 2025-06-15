<?php

namespace App\Actions\Social\LikeActions;

use App\Models\Post;
use App\Models\User;
use Exception;
use Illuminate\Contracts\Pagination\CursorPaginator;
use Illuminate\Support\Facades\Auth;
use Spatie\QueryBuilder\AllowedFilter;
use Spatie\QueryBuilder\QueryBuilder;

class GetUserLikesAction
{
    /**
     * Отримує всі лайки поточного користувача з фільтрацією, сортуванням, пагінацією та зв'язаними постами.
     *
     * @return CursorPaginator
     * @throws Exception
     */
    public function __invoke(): CursorPaginator
    {
        try {
            /** @var User $user */
            $user = Auth::user();

            $likes = QueryBuilder::for($user->likes()->with('likeable'))
                ->allowedFilters([
                    AllowedFilter::partial('likeable_type'),
                    AllowedFilter::exact('likeable_id'),
                ])
                ->allowedSorts([
                    'created_at',
                    'likeable_type',
                ])
                ->cursorPaginate(10)
                ->withQueryString();

            $likes->getCollection()->transform(function ($like) use ($user) {
                $likeable = $like->likeable;

                if ($likeable::class === Post::class) {
                    $likeable->loadMissing(['user', 'tags']);
                    $likeable->user_liked = true;
                    $likeable->like_id = $like->id;
                }

                return $like;
            });

            return $likes;
        } catch (Exception $e) {
            throw new Exception('Помилка під час отримання лайків користувача: ' . $e->getMessage());
        }
    }
}
