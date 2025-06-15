<?php

namespace App\Actions\Social\MessageActions;

use App\Models\Chat;
use Exception;
use Spatie\QueryBuilder\QueryBuilder;
use Spatie\QueryBuilder\AllowedFilter;
use Illuminate\Pagination\CursorPaginator;

class GetMessagesAction
{
    /**
     * Отримує повідомлення для заданого чату з курсорною пагінацією.
     *
     * Цей метод використовує курсорну пагінацію для завантаження повідомлень,
     * дозволяючи фільтрувати за статусом прочитання, сортувати за created_at
     * та фокусуватися на найстаршому непрочитаному повідомленні.
     *
     * @param Chat $chat Чат, для якого потрібно отримати повідомлення.
     * @param int $perPage Скільки повідомлень повертати за один запит (за замовчуванням 20).
     * @return CursorPaginator Пагіновані повідомлення.
     * @throws Exception Якщо сталася помилка під час отримання повідомлень.
     */
    public function __invoke(
        Chat $chat,
        int $perPage = 20,
    ): CursorPaginator {
        try {
            $query = QueryBuilder::for($chat->messages())
                ->with(['user', 'chat'])
                ->allowedFilters([
                    AllowedFilter::exact('is_read'),
                ])
                ->allowedSorts(['created_at', 'is_read'])
                ->defaultSort('-created_at');

            return $query->cursorPaginate($perPage);
        } catch (Exception $e) {
            throw new Exception('Помилка під час отримання повідомлень: ' . $e->getMessage());
        }
    }
}
