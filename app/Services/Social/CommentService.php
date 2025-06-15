<?php

namespace App\Services\Social;

use App\Actions\Social\CommentActions\CreateCommentAction;
use App\Actions\Social\CommentActions\DeleteCommentAction;
use App\Actions\Social\CommentActions\GetCommentAction;
use App\Actions\Social\CommentActions\GetCommentRepliesAction;
use App\Actions\Social\CommentActions\GetCommentsAction;
use App\Actions\Social\CommentActions\GetUserCommentsAction;
use App\Actions\Social\CommentActions\UpdateCommentAction;
use App\Models\Comment;
use App\Models\Movie;
use App\Models\Post;
use Exception;
use Illuminate\Contracts\Pagination\CursorPaginator;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class CommentService
{
    public function __construct(
        protected CreateCommentAction $createCommentAction,
        protected DeleteCommentAction $deleteCommentAction,
        protected GetCommentAction $getCommentAction,
        protected GetCommentsAction $getCommentsAction,
        protected GetUserCommentsAction $getUserCommentsAction,
        protected UpdateCommentAction $updateCommentAction,
        protected GetCommentRepliesAction $getCommentRepliesAction,
    ) {
    }

    /**
     * Створює новий коментар.
     *
     * @throws Exception
     */
    public function create(array $data, Movie|Post $commentable): Comment
    {
        return ($this->createCommentAction)($data, $commentable);
    }

    /**
     * Видаляє переданий коментар.
     *
     * @throws Exception
     */
    public function delete(Comment $comment): void
    {
        ($this->deleteCommentAction)($comment);
    }

    /**
     * Отримує один коментар за його ID.
     *
     * @throws Exception
     */
    public function getComment(string $commentId): ?Comment
    {
        return ($this->getCommentAction)($commentId);
    }

    /**
     * Отримує список коментарів з пагінацією.
     *
     * @throws Exception
     */
    public function getComments(Movie|Post $commentable, int $perPage = 20): CursorPaginator
    {
        return ($this->getCommentsAction)($commentable, $perPage);
    }

    /**
     * @throws Exception
     */
    public function getUserComments(int $perPage = 20): LengthAwarePaginator
    {
        return ($this->getUserCommentsAction)($perPage);
    }

    /**
     * Оновлює дані коментаря.
     *
     * @throws Exception
     */
    public function update(Comment $comment, array $data): Comment
    {
        return ($this->updateCommentAction)($comment, $data);
    }

    /**
     * Отримує відповіді на коментар.
     *
     * @throws Exception
     */
    public function getReplies(Comment $comment, int $perPage = 20): CursorPaginator
    {
        return ($this->getCommentRepliesAction)($comment, $perPage);
    }
}
