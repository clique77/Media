<?php

namespace App\Notifications\Social\Post;

use App\Models\Like;
use App\Models\Post;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class PostLikedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected Post $post;
    protected User $liker;

    /**
     * Створює новий екземпляр сповіщення.
     *
     * @param Like $like
     */
    public function __construct(Like $like)
    {
        $this->post = $like->likeable;
        $this->liker = $like->user;
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
        $postUrl = str_replace('/api', '', route('posts.show', ['identifier' => $this->post->slug], true));

        return (new MailMessage)
            ->subject('Ваш пост отримав вподобання')
            ->greeting("Привіт, {$notifiable->username}!")
            ->line("Користувач {$this->liker->username} вподобав ваш пост.")
            ->action('Переглянути пост', $postUrl)
            ->line('Дякуємо, що ділитеся своїми думками з іншими!');
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
        $userUrl = str_replace('/api', '', route('users.show', ['identifier' => $this->liker->username]));
        $postUrl = str_replace('/api', '', route('posts.show', ['identifier' => $this->post->slug]));

        return [
            'message' => "Користувач <a href=\"{$userUrl}\">{$this->liker->username}</a> вподобав ваш <a href=\"{$postUrl}\">пост</a>.",
            'post_id' => $this->post->id,
            'liker_id' => $this->liker->id,
            'type' => 'like',
        ];
    }

    /**
     * Визначає канали для трансляції сповіщення.
     *
     * @return array
     */
    public function broadcastOn(): array
    {
        return [new PrivateChannel('notifications.' . $this->post->user_id)];
    }
}
