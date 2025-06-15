<?php

namespace App\Http\Controllers\Social;

use App\Http\Controllers\Controller;
use App\Http\Requests\Social\PostRequests\CreatePostRequest;
use App\Http\Requests\Social\PostRequests\UpdatePostRequest;
use App\Models\Post;
use App\Services\Social\PostService;
use Exception;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PostController extends Controller
{
    use AuthorizesRequests;

    /**
     * Constructor to initialize PostService.
     *
     * @param PostService $postService
     */
    public function __construct(protected PostService $postService)
    {
    }

    /**
     * Store a new post.
     *
     * @param CreatePostRequest $request
     * @return JsonResponse
     * @throws AuthorizationException
     */
    public function store(CreatePostRequest $request): JsonResponse
    {
        $this->authorize('create', Post::class);

        try {
            $post = $this->postService->create($request->validated());

            return response()->json([
                'message' => 'Пост успішно створено.',
                'data' => $post,
            ], 201);
        } catch (Exception $e) {
            return response()->json([
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Show a specific post.
     *
     * @param string $identifier
     * @return JsonResponse
     */
    public function show(string $identifier): JsonResponse
    {
        try {
            $post = $this->postService->getPost($identifier);

            if (!$post) {
                return response()->json([
                    'error' => 'Пост не знайдено.',
                ], 404);
            }

            return response()->json([
                'data' => $post,
            ]);
        } catch (Exception $e) {
            return response()->json([
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update a specific post.
     *
     * @param UpdatePostRequest $request
     * @param Post $post
     * @return JsonResponse
     * @throws AuthorizationException
     */
    public function update(UpdatePostRequest $request, Post $post): JsonResponse
    {
        $this->authorize('update', $post);

        try {
            $updatedPost = $this->postService->update($post, $request->validated());

            return response()->json([
                'message' => 'Пост успішно оновлено.',
                'data' => $updatedPost,
            ]);
        } catch (Exception $e) {
            return response()->json([
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Delete a specific post.
     *
     * @param Post $post
     * @return JsonResponse
     * @throws AuthorizationException
     */
    public function destroy(Post $post): JsonResponse
    {
        $this->authorize('delete', $post);

        try {
            $this->postService->delete($post);

            return response()->json([
                'message' => 'Пост успішно видалено.',
            ]);
        } catch (Exception $e) {
            return response()->json([
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get a list of posts.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $perPage = $request->get('perPage', 20);

            $posts = $this->postService->getPosts($perPage);

            return response()->json($posts);
        } catch (Exception $e) {
            return response()->json([
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
