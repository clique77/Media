<?php

namespace App\Actions\Social\MessageActions;

use App\Actions\Social\ChatActions\UpdateChatAction;
use App\Actions\Traits\ProcessesAttachments;
use App\Events\Social\Chat\MessageSentEvent;
use App\Models\Chat;
use App\Models\Message;
use App\Models\User;
use Exception;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class CreateMessageAction
{
    use ProcessesAttachments;

    public function __construct(private UpdateChatAction $updateChatAction)
    {
    }

    /**
     * Створює нове повідомлення в чаті.
     *
     * Цей метод створює нове повідомлення в заданому чаті, перевіряє, чи користувач є учасником чату,
     * обробляє вкладення та оновлює чат із останнім повідомленням.
     *
     * @param array $data Дані для створення повідомлення, включаючи:
     *                    - `chat_id` (ID чату)
     *                    - `content` (вміст повідомлення)
     *                    - `attachments` (вкладення, якщо є)
     * @return Message Повертає створене повідомлення.
     * @throws Exception Якщо користувач не є учасником чату або виникла інша помилка.
     */
    public function __invoke(array $data): Message
    {
        DB::beginTransaction();

        try {
            $user = Auth::user();
            $chat = Chat::findOrFail($data['chat_id']);

            $this->ensureUserIsChatParticipant($user->id, $chat);
            $this->ensureUsersNotBlocked($chat, $user->id);

            $attachments = $this->processAttachments($data['attachments'] ?? [], 'private');

            $message = $this->createMessage($data, $attachments);

            $message->load('user');

            ($this->updateChatAction)($message->chat, [
                'last_message' => $message->content ?? $message->attachments[0],
            ]);

            broadcast(new MessageSentEvent($message))->toOthers();

            DB::commit();

            return $message;
        } catch (Exception $e) {
            DB::rollBack();
            throw new Exception('Помилка під час створення повідомлення: ' . $e->getMessage());
        }
    }

    /**
     * Створює нове повідомлення в базі даних.
     *
     * @param array $data Дані для створення повідомлення.
     * @param array|null $attachments Вкладення, якщо є.
     * @return Message Повертає створене повідомлення.
     */
    private function createMessage(array $data, ?array $attachments): Message
    {
        return Message::create([
            'chat_id' => $data['chat_id'],
            'user_id' => Auth::user()->id,
            'content' => $data['content'],
            'attachments' => $attachments,
            'is_read' => false,
        ]);
    }

    /**
     * Перевіряє, чи є користувач учасником чату.
     *
     * @param string $userId ID користувача.
     * @param Chat $chat Чат, в якому перевіряється участь.
     * @throws Exception Якщо користувач не є учасником чату.
     */
    private function ensureUserIsChatParticipant(string $userId, Chat $chat): void
    {
        if ($chat->user_one_id !== $userId && $chat->user_two_id !== $userId) {
            throw new Exception('Ви не можете надсилати повідомлення в цей чат.');
        }
    }

    /**
     * Перевіряє, що жоден з учасників не заблокував іншого.
     *
     * @param Chat $chat Чат між користувачами.
     * @param int $currentUserId ID поточного користувача.
     * @throws Exception Якщо один з користувачів заблокував іншого.
     */
    private function ensureUsersNotBlocked(Chat $chat, string $currentUserId): void
    {
        /** @var User $currentUser */
        $currentUser = Auth::user();
        $otherUserId = $chat->user_one_id === $currentUserId ? $chat->user_two_id : $chat->user_one_id;
        $otherUser = User::find($otherUserId);

        $isBlockedByCurrentUser = $currentUser->blockedUsers()->where('blocked_id', $otherUser->id)->exists();
        $isBlockedByOtherUser = $otherUser->blockedUsers()->where('blocked_id', $currentUser->id)->exists();

        if ($isBlockedByCurrentUser) {
            throw new Exception('Ви заблокували цього користувача і не можете надсилати повідомлення.');
        }

        if ($isBlockedByOtherUser) {
            throw new Exception('Цей користувач заблокував вас. Повідомлення неможливе.');
        }
    }

}
