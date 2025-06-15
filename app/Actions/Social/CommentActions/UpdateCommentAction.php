<?php

namespace App\Actions\Social\CommentActions;

use App\Models\Comment;
use Exception;
use Illuminate\Support\Facades\DB;

class UpdateCommentAction
{
    /**
     * Оновлює коментар з новими даними, такими як контент або статус.
     * Використовує транзакцію для забезпечення атомарності операції.
     *
     * @param Comment $comment Коментар, який необхідно оновити
     * @param array $data Дані для оновлення (наприклад, 'content', 'is_edited')
     * @return Comment Оновлений коментар
     * @throws Exception Якщо сталася помилка під час оновлення
     */
    public function __invoke(Comment $comment, array $data): Comment
    {
        DB::beginTransaction();

        try {
            $this->updateComment($comment, $data);

            DB::commit();

            return $comment;
        } catch (Exception $e) {
            DB::rollBack();
            throw new Exception('Не вдалося оновити коментар: ' . $e->getMessage());
        }
    }

    /**
     * Оновлює дані коментаря в базі даних.
     *
     * @param Comment $comment Коментар, який потрібно оновити
     * @param array $data Дані для оновлення
     * @return void
     */
    private function updateComment(Comment $comment, array $data): void
    {
        $comment->update($this->prepareUpdateCommentData($comment, $data));
    }

    /**
     * Підготовлює дані для оновлення коментаря, з урахуванням наявних значень.
     *
     * @param Comment $comment Коментар, який потрібно оновити
     * @param array $data Дані для оновлення
     * @return array Підготовлені дані для оновлення коментаря
     */
    private function prepareUpdateCommentData(Comment $comment, array $data): array
    {
        return [
            'content' => $data['content'] ?? $comment->content
        ];
    }
}
