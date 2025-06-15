<?php

namespace App\Http\Controllers\Social;

use App\Http\Controllers\Controller;
use App\Http\Requests\Social\FriendshipRequests\SendFriendRequestRequest;
use App\Models\Friendship;
use App\Models\User;
use App\Services\Social\FriendshipService;
use Exception;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FriendshipController extends Controller
{
    use AuthorizesRequests;

    public function __construct(protected FriendshipService $friendshipService)
    {
    }

    /**
     * Відправлення запиту на дружбу.
     *
     */
    public function sendFriendRequest(SendFriendRequestRequest $request): JsonResponse
    {
        try {
            $senderId = $request->get('sender_id');
            $receiverId = $request->get('receiver_id');

            $friendship = $this->friendshipService->sendFriendRequest($senderId, $receiverId);

            return response()->json([
                'message' => 'Запит на дружбу надіслано успішно.',
                'data' => $friendship,
            ], 201);
        } catch (Exception $e) {
            return response()->json([
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Прийняття запиту на дружбу.
     *
     * @throws AuthorizationException
     */
    public function acceptFriendRequest(Friendship $friendship): JsonResponse
    {
        $this->authorize('update', $friendship);

        try {
            $updatedFriendship = $this->friendshipService->acceptFriendRequest($friendship);

            return response()->json([
                'message' => 'Запит на дружбу прийнято.',
                'data' => $updatedFriendship,
            ]);
        } catch (Exception $e) {
            return response()->json([
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Відхилення запиту на дружбу.
     *
     * @throws AuthorizationException
     */
    public function rejectFriendRequest(Friendship $friendship): JsonResponse
    {
        $this->authorize('update', $friendship);

        try {
            $this->friendshipService->rejectFriendRequest($friendship);

            return response()->json([
                'message' => 'Запит на дружбу відхилено.',
            ]);
        } catch (Exception $e) {
            return response()->json([
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Скасування запиту на дружбу.
     *
     * @throws AuthorizationException
     */
    public function cancelFriendRequest(Friendship $friendship): JsonResponse
    {
        $this->authorize('delete', $friendship);

        try {
            $this->friendshipService->cancelFriendRequest($friendship);

            return response()->json([
                'message' => 'Запит на дружбу скасовано.',
            ]);
        } catch (Exception $e) {
            return response()->json([
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Видалення друга.
     *
     * @throws AuthorizationException
     */
    public function removeFriend(Friendship $friendship): JsonResponse
    {
        $this->authorize('delete', $friendship);

        try {
            $this->friendshipService->removeFriend($friendship);

            return response()->json([
                'message' => 'Друг успішно видалений.',
            ]);
        } catch (Exception $e) {
            return response()->json([
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Отримання списку друзів.
     */
    public function getFriends(Request $request, User $user): JsonResponse
    {
        try {
            $friends = $this->friendshipService->getFriends($user);

            return response()->json($friends);
        } catch (Exception $e) {
            return response()->json([
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Отримання запитів на дружбу, що були надіслані.
     */
    public function getSentFriendRequests(Request $request, User $user): JsonResponse
    {
        try {
            $perPage = $request->get('perPage', 20);
            $sentRequests = $this->friendshipService->getSentFriendRequests($user, $perPage);

            return response()->json($sentRequests);
        } catch (Exception $e) {
            return response()->json([
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Отримання запитів на дружбу, що були отримані.
     */
    public function getReceivedFriendRequests(Request $request, User $user): JsonResponse
    {
        try {
            $perPage = $request->get('perPage', 20);
            $receivedRequests = $this->friendshipService->getReceivedFriendRequests($user, $perPage);

            return response()->json($receivedRequests);
        } catch (Exception $e) {
            return response()->json([
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}

