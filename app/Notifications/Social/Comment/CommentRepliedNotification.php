<?php

namespace App\Notifications\Social\Comment;

use App\Models\Comment;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class CommentRepliedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected Comment $reply;
    protected User $replier;

    /**
     * Створює новий екземпляр сповіщення.
     *
     * @param Comment $reply Відповідь на коментар
     */
    public function __construct(Comment $reply)
    {
        $this->reply = $reply;
        $this->replier = $reply->user;
    }

    /**
     * Канали доставки сповіщення.
     *
     * @param object $notifiable
     * @return array
     */
    public function via(object $notifiable): array
    {
        return ['database', 'broadcast'];
    }

    /**
     * Отримати представлення сповіщення для Email.
     *
     * @param object $notifiable
     * @return MailMessage
     */
    public function toMail(object $notifiable): MailMessage
    {
        $commentUrl = str_replace('/api', '', route('comments.show', ['id' => $this->reply->id], true));

        return (new MailMessage)
            ->subject('Вам відповіли на коментар')
            ->greeting("Привіт, {$notifiable->username}!")
            ->line("Користувач {$this->replier->username} відповів(ла) на ваш коментар:")
            ->line("\"{$this->reply->content}\"")
            ->action('Переглянути відповідь', $commentUrl)
            ->line('Дякуємо, що ви з нами!');
    }

    /**
     * Отримати представлення сповіщення для збереження в БД.
     *
     * @param object $notifiable
     * @return array
     */
    public function toDatabase(object $notifiable): array
    {
        return $this->getNotificationData();
    }

    /**
     * Отримати представлення сповіщення для трансляції через WebSockets.
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
        $userUrl = str_replace('/api', '', route('users.show', ['identifier' => $this->replier->username]));
        $commentUrl = "/posts/{$this->reply->commentable->slug}/comments/{$this->reply->parent->id}";

        return [
            'message' => "Користувач <a href=\"{$userUrl}\">{$this->replier->username}</a> відповів(ла) на ваш <a href=\"{$commentUrl}\">коментар</a>.",
            'comment_id' => $this->reply->id,
            'entity_id' => $this->reply->commentable->id,
            'entity_type' => class_basename($this->reply->commentable_type),
            'replier_id' => $this->replier->id,
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
        $parentComment = Comment::find($this->reply->parent_id);
        $recipientId = $parentComment ? $parentComment->user_id : $this->reply->commentable->user_id;
        return [new PrivateChannel('notifications.' . $recipientId)];
    }
}
