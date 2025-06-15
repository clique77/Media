<?php

namespace App\Http\Controllers\Social;

use App\Http\Controllers\Controller;
use App\Models\Comment;
use App\Models\Like;
use App\Models\Movie;
use App\Models\Post;
use App\Services\Social\LikeService;
use Exception;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response as ResponseCode;

class LikeController extends Controller
{
    use AuthorizesRequests;

    public function __construct(protected LikeService $likeService)
    {
    }

    /**
     * Додає лайк до поста, фільму або коментаря.
     *
     * @throws AuthorizationException
     */
    public function store(Request $request, string $likeable_type, Movie|Post|Comment $likeable): JsonResponse
    {
        $this->authorize('create', Like::class);

        try {
            $like = $this->likeService->create($likeable);

            return response()->json([
                'message' => 'Лайк успішно поставлено',
                'like' => $like,
            ], ResponseCode::HTTP_CREATED);
        } catch (Exception $e) {
            return response()->json([
                'error' => $e->getMessage(),
            ], ResponseCode::HTTP_BAD_REQUEST);
        }
    }

    /**
     * Видаляє лайк.
     *
     * @throws AuthorizationException
     */
    public function destroy(Request $request, Like $like): JsonResponse
    {
        $this->authorize('delete', $like);

        try {
            $this->likeService->delete($like);

            return response()->json([
                'message' => 'Лайк успішно видалено',
            ], ResponseCode::HTTP_NO_CONTENT);
        } catch (Exception $e) {
            return response()->json([
                'error' => $e->getMessage(),
            ], ResponseCode::HTTP_BAD_REQUEST);
        }
    }

    public function userLikes(): JsonResponse
    {
        try {
            $likes = $this->likeService->getUserLikes();

            return response()->json([
                'data' => $likes,
            ]);
        } catch (Exception $e) {
            return response()->json([
                'error' => $e->getMessage(),
            ], $e->getCode() ?: 500);
        }
    }
}
