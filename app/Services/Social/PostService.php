<?php

namespace App\Services\Social;

use App\Actions\Social\PostActions\CreatePostAction;
use App\Actions\Social\PostActions\DeletePostAction;
use App\Actions\Social\PostActions\GetPostAction;
use App\Actions\Social\PostActions\GetPostsAction;
use App\Actions\Social\PostActions\RecommendPostsAction;
use App\Actions\Social\PostActions\UpdatePostAction;
use App\Models\Post;
use Illuminate\Pagination\CursorPaginator;

class PostService
{
    public function __construct(
        protected CreatePostAction $createPostAction,
        protected UpdatePostAction $updatePostAction,
        protected DeletePostAction $deletePostAction,
        protected GetPostAction $getPostAction,
        protected GetPostsAction $getPostsAction,
        protected RecommendPostsAction $recommendPostsAction
    ) {
    }

    public function create(array $data): Post
    {
        return ($this->createPostAction)($data);
    }

    public function update(Post $post, array $data): Post
    {
        return ($this->updatePostAction)($post, $data);
    }

    public function delete(Post $post): void
    {
        ($this->deletePostAction)($post);
    }

    public function getPost(string $identifier): ?Post
    {
        return ($this->getPostAction)($identifier);
    }

    public function getPosts(int $perPage = 10): CursorPaginator
    {
        return ($this->getPostsAction)($perPage);
    }
}


