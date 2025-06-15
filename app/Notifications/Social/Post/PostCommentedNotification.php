<?php

namespace App\Notifications\Social\Post;

use App\Models\Comment;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class PostCommentedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected Comment $comment;
    protected User $commenter;

    /**
     * Створює новий екземпляр сповіщення.
     *
     * @param Comment $comment Коментар, через який виникло сповіщення
     */
    public function __construct(Comment $comment)
    {
        $this->comment = $comment;
        $this->commenter = $comment->user;
    }

    /**
     * Вказує, через які канали надсилати сповіщення.
     *
     * @param object $notifiable
     * @return array
     */
    public function via(object $notifiable): array
    {
        return ['database', 'broadcast'];
    }

    /**
     * Отримує представлення сповіщення для каналу Email.
     *
     * @param object $notifiable
     * @return MailMessage
     */
    public function toMail(object $notifiable): MailMessage
    {
        $postUrl = str_replace('/api', '', route('posts.show', ['identifier' => $this->comment->commentable->slug], true));

        return (new MailMessage)
            ->subject('Новий коментар до вашого поста')
            ->greeting("Привіт, {$notifiable->username}!")
            ->line("Користувач {$this->commenter->username} залишив коментар до вашого поста.")
            ->line("\"{$this->comment->content}\"")
            ->action('Переглянути коментар', $postUrl)
            ->line('Дякуємо за вашу активність у нашій спільноті!');
    }

    /**
     * Отримує представлення сповіщення для збереження в базі даних.
     *
     * @param object $notifiable
     * @return array
     */
    public function toDatabase(object $notifiable): array
    {
        return $this->getNotificationData();
    }

    /**
     * Отримує представлення сповіщення для трансляції через WebSockets.
     *
     * @param object $notifiable
     * @return BroadcastMessage
     */
    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        $now = Carbon::now('UTC')->format('Y-m-d\TH:i:s.u\Z');

        return new BroadcastMessage([
            'id' => $this->id,
            'type' => get_class($this),
            'notifiable_id' => $notifiable->id,
            'notifiable_type' => get_class($notifiable),
            'data' => $this->getNotificationData(),
            'read_at' => null,
            'created_at' => $now,
            'updated_at' => $now,
        ]);
    }

    /**
     * Отримує дані сповіщення для бази даних та трансляції.
     *
     * @return array
     */
    protected function getNotificationData(): array
    {
        $userUrl = str_replace('/api', '', route('users.show', ['identifier' => $this->commenter->username]));
        $postUrl = "/posts/{$this->comment->commentable->slug}/comments/{$this->comment->id}";

        return [
            'message' => "Користувач <a href=\"{$userUrl}\">{$this->commenter->username}</a> залишив коментар до вашого <a href=\"{$postUrl}\">поста</a>.",
            'post_id' => $this->comment->commentable->id,
            'comment_id' => $this->comment->id,
            'commenter_id' => $this->commenter->id,
            'type' => 'comment',
        ];
    }

    /**
     * Визначає канали для трансляції сповіщення.
     *
     * @return array
     */
    public function broadcastOn(): array
    {
        return [new PrivateChannel('notifications.' . $this->comment->commentable->user_id)];
    }
}
