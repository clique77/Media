<?php

namespace App\Notifications\Social\Friendship;

use App\Models\User;
use Carbon\Carbon;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;

class FriendRemovedNotification extends Notification implements ShouldBroadcast, ShouldQueue
{
    use Queueable;

    protected User $remover;
    protected User $removed;

    /**
     * Створює новий екземпляр сповіщення.
     *
     * @param User $remover Користувач, який видалив із друзів
     * @param User $removed Користувач, якого видалили з друзів
     */
    public function __construct(User $remover, User $removed)
    {
        $this->remover = $remover;
        $this->removed = $removed;
    }

    /**
     * Вказує, через які канали надсилати сповіщення.
     *
     * @param object $notifiable
     * @return array
     */
    public function via($notifiable): array
    {
        return ['database', 'broadcast'];
    }

    /**
     * Отримує представлення сповіщення для збереження в базі даних.
     *
     * @param object $notifiable
     * @return array
     */
    public function toDatabase($notifiable): array
    {
        return $this->getMessages();
    }

    /**
     * Отримує представлення сповіщення для трансляції через WebSocket.
     *
     * @param object $notifiable
     * @return BroadcastMessage
     */
    public function toBroadcast($notifiable): BroadcastMessage
    {
        $now = Carbon::now('UTC')->format('Y-m-d\TH:i:s.uZ');

        return new BroadcastMessage([
            'id' => $this->id,
            'type' => get_class($this),
            'notifiable_id' => $notifiable->id,
            'notifiable_type' => get_class($notifiable),
            'data' => $this->getMessages(),
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
    protected function getMessages(): array
    {
        $userUrl = str_replace('/api', '', route('users.show', ['identifier' => $this->remover->username]));

        return [
            'message' => "Користувач <a href=\"{$userUrl}\">{$this->remover->username}</a> видалив вас із друзів.",
            'remover_id' => $this->remover->id,
            'removed_id' => $this->removed->id,
            'type' => 'friend_removed',
        ];
    }

    /**
     * Визначає канали для трансляції сповіщення.
     *
     * @return array
     */
    public function broadcastOn(): array
    {
        return [new PrivateChannel('notifications.' . $this->removed->id)];
    }

    /**
     * Визначає ім'я події для трансляції.
     *
     * @return string
     */
    public function broadcastAs(): string
    {
        return 'friend.removed';
    }
}
