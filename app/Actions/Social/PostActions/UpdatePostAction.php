<?php

namespace App\Actions\Social\PostActions;

use App\Actions\Traits\ProcessesAttachments;
use App\Enums\PostVisibility;
use App\Models\Post;
use App\Models\Tag;
use Exception;

class UpdatePostAction
{
    use ProcessesAttachments;

    /**
     * Оновлює дані поста, зберігаючи нові значення для полів, таких як title, content, visibility, attachments і comments_enabled.
     * Також оновлюються теги поста, додаючи нові або видаляючи старі.
     *
     * @param Post $post Об'єкт поста, який потрібно оновити
     * @param array $data Дані для оновлення, що включають title, content, visibility, attachments, comments_enabled і tags
     * @return Post Оновлений об'єкт поста
     * @throws Exception Якщо виникла помилка при оновленні поста (наприклад, проблема з базою даних або файлами)
     */
    public function __invoke(Post $post, array $data): Post
    {
        try {
            $data['visibility'] = PostVisibility::from($data['visibility']);

            if (isset($data['attachments'])) {
                $data['attachments'] = $this->processAttachments($data['attachments'], $data['visibility']->value);
            } else {
                $data['attachments'] = $post->attachments;
            }

            $post->update($this->prepareUpdatePostData($data, $post));

            if (!empty($data['tags'])) {
                $this->syncTags($post, $data['tags']);
            }

            return $post;
        } catch (Exception $e) {
            throw new Exception('Помилка під час оновлення поста.' . $e->getMessage());
        }
    }

    /**
     * Підготовка даних для оновлення поста, збереження значень або використання поточних значень, якщо нові не були передані.
     *
     * @param array $data Дані для оновлення поста
     * @param Post $post Поточний пост для отримання значень за замовчуванням
     * @return array Підготовлені дані для оновлення
     */
    private function prepareUpdatePostData(array $data, Post $post): array
    {
        return [
            'title' => $data['title'] ?? $post->title,
            'content' => $data['content'] ?? $post->content,
            'visibility' => $data['visibility'] ?? $post->visibility->value,
            'attachments' => $data['attachments'] ?? $post->attachments,
            'comments_enabled' => $data['comments_enabled'] ?? $post->comments_enabled,
        ];
    }

    /**
     * Оновлює теги поста. Якщо тегів не було в базі, вони додаються.
     * Синхронізує теги між постом та записами в базі даних.
     *
     * @param Post $post Пост, до якого потрібно додати теги
     * @param array $tags Массив тегів для синхронізації
     * @throws Exception
     */
    private function syncTags(Post $post, array $tags): void
    {
        try {
            $tags = array_filter(array_map('strtolower', $tags), fn($tag) => !empty(trim($tag)));

            $tagIds = collect($tags)->map(function ($tag) {
                $tagModel = Tag::firstOrCreate(['name' => $tag]);
                return $tagModel->id;
            })->filter()->unique()->values()->toArray();

            $post->tags()->sync($tagIds);
        } catch (Exception $e) {
            throw new Exception('Помилка синхронізації тегів. ');
        }
    }
}
