<?php

namespace App\Http\Controllers\Social;

use App\Http\Controllers\Controller;
use App\Http\Requests\Social\CommentRequests\CreateCommentRequest;
use App\Http\Requests\Social\CommentRequests\UpdateCommentRequest;
use App\Models\Comment;
use App\Models\Movie;
use App\Models\Post;
use App\Services\Social\CommentService;
use Exception;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response as ResponseCode;

class CommentController extends Controller
{

    use AuthorizesRequests;

    public function __construct(protected CommentService $commentService)
    {
    }

    /**
     * Створює новий коментар для поста або фільму.
     *
     * @throws AuthorizationException
     */
    public function store(CreateCommentRequest $request, string $commentable_type, Movie|Post $commentable): JsonResponse
    {
        $this->authorize('create', Comment::class);

        try {
            $comment = $this->commentService->create($request->validated(), $commentable);

            return response()->json(['message' => 'Коментар успішно створено', 'comment' => $comment],
                ResponseCode::HTTP_CREATED);
        } catch (Exception $e) {
            return response()->json(['error' => $e->getMessage()], ResponseCode::HTTP_BAD_REQUEST);
        }
    }

    /**
     * Отримує список коментарів для поста або фільму.
     */
    public function index(Request $request, string $commentable_type, Movie|Post $commentable): JsonResponse
    {
        try {
            $comments = $this->commentService->getComments($commentable, $request->get('per_page', 20));

            return response()->json($comments);
        } catch (Exception $e) {
            return response()->json(['error' => $e->getMessage()], ResponseCode::HTTP_BAD_REQUEST);
        }
    }

    /**
     * Отримує конкретний коментар по його ID.
     */
    public function show(string $commentId): JsonResponse
    {
        try {
            $comment = $this->commentService->getComment($commentId);

            if (!$comment) {
                return response()->json(['message' => 'Коментар не знайдений'], ResponseCode::HTTP_NOT_FOUND);
            }

            return response()->json($comment);
        } catch (Exception $e) {
            return response()->json(['error' => $e->getMessage()], ResponseCode::HTTP_BAD_REQUEST);
        }
    }

    /**
     * Оновлює коментар.
     *
     * @throws AuthorizationException
     */
    public function update(UpdateCommentRequest $request, Comment $comment): JsonResponse
    {
        $this->authorize('update', $comment);

        try {
            $updatedComment = $this->commentService->update($comment, $request->validated());

            return response()->json(['message' => 'Коментар оновлено', 'comment' => $updatedComment]);
        } catch (Exception $e) {
            return response()->json(['error' => $e->getMessage()], ResponseCode::HTTP_BAD_REQUEST);
        }
    }

    /**
     * Видаляє коментар.
     *
     * @throws AuthorizationException
*/
    public function destroy(Comment $comment): JsonResponse
    {
        $this->authorize('delete', $comment);

        try {
            $this->commentService->delete($comment);

            return response()->json(['message' => 'Коментар видалено'], ResponseCode::HTTP_NO_CONTENT);
        } catch (Exception $e) {
            return response()->json(['error' => $e->getMessage()], ResponseCode::HTTP_BAD_REQUEST);
        }
    }

    /**
     * Отримує коментарі користувача.
     */
    public function userComments(Request $request): JsonResponse
    {
        try {
            $comments = $this->commentService->getUserComments($request->get('per_page', 20));

            return response()->json($comments);
        } catch (Exception $e) {
            return response()->json(['error' => $e->getMessage()], ResponseCode::HTTP_BAD_REQUEST);
        }
    }

    /**
     * Отримує відповіді на коментар.
     */
    public function replies(Request $request, Comment $comment): JsonResponse
    {
        try {
            $replies = $this->commentService->getReplies($comment, $request->get('per_page', 20));

            return response()->json($replies);
        } catch (Exception $e) {
            return response()->json(['error' => $e->getMessage()], ResponseCode::HTTP_BAD_REQUEST);
        }
    }
}
