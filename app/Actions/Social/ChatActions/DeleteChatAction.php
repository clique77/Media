<?php

namespace App\Actions\Social\ChatActions;

use App\Models\Chat;
use Illuminate\Support\Facades\DB;
use Exception;

class DeleteChatAction
{
    /**
     * Видаляє переданий чат з бази даних.
     * Виконується в межах транзакції для забезпечення цілісності даних.
     *
     * @param Chat $chat Об'єкт чату, який потрібно видалити
     * @throws Exception Викидається, якщо трапилась помилка під час видалення чату або коміт транзакції не вдалий
     */
    public function __invoke(Chat $chat): void
    {
        DB::beginTransaction();

        try {
            $chat->delete();
            DB::commit();
        } catch (Exception $e) {
            DB::rollBack();
            throw new Exception('Помилка під час видалення чату: ' . $e->getMessage());
        }
    }
}
