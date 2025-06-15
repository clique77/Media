<?php

namespace App\Actions\Social\FriendshipActions;

use App\Enums\FriendRequestPrivacy;
use App\Enums\FriendshipStatus;
use App\Enums\NotificationType;
use App\Models\Friendship;
use App\Models\User;
use App\Notifications\Social\Friendship\FriendRequestReceivedNotification;
use App\Notifications\Social\Friendship\FriendRequestSentNotification;
use Exception;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class SendFriendRequestAction
{
    /**
     * Відправляє запит на дружбу.
     *
     * @param string $senderId Відправник запиту (ID користувача).
     * @param string $receiverId Отримувач запиту (ID користувача).
     * @return Friendship Запис про дружбу.
     * @throws Exception Якщо не вдається надіслати запит на дружбу.
     */
    public function __invoke(string $senderId, string $receiverId): Friendship
    {
        DB::beginTransaction();

        try {
            $sender = User::findOrFail($senderId);
            $receiver = User::findOrFail($receiverId);

            $this->ensureSenderIsAuthenticated($sender);
            $this->ensureConditionsMet($sender, $receiver);

            $friendship = $this->createFriendRequest($sender, $receiver);

            $this->sendFriendRequestNotificationIfEnabled($sender, $receiver);
            $this->sendFriendRequestReceivedNotificationIfEnabled($sender, $receiver);

            DB::commit();

            return $friendship;
        } catch (Exception $e) {
            DB::rollBack();
            throw new Exception('Помилка під час надсилання запиту на дружбу: ' . $e->getMessage());
        }
    }

    /**
     * Перевіряє, чи є поточний користувач відправником запиту.
     *
     * @param User $sender Користувач, який відправляє запит.
     * @throws Exception Якщо користувач не є авторизованим відправником запиту.
     */
    private function ensureSenderIsAuthenticated(User $sender): void
    {
        if ($sender->id !== Auth::id()) {
            throw new Exception('Ви не можете надіслати запит на дружбу від імені іншого користувача.');
        }
    }

    /**
     * Перевіряє всі необхідні умови перед створенням запиту.
     *
     * @param User $sender Відправник запиту на дружбу.
     * @param User $receiver Отримувач запиту на дружбу.
     * @throws Exception Якщо умови для створення запиту не виконуються.
     */
    private function ensureConditionsMet(User $sender, User $receiver): void
    {
        $this->validateUsersAreDifferent($sender, $receiver);
        $this->validateRequestDoesNotExist($sender, $receiver);
        $this->validateReceiverAllowsRequests($receiver);
    }

    /**
     * Перевіряє, що користувач не відправляє запит сам собі.
     *
     * @param User $sender Відправник запиту.
     * @param User $receiver Отримувач запиту.
     * @throws Exception Якщо користувач намагається надіслати запит сам собі.
     */
    private function validateUsersAreDifferent(User $sender, User $receiver): void
    {
        if ($sender->id === $receiver->id) {
            throw new Exception('Не можна відправити запит на дружбу самому собі.');
        }
    }

    /**
     * Перевіряє, чи запит на дружбу вже існує.
     *
     * @param User $sender Відправник запиту.
     * @param User $receiver Отримувач запиту.
     * @throws Exception Якщо запит на дружбу вже існує.
     */
    private function validateRequestDoesNotExist(User $sender, User $receiver): void
    {
        $exists = Friendship::where(function ($query) use ($sender, $receiver) {
            $query->where('user_id', $sender->id)
                ->where('friend_id', $receiver->id);
        })->orWhere(function ($query) use ($sender, $receiver) {
            $query->where('user_id', $receiver->id)
                ->where('friend_id', $sender->id);
        })->exists();

        if ($exists) {
            throw new Exception('Запит на дружбу вже існує.');
        }
    }

    /**
     * Перевіряє, чи отримувач дозволяє отримувати запити на дружбу.
     *
     * @param User $receiver Отримувач запиту на дружбу.
     * @throws Exception Якщо отримувач не дозволяє отримувати запити на дружбу.
     */
    private function validateReceiverAllowsRequests(User $receiver): void
    {
        if ($receiver->settings->friend_request_privacy === FriendRequestPrivacy::NO_ONE->value) {
            throw new Exception('Користувач не приймає заявки в друзі.');
        }
    }

    /**
     * Створює новий запит на дружбу.
     *
     * @param User $sender Відправник запиту.
     * @param User $receiver Отримувач запиту.
     * @return Friendship Запис про дружбу.
     */
    private function createFriendRequest(User $sender, User $receiver): Friendship
    {
        return Friendship::create([
            'user_id' => $sender->id,
            'friend_id' => $receiver->id,
            'status' => FriendshipStatus::PENDING->value,
        ]);
    }

    /**
     * Перевіряє, чи увімкнено сповіщення для запиту на дружбу та надсилає його.
     *
     * @param User $sender Відправник запиту.
     * @param User $receiver Отримувач запиту.
     */
    private function sendFriendRequestNotificationIfEnabled(User $sender, User $receiver): void
    {
        if ($sender->settings->getNotificationEnabled(NotificationType::FRIEND_REQUEST)) {
            $sender->notify(new FriendRequestSentNotification($sender, $receiver));
        }
    }

    /**
     * Перевіряє, чи увімкнено сповіщення для отримання запитів на дружбу та надсилає його.
     *
     * @param User $sender Відправник запиту.
     * @param User $receiver Отримувач запиту.
     */
    private function sendFriendRequestReceivedNotificationIfEnabled(User $sender, User $receiver): void
    {
        if ($receiver->settings->getNotificationEnabled(NotificationType::FRIEND_REQUEST)) {
            $receiver->notify(new FriendRequestReceivedNotification($sender, $receiver));
        }
    }
}
