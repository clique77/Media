<?php

namespace App\Actions\Social\MessageActions;

use App\Events\Social\Chat\MessageUpdatedEvent;
use App\Models\Message;
use Exception;
use Illuminate\Support\Facades\DB;

class UpdateMessageAction
{
    /**
     * Оновлює повідомлення з новими даними, наприклад, контентом або додатками.
     * Використовує транзакцію для забезпечення атомарності операції.
     * Після оновлення повідомлення транслюється подія, яка інформує про оновлення.
     *
     * @param Message $message Повідомлення, яке необхідно оновити
     * @param array $data Дані для оновлення (наприклад, 'content', 'attachments', 'is_read')
     * @return Message Оновлене повідомлення
     * @throws Exception Якщо сталася помилка під час оновлення повідомлення
     */
    public function __invoke(Message $message, array $data): Message
    {
        DB::beginTransaction();

        try {
            $this->updateMessage($message, $data);

            broadcast(new MessageUpdatedEvent($message));

            DB::commit();

            return $message;
        } catch (Exception $e) {
            DB::rollBack();
            throw new Exception('Не вдалося оновити повідомлення: ' . $e->getMessage());
        }
    }

    /**
     * Оновлює дані повідомлення в базі даних.
     * Це метод для безпосереднього оновлення атрибутів повідомлення через модель.
     *
     * @param Message $message Повідомлення, яке потрібно оновити
     * @param array $data Дані для оновлення (наприклад, 'content', 'attachments', 'is_read')
     * @return void
     */
    private function updateMessage(Message $message, array $data): void
    {
        $message->update($this->prepareUpdateMessageData($message, $data));
    }

    /**
     * Підготовлює дані для оновлення повідомлення, з урахуванням наявних значень.
     * Якщо в масиві даних немає значення для певного поля, то використовується поточне значення з бази даних.
     *
     * @param Message $message Повідомлення, яке потрібно оновити
     * @param array $data Дані для оновлення
     * @return array Підготовлені дані для оновлення повідомлення
     */
    private function prepareUpdateMessageData(Message $message, array $data): array
    {
        return [
            'content' => $data['content'] ?? $message->content,
            'attachments' => $data['attachments'] ?? $message->attachments,
            'is_read' => $data['is_read'] ?? $message->is_read,
        ];
    }
}
