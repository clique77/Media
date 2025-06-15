<?php

namespace App\Actions\Social\PostActions;

use App\Enums\PostVisibility;
use App\Models\Post;
use App\Models\PostView;
use Exception;

class GetPostAction
{
    /**
     * Отримує пост за заданим ідентифікатором та обробляє перегляд поста для зареєстрованого користувача.
     * Якщо користувач ще не переглядав цей пост, записується новий перегляд та збільшується лічильник переглядів.
     *
     * @param string $identifier Ідентифікатор поста (ID або slug)
     * @return Post|null Повертає пост, якщо він знайдений, або null, якщо пост не існує
     * @throws Exception Якщо виникла помилка під час отримання поста з бази даних або під час обробки доступу
     */
    public function __invoke(string $identifier): ?Post
    {
        try {
            $post = $this->findPostByIdentifier($identifier);

            if (!$post) {
                return null;
            }

            $this->checkVisibility($post);

            $user = auth()->user();
            $post->user_liked = $user && $post->likes()->where('user_id', $user->id)->exists();
            $post->like_id = $user ? $post->likes()->where('user_id', $user->id)->value('id') : null;

            if (auth()->check()) {
                $this->handlePostView($post);
            }

            return $post;
        } catch (Exception $e) {
            throw new Exception(
                'Помилка під час отримання поста. ' . $e->getMessage(),
            );
        }
    }

    /**
     * Знаходить пост за ідентифікатором (ID або slug).
     *
     * @param string $identifier Ідентифікатор поста
     * @return Post|null Повертає пост, якщо знайдений, або null
     */
    private function findPostByIdentifier(string $identifier): ?Post
    {
        return Post::with(['user', 'tags'])
            ->where(function ($query) use ($identifier) {
                $query->where('id', $identifier)
                    ->orWhere('slug', $identifier);
            })
            ->first();
    }

    /**
     * Обробляє перегляд поста для авторизованого користувача, якщо це перший перегляд.
     * Якщо пост ще не був переглянутий користувачем, зберігається новий перегляд та збільшується лічильник переглядів.
     *
     * @param Post $post Пост, який переглядається
     * @return void
     */
    private function handlePostView(Post $post): void
    {
        $user = auth()->user();

        if (!$this->hasUserViewedPost($post->id, $user->id)) {
            $this->recordPostView($post->id, $user->id);
            $post->increment('views_count');
        }
    }

    /**
     * Перевіряє, чи користувач вже переглядав пост.
     *
     * @param string $postId Ідентифікатор поста
     * @param string $userId Ідентифікатор користувача
     * @return bool true, якщо пост вже був переглянутий користувачем
     */
    private function hasUserViewedPost(string $postId, string $userId): bool
    {
        return PostView::where('post_id', $postId)
            ->where('user_id', $userId)
            ->exists();
    }

    /**
     * Записує новий перегляд поста для користувача.
     *
     * @param string $postId Ідентифікатор поста
     * @param string $userId Ідентифікатор користувача
     * @return void
     */
    private function recordPostView(string $postId, string $userId): void
    {
        PostView::create([
            'post_id' => $postId,
            'user_id' => $userId,
            'viewed_at' => now(),
        ]);
    }

    /**
     * Перевіряє доступ користувача до перегляду поста згідно з його видимістю.
     *
     * @param Post $post
     * @throws Exception Якщо користувач не має доступу до поста
     */
    private function checkVisibility(Post $post): void
    {
        $user = auth()->user();

        switch ($post->visibility) {
            case PostVisibility::PRIVATE->value:
                if (!$user || $post->user_id !== $user->id) {
                    throw new Exception('Цей пост доступний лише власнику.');
                }
                break;

            case PostVisibility::FRIENDS->value:
                if (!$user || ($post->user_id !== $user->id && !$user->isFriendWith($post->user_id))) {
                    throw new Exception('Цей пост доступний лише друзям автора.');
                }
                break;
        }
    }
}
