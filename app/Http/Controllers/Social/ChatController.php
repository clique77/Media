<?php

namespace App\Http\Controllers\Social;

use App\Http\Controllers\Controller;
use App\Http\Requests\Social\ChatRequests\CreateChatRequest;
use App\Http\Requests\Social\ChatRequests\UpdateChatRequest;
use App\Models\Chat;
use App\Services\Social\ChatService;
use Exception;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ChatController extends Controller
{
    use AuthorizesRequests;

    public function __construct(protected ChatService $chatService)
    {
    }

    /**
     * @throws AuthorizationException
     */
    public function store(CreateChatRequest $request): JsonResponse
    {
        $this->authorize('create', Chat::class);

        try {
            $chat = $this->chatService->create($request->validated());

            return response()->json([
                'message' => 'Чат створено успішно.',
                'data' => $chat,
            ], 201);
        } catch (Exception $e) {
            return response()->json([
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * @throws AuthorizationException
     */
    public function update(UpdateChatRequest $request, Chat $chat): JsonResponse
    {
        $this->authorize('update', $chat);

        try {
            $updatedChat = $this->chatService->update($chat, $request->validated());

            return response()->json([
                'message' => 'Чат успішно оновлено.',
                'data' => $updatedChat,
            ]);
        } catch (Exception $e) {
            return response()->json([
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * @throws AuthorizationException
     */
    public function destroy(Chat $chat): JsonResponse
    {
        $this->authorize('delete', $chat);

        try {
            $this->chatService->delete($chat);

            return response()->json([
                'message' => 'Chat deleted successfully.',
            ]);
        } catch (Exception $e) {
            return response()->json([
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * @throws AuthorizationException
     */
    public function show(Chat $chat): JsonResponse
    {
        $this->authorize('view', $chat);

        try {
            $chat = $this->chatService->getChat($chat->id);

            return response()->json($chat);
        } catch (Exception $e) {
            return response()->json([
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function index(Request $request): JsonResponse
    {
        try {
            $perPage = $request->get('perPage', 20);
            $chats = $this->chatService->getChats($perPage);

            return response()->json($chats);
        } catch (Exception $e) {
            return response()->json([
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
