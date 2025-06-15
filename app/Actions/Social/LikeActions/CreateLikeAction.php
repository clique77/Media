<?php

namespace App\Actions\Social\LikeActions;

use App\Enums\NotificationType;
use App\Models\Comment;
use App\Models\Like;
use App\Models\Movie;
use App\Models\Post;
use App\Models\User;
use App\Notifications\Social\Like\LikeReceivedNotification;
use App\Notifications\Social\Post\PostLikedNotification;
use Exception;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Schema;

class CreateLikeAction
{
    /**
     * Додає лайк до сутності (посту, фільму тощо), якщо ще не додано.
     *
     * @param Post|Movie|Comment $likeable
     * @return Like
     * @throws Exception
     */
    public function __invoke(Post|Movie|Comment $likeable): Like
    {
        DB::beginTransaction();

        try {
            $this->ensureCanBeLiked($likeable);

            $existingLike = $this->checkIfAlreadyLiked($likeable);

            if ($existingLike) {
                throw new Exception('Ви вже поставили лайк цій сутності.');
            }

            $like = $likeable->likes()->create([
                'user_id' => Auth::id(),
            ]);

            $this->incrementLikesCountIfApplicable($likeable);

            $this->sendLikeNotificationIfEnabled($likeable, $like);

            DB::commit();

            return $like;
        } catch (Exception $e) {
            DB::rollBack();
            throw new Exception('Помилка під час створення лайка: ' . $e->getMessage());
        }
    }

    /**
     * Збільшує лічильник likes_count у моделі, якщо такий стовпець існує.
     *
     * @param Post|Movie|Comment $likeable
     * @return void
     */
    private function incrementLikesCountIfApplicable(Post|Movie|Comment $likeable): void
    {
        if (Schema::hasColumn($likeable->getTable(), 'likes_count')) {
            $likeable->increment('likes_count');
        }
    }

    /**
     * Перевіряє, чи можна поставити лайк (в залежності від стану сутності).
     *
     * @param Post|Movie|Comment $likeable
     * @throws Exception
     */
    private function ensureCanBeLiked(Post|Movie|Comment $likeable): void
    {
        if (Schema::hasColumn($likeable->getTable(), 'likes_enabled') && !$likeable->likes_enabled) {
            throw new Exception('Лайки вимкнені для цієї сутності.');
        }

        if (Schema::hasColumn($likeable->getTable(), 'visibility')) {
            $this->checkVisibility($likeable);
        }
    }

    /**
     * Перевірка доступності сутності для лайку.
     *
     * @param Post|Movie $likeable
     * @throws Exception
     */
    private function checkVisibility(Post|Movie $likeable): void
    {
        $user = Auth::user();

        if (!Schema::hasColumn($likeable->getTable(), 'user_id')) {
            return;
        }

        switch ($likeable->visibility) {
            case 'private':
                if ($likeable->user_id !== $user->id) {
                    throw new Exception('Тільки власник може поставити лайк.');
                }
                break;

            case 'friends':
                if ($likeable->user_id !== $user->id && !$user->isFriendWith($likeable->user_id)) {
                    throw new Exception('Лайк можуть ставити лише друзі.');
                }
                break;
        }
    }

    /**
     * Перевіряє, чи вже існує лайк.
     *
     * @param Post|Movie|Comment $likeable
     * @return Like|null
     */
    private function checkIfAlreadyLiked(Post|Movie|Comment $likeable): ?Like
    {
        return Like::where('user_id', Auth::id())
            ->where('likeable_id', $likeable->getKey())
            ->where('likeable_type', $likeable->getMorphClass())
            ->first();
    }

    /**
     * Надсилає сповіщення автору сутності, якщо дозволено.
     *
     * @param Post|Movie|Comment $likeable
     * @param Like $like
     */
    private function sendLikeNotificationIfEnabled(Post|Movie|Comment $likeable, Like $like): void
    {
        if (!Schema::hasColumn($likeable->getTable(), 'user_id')) {
            return;
        }

        $author = User::find($likeable->user_id);

        if (!$author || $author->id === Auth::id()) {
            return;
        }

        if ($author->settings->getNotificationEnabled(NotificationType::POST_LIKE)) {
            $author->notify(new PostLikedNotification($like));
        }
    }
}
