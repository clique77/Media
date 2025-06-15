<?php

namespace App\Http\Controllers\Social;

use App\Http\Controllers\Controller;
use App\Http\Requests\Social\MessageRequests\CreateMessageRequest;
use App\Http\Requests\Social\MessageRequests\UpdateMessageRequest;
use App\Models\Chat;
use App\Models\Message;
use App\Services\Social\MessageService;
use Exception;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MessageController extends Controller
{
    use AuthorizesRequests;

    public function __construct(protected MessageService $messageService)
    {
    }

    /**
     * @throws AuthorizationException
     */
    public function store(CreateMessageRequest $request): JsonResponse
    {
        $this->authorize('create', Message::class);

        try {
            $message = $this->messageService->create($request->validated());

            return response()->json([
                'message' => 'Message created successfully.',
                'data' => $message,
            ], 201);
        } catch (Exception $e) {
            return response()->json([
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function update(UpdateMessageRequest $request, Message $message): JsonResponse
    {
        $this->authorize('update', $message);

        try {
            $updatedMessage = $this->messageService->update($message, $request->validated());

            return response()->json([
                'message' => 'Message updated successfully.',
                'data' => $updatedMessage,
            ]);
        } catch (Exception $e) {
            return response()->json([
                'error' => 'Failed to update message: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function destroy(Message $message): JsonResponse
    {
        $this->authorize('delete', $message);

        try {
            $this->messageService->delete($message);

            return response()->json([
                'message' => 'Message deleted successfully.',
            ]);
        } catch (Exception $e) {
            return response()->json([
                'error' => 'Failed to delete message: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * @throws AuthorizationException
     */
    public function index(Chat $chat, Request $request): JsonResponse
    {
        $this->authorize('view', $chat);

        try {
            $perPage = $request->get('perPage', 20);
            $messages = $this->messageService->getMessages($chat, $perPage);

            return response()->json($messages);
        } catch (Exception $e) {
            return response()->json([
                'error' => 'Failed to fetch messages: ' . $e->getMessage(),
            ], 500);
        }
    }
}
