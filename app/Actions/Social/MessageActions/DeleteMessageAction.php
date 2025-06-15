<?php

namespace App\Actions\Social\MessageActions;

use App\Models\Message;
use Illuminate\Support\Facades\DB;
use Exception;

class DeleteMessageAction
{
    /**
     * Видаляє передане повідомлення з використанням транзакції та обробкою винятків.
     *
     * Цей метод видаляє конкретне повідомлення з бази даних в рамках транзакції. Якщо операція не вдається,
     * буде здійснено відкат транзакції, і буде викинуто виключення з повідомленням про помилку.
     *
     * @param Message $message Повідомлення, яке необхідно видалити.
     * @return bool Повертає `true`, якщо видалення було успішним.
     * @throws Exception Якщо сталася помилка під час видалення повідомлення.
     */
    public function __invoke(Message $message): bool
    {
        DB::beginTransaction();

        try {
            $message->delete();

            DB::commit();
            return true;
        } catch (Exception $e) {
            DB::rollBack();

            throw new Exception('Помилка під час видалення повідомлення: ' . $e->getMessage());
        }
    }
}
