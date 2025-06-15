<?php

namespace App\Actions\Social\CommentActions;

use App\Enums\PostVisibility;
use App\Models\Comment;
use App\Models\Movie;
use App\Models\Post;
use App\Models\User;
use Exception;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Schema;

class GetCommentAction
{
    /**
     * Отримує коментар разом з його відповідями та частковою інформацією про користувача.
     * Враховує видимість пов’язаного поста або фільму.
     *
     * @param string $commentId
     * @return Comment|null
     * @throws Exception
     */
    public function __invoke(string $commentId): ?Comment
    {
        try {
            $userId = Auth::id();

            $comment = Comment::with([
                'user:id,username,first_name,last_name,avatar',
                'replies.user:id,username,first_name,last_name,avatar,is_online',
                'replies.likes' => function ($query) use ($userId) {
                    if ($userId) {
                        $query->where('user_id', $userId);
                    }
                },
                'commentable',
                'likes' => function ($query) use ($userId) {
                    if ($userId) {
                        $query->where('user_id', $userId);
                    }
                },
            ])->withCount('replies')->find($commentId);

            if (!$comment) {
                return null;
            }

            $this->checkVisibility($comment);

            $comment->user_liked = $userId && $comment->likes->isNotEmpty();
            $comment->like_id = $userId && $comment->likes->isNotEmpty() ? $comment->likes->first()->id : null;
            $comment->unsetRelation('likes');

            foreach ($comment->replies as $reply) {
                $reply->user_liked = $userId && $reply->likes->isNotEmpty();
                $reply->like_id = $userId && $reply->likes->isNotEmpty() ? $reply->likes->first()->id : null;
                $reply->unsetRelation('likes');
            }

            return $comment;
        } catch (Exception $e) {
            throw new Exception('Помилка при отриманні коментаря: ' . $e->getMessage());
        }
    }

    /**
     * Перевіряє, чи користувач має доступ до перегляду коментаря на основі видимості поста/фільму.
     *
     * @param Comment $comment
     * @throws Exception
     */
    private function checkVisibility(Comment $comment): void
    {
        /** @var User $user */
        $user = Auth::user();

        $commentable = $comment->commentable;

        if (!Schema::hasColumn($commentable->getTable(), 'visibility') || !Schema::hasColumn($commentable->getTable(), 'user_id')) {
            return;
        }

        switch ($commentable->visibility) {
            case PostVisibility::PRIVATE->value:
                if ($commentable->user_id !== $user->id) {
                    throw new Exception('Тільки власник може переглядати цей коментар.');
                }
                break;

            case PostVisibility::FRIENDS->value:
                if ($commentable->user_id !== $user->id && !$user->isFriendWith($commentable->user_id)) {
                    throw new Exception('Коментар можуть переглядати лише друзі власника.');
                }
                break;
        }
    }
}
