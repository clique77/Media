<?php

namespace App\Actions\Social\ChatActions;

use App\Events\Social\Chat\ChatUpdatedEvent;
use App\Models\Chat;
use Exception;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class UpdateChatAction
{
    /**
     * Оновлює чат з новими даними, відправляє подію про оновлення чату.
     *
     * @param Chat $chat Об'єкт чату, який потрібно оновити
     * @param array $data Дані для оновлення (наприклад, 'last_message', 'last_message_at')
     * @return Chat Оновлений об'єкт чату
     * @throws Exception Якщо виникає помилка під час оновлення чату
     */
    public function __invoke(Chat $chat, array $data): Chat
    {
        DB::beginTransaction();

        try {
            $this->updateChat($chat, $data);

            broadcast(new ChatUpdatedEvent($chat));

            DB::commit();

            return $chat;
        } catch (Exception $e) {
            DB::rollBack();
            throw new Exception('Не вдалося оновити чат: ' . $e->getMessage());
        }
    }

    /**
     * Підготовлює дані для оновлення.
     *
     * @param array $data
     * @return array
     */
    private function prepareDataForUpdate(array $data): array
    {
        return [
            'last_message' => $data['last_message'],
            'last_message_at' => now(),
        ];
    }

    /**
     * Оновлює чат з новими даними.
     *
     * @param Chat $chat
     * @param array $data
     * @return void
     */
    private function updateChat(Chat $chat, array $data): void
    {
        $chat->update($this->prepareDataForUpdate($data));
    }
}
