<?php

namespace App\Actions\Social\PostActions;

use App\Actions\Traits\ProcessesAttachments;
use App\Enums\PostVisibility;
use App\Models\Post;
use App\Models\Tag;
use App\Services\Social\ContentModerationService;
use Exception;
use Illuminate\Support\Facades\DB;

class CreatePostAction
{
    use ProcessesAttachments;

    public function __construct(protected ContentModerationService $moderator)
    {
    }

    /**
     * Створює новий пост із зазначеними даними.
     * У процесі створення виконується обробка вкладень та синхронізація тегів.
     * Якщо виникає помилка, використовується транзакція для відкату змін.
     *
     * @param array $data Дані поста, включаючи видимість, вкладення, теги тощо
     * @return Post Створений пост
     * @throws Exception Якщо виникла помилка під час створення поста або збереження в базі даних
     */
    public function __invoke(array $data): Post
    {
        DB::beginTransaction();

        try {
            $data['visibility'] = PostVisibility::from($data['visibility']);

            $this->moderator->moderateText($data['title'] ?? '');
            $this->moderator->moderateText($data['content'] ?? '');

            $attachments = $data['attachments'] ?? [];
            foreach ($attachments as $attachment) {
                $this->moderator->moderateImage($attachment);
            }

            $data['attachments'] = $this->processAttachments($data['attachments'] ?? [], $data['visibility']->value);

            $post = Post::create($this->prepareCreatePostData($data));

            if (!empty($data['tags'])) {
                $this->syncTags($post, $data['tags']);
            }

            DB::commit();

            return $post;
        } catch (Exception $e) {
            DB::rollBack();
            throw new Exception(
                'Помилка під час створення поста. ' . $e->getMessage()
            );
        }
    }

    /**
     * Підготовлює дані для створення поста, включаючи поля користувача, контенту, видимості тощо.
     *
     * @param array $data Дані для створення поста
     * @return array Підготовлені дані для збереження у базі даних
     */
    private function prepareCreatePostData(array $data): array
    {
        return [
            'user_id' => auth()->id(),
            'title' => $data['title'],
            'content' => $data['content'],
            'visibility' => $data['visibility']->value,
            'attachments' => $data['attachments'] ?? null,
            'comments_enabled' => $data['comments_enabled'] ?? true,
        ];
    }

    /**
     * Синхронізує теги з базою даних та прив'язує їх до поста.
     * Якщо теги не існують у базі, вони створюються.
     *
     * @param Post $post Пост, до якого додаються теги
     * @param array $tags Массив тегів для синхронізації
     * @return void
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
