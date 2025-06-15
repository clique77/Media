<?php

namespace App\Services\Social;

use App\Models\User;
use Exception;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\CursorPaginator;
use Illuminate\Support\Facades\Log;

class NotificationService
{
    /**
     * Отримати нотифікації користувача з курсорною пагінацією
     *
     * @param User $user
     * @param bool $onlyUnread
     * @param int $perPage
     * @return Collection|CursorPaginator
     */
    public function getNotifications(User $user, bool $onlyUnread = false, int $perPage = 0): Collection|CursorPaginator
    {
        $query = $onlyUnread ? $user->unreadNotifications() : $user->notifications();
        return $perPage > 0 ? $query->latest()->cursorPaginate($perPage)->withQueryString() : $query->latest()->get();
    }

    /**
     * Позначити всі нотифікації користувача як прочитані
     *
     * @param User $user
     * @return bool
     */
    public function markAllAsRead(User $user): bool
    {
        try {
            $user->unreadNotifications()->update(['read_at' => now()]);
            return true;
        } catch (Exception $e) {
            return false;
        }
    }

    /**
     * Позначити одну нотифікацію як прочитану
     *
     * @param User $user
     * @param string $notificationId
     * @return bool
     */
    public function markSingleAsRead(User $user, string $notificationId): bool
    {
        try {
            $notification = $user->notifications()->findOrFail($notificationId);
            $notification->markAsRead();
            return true;
        } catch (Exception $e) {
            return false;
        }
    }

    /**
     * Видалити одну нотифікацію
     *
     * @param User $user
     * @param string $notificationId
     * @return bool
     */
    public function deleteNotification(User $user, string $notificationId): bool
    {
        try {
            $notification = $user->notifications()->findOrFail($notificationId);
            $notification->delete();
            return true;
        } catch (Exception $e) {
            return false;
        }
    }
}
