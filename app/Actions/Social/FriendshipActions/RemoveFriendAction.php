<?php

namespace App\Actions\Social\FriendshipActions;

use App\Enums\FriendshipStatus;
use App\Enums\NotificationType;
use App\Models\Friendship;
use App\Models\User;
use App\Notifications\Social\Friendship\FriendRemovedNotification;
use Exception;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class RemoveFriendAction
{
    /**
     * Видаляє друга зі списку.
     *
     * @param Friendship $friendship Запис про дружбу, яку потрібно видалити.
     * @throws Exception Якщо не вдається видалити друга.
     */
    public function __invoke(Friendship $friendship): void
    {
        DB::beginTransaction();

        try {
            $this->ensureCanRemove($friendship);

            /** @var User $remover */
            $remover = Auth::user();
            $removed = $friendship->getFriendOf($remover);

            $friendship->delete();

            $this->sendFriendRemovedNotificationIfEnabled($remover, $removed);

            DB::commit();
        } catch (Exception $e) {
            DB::rollBack();
            throw new Exception('Помилка під час видалення друга: ' . $e->getMessage());
        }
    }

    /**
     * Перевіряє, чи можна видалити друга зі списку друзів.
     *
     * @param Friendship $friendship Запис про дружбу, яку потрібно перевірити.
     * @throws Exception Якщо дружба не є підтвердженою, або не можна видалити друга.
     */
    private function ensureCanRemove(Friendship $friendship): void
    {
        if ($friendship->status !== FriendshipStatus::ACCEPTED->value) {
            throw new Exception('Цей користувач не є вашим другом.');
        }
    }

    /**
     * Надсилає сповіщення про видалення друга, якщо користувач дозволив отримувати такі повідомлення.
     *
     * @param User $remover Користувач, який видаляє друга зі списку.
     * @param User $removed Користувач, якого видаляють зі списку друзів.
     */
    private function sendFriendRemovedNotificationIfEnabled(User $remover, User $removed): void
    {
        if ($removed->settings->getNotificationEnabled(NotificationType::FRIEND_REQUEST)) {
            $removed->notify(new FriendRemovedNotification($remover, $removed));
        }
    }

}
