<?php

namespace App\Actions\Social\FriendshipActions;

use App\Enums\FriendshipStatus;
use App\Enums\NotificationType;
use App\Models\Friendship;
use App\Models\User;
use App\Notifications\Social\Friendship\FriendRequestAcceptedNotification;
use Exception;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class AcceptFriendRequestAction
{
    /**
     * Приймає запит на дружбу і оновлює його статус.
     * Якщо користувач дозволив сповіщення, надсилається повідомлення про прийняття запиту.
     *
     * @param Friendship $friendship Об'єкт дружби для оновлення
     * @return Friendship Оновлений об'єкт дружби
     * @throws Exception Якщо виникає помилка під час прийняття запиту
     */
    public function __invoke(Friendship $friendship): Friendship
    {
        DB::beginTransaction();

        try {
            $this->ensureCanAccept($friendship);

            /** @var User $receiver */
            $receiver = Auth::user();
            $sender = $friendship->getFriendOf($receiver);

            $friendship->update(['status' => FriendshipStatus::ACCEPTED->value]);

            $this->sendFriendRequestAcceptedNotificationIfEnabled($receiver, $sender);

            DB::commit();

            return $friendship;
        } catch (Exception $e) {
            DB::rollBack();
            throw new Exception('Помилка під час прийняття запиту: ' . $e->getMessage());
        }
    }

    /**
     * Перевіряє, чи можна прийняти запит на дружбу.
     *
     * @param Friendship $friendship Об'єкт дружби
     * @throws Exception Якщо запит не можна прийняти
     */
    private function ensureCanAccept(Friendship $friendship): void
    {
        if ($friendship->status !== FriendshipStatus::PENDING->value) {
            throw new Exception('Цей запит не можна прийняти.');
        }

        if (auth()->id() !== $friendship->friend_id) {
            throw new Exception('Ви не можете прийняти цей запит.');
        }
    }

    /**
     * Надсилає сповіщення про прийняття запиту, якщо користувач дозволив отримувати такі сповіщення.
     *
     * @param User $receiver Користувач, який прийняв запит
     * @param User $sender Користувач, який надіслав запит
     */
    private function sendFriendRequestAcceptedNotificationIfEnabled(User $receiver, User $sender): void
    {
        if ($sender->settings->getNotificationEnabled(NotificationType::FRIEND_REQUEST)) {
            $sender->notify(new FriendRequestAcceptedNotification($sender, $receiver));
        }
    }
}
