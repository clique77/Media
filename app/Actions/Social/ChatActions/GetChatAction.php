<?php

namespace App\Actions\Social\ChatActions;

use App\Models\Chat;
use Exception;

class GetChatAction
{
    /**
     * Отримує чат за його ID разом з останніми 10 повідомленнями.
     * Завантажує лише необхідні поля для користувачів і повідомлень.
     *
     * @param string $chatId Ідентифікатор чату
     * @return Chat Об'єкт чату з останніми 10 повідомленнями та користувачами
     * @throws Exception Якщо чат не знайдений або виникла інша помилка
     */
    public function __invoke(string $chatId): Chat
    {
        return Chat::with([
            'userOne:id,first_name,last_name,username,avatar,is_online,last_seen_at',
            'userTwo:id,first_name,last_name,username,avatar,is_online,last_seen_at',
            'messages' => function ($query) {
                $query->latest()->limit(10);
            }
        ])->find($chatId);
    }
}
