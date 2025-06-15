<?php

namespace App\Http\Controllers\Social;

use App\Http\Controllers\Controller;
use App\Services\Social\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class NotificationController extends Controller
{
    public function __construct(protected NotificationService $notificationService)
    {
    }

    /**
     * Отримати всі нотифікації користувача
     */
    public function index(Request $request): JsonResponse
    {
        $rawOnlyUnread = $request->query('only_unread', false);
        $onlyUnread = filter_var($rawOnlyUnread, FILTER_VALIDATE_BOOLEAN);

        $notifications = $this->notificationService->getNotifications(
            $request->user(),
            $onlyUnread,
            $request->query('per_page', 10)
        );

        return response()->json($notifications);
    }

    /**
     * Позначити всі нотифікації як прочитані
     */
    public function markAsRead(Request $request): JsonResponse
    {
        $success = $this->notificationService->markAllAsRead($request->user());

        return response()->json([
            'message' => $success ? 'Сповіщення позначено як прочитані' : 'Помилка при позначенні сповіщень',
        ], $success ? 200 : 500);
    }

    /**
     * Позначити одну нотифікацію як прочитану
     */
    public function markSingleAsRead(Request $request, string $notificationId): JsonResponse
    {
        $success = $this->notificationService->markSingleAsRead($request->user(), $notificationId);

        return response()->json([
            'message' => $success ? 'Сповіщення позначено як прочитане' : 'Помилка при позначенні сповіщення',
        ], $success ? 200 : 500);
    }

    /**
     * Видалити одну нотифікацію
     */
    public function delete(Request $request, string $notificationId): JsonResponse
    {
        $success = $this->notificationService->deleteNotification($request->user(), $notificationId);

        return response()->json([
            'message' => $success ? 'Сповіщення видалено' : 'Помилка при видаленні сповіщення',
        ], $success ? 200 : 404);
    }
}
