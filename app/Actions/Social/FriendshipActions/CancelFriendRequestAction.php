<?php

namespace App\Actions\Social\FriendshipActions;

use App\Enums\FriendshipStatus;
use App\Enums\NotificationType;
use App\Models\Friendship;
use App\Models\User;
use App\Notifications\Social\Friendship\FriendRequestCancelledNotification;
use Exception;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class CancelFriendRequestAction
{
    /**
     * Скасовує відправлений запит на дружбу.
     * Видаляє запис про дружбу та надсилає сповіщення користувачеві, якщо це дозволено.
     *
     * @param Friendship $friendship Об'єкт дружби, який потрібно скасувати
     * @throws Exception Якщо виникає помилка під час скасування запиту
     */
    public function __invoke(Friendship $friendship): void
    {
        DB::beginTransaction();

        try {
            $this->ensureCanCancel($friendship);

            /** @var User $canceller */
            $canceller = Auth::user();
            $receiver = $friendship->getFriendOf($canceller);

            $friendship->delete();

            $this->sendFriendRequestCancelledNotificationIfEnabled($canceller, $receiver);

            DB::commit();
        } catch (Exception $e) {
            DB::rollBack();
            throw new Exception('Помилка під час скасування запиту: ' . $e->getMessage());
        }
    }

    /**
     * Перевіряє, чи можна скасувати запит на дружбу.
     *
     * @param Friendship $friendship Об'єкт дружби
     * @throws Exception Якщо запит не можна скасувати
     */
    private function ensureCanCancel(Friendship $friendship): void
    {
        if ($friendship->status !== FriendshipStatus::PENDING->value) {
            throw new Exception('Цей запит вже оброблено і не може бути скасований.');
        }

        if (auth()->id() !== $friendship->user_id) {
            throw new Exception('Ви не можете скасувати цей запит.');
        }
    }

    /**
     * Надсилає сповіщення про скасування запиту, якщо користувач дозволив отримувати такі сповіщення.
     *
     * @param User $canceller Користувач, який скасував запит
     * @param User $receiver Користувач, якому надіслано запит
     */
    private function sendFriendRequestCancelledNotificationIfEnabled(User $canceller, User $receiver): void
    {
        if ($receiver->settings->getNotificationEnabled(NotificationType::FRIEND_REQUEST)) {
            $receiver->notify(new FriendRequestCancelledNotification($canceller, $receiver));
        }
    }
}
