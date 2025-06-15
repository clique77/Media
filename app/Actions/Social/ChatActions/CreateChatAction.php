<?php

namespace App\Actions\Social\ChatActions;

use App\Enums\MessagePrivacy;
use App\Events\Social\Chat\ChatCreatedEvent;
use App\Models\Chat;
use App\Models\User;
use Exception;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class CreateChatAction
{
    /**
     * Створює новий чат між двома користувачами.
     * Виконується перевірка всіх необхідних умов для створення чату, а також обробка транзакцій.
     *
     * @param array $data Дані чату, що включають ID другого користувача (user_two_id)
     * @return Chat Створений чат
     * @throws Exception Викидається, якщо трапилась помилка під час створення чату або коміт транзакції не вдалий
     */
    public function __invoke(array $data): Chat
    {
        DB::beginTransaction();

        try {
            $existingChat = $this->findExistingChat($data);
            if ($existingChat) {
                DB::commit();
                return $existingChat;
            }

            $this->ensureConditionsMet($data);

            $chat = $this->createChat($data);

            broadcast(new ChatCreatedEvent($chat));

            DB::commit();

            return $chat;
        } catch (Exception $e) {
            DB::rollBack();
            throw new Exception('Помилка під час створення чату: ' . $e->getMessage());
        }
    }

    /**
     * Перевіряє всі необхідні умови перед створенням чату.
     *
     * @param array $data Дані чату, що включають ID другого користувача
     * @throws Exception Викидається, якщо одна з умов не виконана
     */
    private function ensureConditionsMet(array $data): void
    {
        $this->validateUsersAreDifferent($data);
        $this->validateNotBlockedUsers($data);
        $this->validateMessagePrivacy($data);
    }

    /**
     * Шукає існуючий чат між цими користувачами.
     *
     * @param array $data Дані чату, що включають ID другого користувача
     * @return Chat|null Існуючий чат або null, якщо чат не існує
     */
    private function findExistingChat(array $data): ?Chat
    {
        return Chat::where(function ($query) use ($data) {
            $query->where('user_one_id', Auth::id())
                ->where('user_two_id', $data['user_two_id']);
        })->orWhere(function ($query) use ($data) {
            $query->where('user_one_id', $data['user_two_id'])
                ->where('user_two_id', Auth::id());
        })->first();
    }

    /**
     * Перевіряє, що користувач не створює чат сам із собою.
     *
     * @param array $data Дані чату, що включають ID другого користувача
     * @throws Exception Викидається, якщо користувач намагається створити чат з самим собою
     */
    private function validateUsersAreDifferent(array $data): void
    {
        if (Auth::id() === $data['user_two_id']) {
            throw new Exception('Користувач не може створити чат сам із собою.');
        }
    }

    /**
     * Перевіряє, що користувач не знаходиться у списку заблокованих.
     *
     * @param array $data Дані чату, що включають ID другого користувача
     * @throws Exception Викидається, якщо один з користувачів заблокував іншого
     */
    private function validateNotBlockedUsers(array $data): void
    {
        /** @var User $currentUser */
        $currentUser = Auth::user();
        $otherUser = User::find($data['user_two_id']);

        $isBlockedByCurrentUser = $currentUser->blockedUsers()->where('blocked_id', $otherUser->id)->exists();
        $isBlockedByOtherUser = $otherUser->blockedUsers()->where('blocked_id', $currentUser->id)->exists();

        if ($isBlockedByCurrentUser) {
            throw new Exception('Ви заблокували цього користувача і не можете створити чат.');
        }

        if ($isBlockedByOtherUser) {
            throw new Exception('Цей користувач заблокував вас і ви не можете створити чат.');
        }
    }

    /**
     * Перевіряє налаштування приватності повідомлень.
     *
     * @param array $data Дані чату, що включають ID другого користувача
     * @throws Exception Викидається, якщо налаштування приватності не дозволяють створення чату
     */
    private function validateMessagePrivacy(array $data): void
    {
        $otherUser = User::find($data['user_two_id']);
        $settings = $otherUser->settings;

        if ($settings->message_privacy === MessagePrivacy::FRIENDS_ONLY->value && !$otherUser->friends()->where(
                'friend_id',
                Auth::id()
            )->exists()) {
            throw new Exception('Цей користувач приймає повідомлення лише від друзів.');
        }

        if ($settings->message_privacy === MessagePrivacy::NO_ONE->value) {
            throw new Exception('Цей користувач не приймає нові повідомлення.');
        }
    }

    /**
     * Створює новий чат.
     *
     * @param array $data Дані чату, що включають ID другого користувача
     * @return Chat Створений чат
     */
    private function createChat(array $data): Chat
    {
        return Chat::create([
            'user_one_id' => Auth::id(),
            'user_two_id' => $data['user_two_id'],
            'last_message' => null,
            'last_message_at' => null,
        ]);
    }
}
