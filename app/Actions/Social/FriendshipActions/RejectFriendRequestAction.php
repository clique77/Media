<?php

namespace App\Actions\Social\FriendshipActions;

use App\Enums\FriendshipStatus;
use App\Enums\NotificationType;
use App\Models\Friendship;
use App\Models\User;
use App\Notifications\Social\Friendship\FriendRequestRejectedNotification;
use Exception;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class RejectFriendRequestAction
{
    /**
     * Відхиляє запит на дружбу.
     *
     * @param Friendship $friendship
     * @throws Exception
     */
    public function __invoke(Friendship $friendship): void
    {
        DB::beginTransaction();

        try {
            $this->ensureCanReject($friendship);

            /** @var User $rejector */
            $rejector = Auth::user();
            $sender = $friendship->getFriendOf($rejector);

            $friendship->delete();

            $this->sendFriendRequestRejectedNotificationIfEnabled($rejector, $sender);

            DB::commit();
        } catch (Exception $e) {
            DB::rollBack();
            throw new Exception('Помилка під час відхилення запиту: ' . $e->getMessage());
        }
    }

    /**
     * Перевіряє, чи можна відхилити запит на дружбу.
     *
     * @param Friendship $friendship Запит на дружбу, який потрібно перевірити.
     * @throws Exception Якщо запит не можна відхилити.
     */
    private function ensureCanReject(Friendship $friendship): void
    {
        if ($friendship->status !== FriendshipStatus::PENDING->value) {
            throw new Exception('Цей запит не можна відхилити.');
        }

        if (auth()->id() !== $friendship->friend_id) {
            throw new Exception('Ви не можете відхилити цей запит.');
        }
    }

    /**
     * Надсилає сповіщення користувачу, якщо той дозволив отримувати такі повідомлення.
     *
     * @param User $rejector Користувач, який відхиляє запит на дружбу.
     * @param User $sender Користувач, якому було надіслано запит на дружбу.
     */
    private function sendFriendRequestRejectedNotificationIfEnabled(User $rejector, User $sender): void
    {
        if ($sender->settings->getNotificationEnabled(NotificationType::FRIEND_REQUEST)) {
            $sender->notify(new FriendRequestRejectedNotification($rejector, $sender));
        }
    }
}
