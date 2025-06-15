<?php

namespace App\Actions\Social\PostActions;

use App\Actions\Filters\RangeFilter;
use App\Models\Post;
use Exception;
use Illuminate\Pagination\CursorPaginator;
use Illuminate\Support\Facades\DB;
use Spatie\QueryBuilder\AllowedFilter;
use Spatie\QueryBuilder\QueryBuilder;

class GetPostsAction
{
    /**
     * Отримує список постів з можливістю фільтрації, сортування та пагінації.
     * Фільтрація включає: user_id, visibility, comments_enabled, title, content, likes_count, comments_count, views_count, updated_at, created_at та tags.
     * Пагінація дозволяє обмежити кількість постів на сторінці.
     *
     * @param int $perPage Кількість постів на сторінці (за замовчуванням 20)
     * @return CursorPaginator Сторінковий результат з постами
     * @throws Exception Якщо виникла помилка під час виконання запиту
     */
    public function __invoke(int $perPage = 10): CursorPaginator
    {
        try {
            $query = $this->buildBaseQuery();

            $this->applyVisibility($query);

            $this->applyFilters($query);

            $this->applySorting($query);

            $posts = $query->cursorPaginate($perPage)->withQueryString();

            $posts->getCollection()->transform(function ($post) {
                $user = auth()->user();
                if ($user) {
                    $like = $post->likes()
                        ->where('user_id', $user->id)
                        ->first();
                    $post->user_liked = !empty($like);
                    $post->like_id = $like ? $like->id : null;
                } else {
                    $post->user_liked = false;
                    $post->like_id = null;
                }
                return $post;
            });

            return $posts;
        } catch (Exception $e) {
            throw new Exception('Помилка під час отримання постів: ' . $e->getMessage());
        }
    }

    /**
     * Створює базовий запит для отримання постів з включенням зв'язків з користувачами та тегами.
     *
     * @return QueryBuilder Повертає побудований запит для Post
     */
    private function buildBaseQuery(): QueryBuilder
    {
        return QueryBuilder::for(Post::class)
            ->with(['user', 'tags']);
    }

    /**
     * Застосовує фільтрацію до запиту. Дозволяється фільтрація по кількох полях.
     * Це включає user_id, visibility, comments_enabled, title, content, likes_count, comments_count, views_count,
     * updated_at, created_at, а також фільтрацію по тегах.
     *
     * @param QueryBuilder $query Запит для моделі Post
     */
    private function applyFilters(QueryBuilder $query): void
    {
        $query->allowedFilters([
            AllowedFilter::partial('user.username'),
            AllowedFilter::exact('visibility'),
            AllowedFilter::exact('comments_enabled'),
            AllowedFilter::partial('title'),
            AllowedFilter::partial('content'),
            AllowedFilter::custom('likes_count', new RangeFilter()),
            AllowedFilter::custom('comments_count', new RangeFilter()),
            AllowedFilter::custom('views_count', new RangeFilter()),
            AllowedFilter::custom('updated_at', new RangeFilter()),
            AllowedFilter::custom('created_at', new RangeFilter()),
            AllowedFilter::callback('tags', function ($query, $value) {
                $query->whereHas('tags', function ($tagQuery) use ($value) {
                    $tagQuery->whereIn('tags.name', (array)$value)
                        ->orWhereIn('tags.slug', (array)$value);
                });
            }),
        ]);
    }

    /**
     * Застосовує сортування до запиту, дозволяючи сортувати за кількома полями.
     * Дозволені поля для сортування: created_at, likes_count, comments_count, views_count.
     *
     * @param QueryBuilder $query Запит для моделі Post
     */
    private function applySorting(QueryBuilder $query): void
    {
        $query->allowedSorts(['created_at', 'likes_count', 'comments_count', 'views_count']);
    }

    /**
     * Застосовує логіку видимості до запиту, враховуючи:
     * 1. Публічні пости доступні для всіх користувачів.
     * 2. Пости користувача доступні тільки йому.
     * 3. Пости доступні друзям, якщо між ними є зв'язок дружби.
     *
     * @param QueryBuilder $query Запит для моделі Post
     */
    private function applyVisibility(QueryBuilder $query): void
    {
        $user = auth()->user();

        $query->where(function ($q) use ($user) {
            // Публічні пости
            $q->where('posts.visibility', 'public');

            if ($user) {
                $q->orWhere('posts.user_id', $user->id);

                $q->orWhere(function ($subQuery) use ($user) {
                    $subQuery->where('posts.visibility', 'friends')
                        ->where(function ($friendCheck) use ($user) {
                            $friendCheck->whereExists(function ($builder) use ($user) {
                                $builder->selectRaw(1)
                                    ->from('friendships')
                                    ->where('status', 'accepted')
                                    ->whereRaw('friendships.user_id = posts.user_id AND friendships.friend_id = ?', [$user->id]);
                            })
                                ->orWhereExists(function ($builder) use ($user) {
                                    $builder->selectRaw(1)
                                        ->from('friendships')
                                        ->where('status', 'accepted')
                                        ->whereRaw('friendships.friend_id = posts.user_id AND friendships.user_id = ?', [$user->id]);
                                });
                        });
                });
            }
        });
    }

}
