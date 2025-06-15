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

class FriendRequestRejectedNotification extends Notification implements ShouldBroadcast, ShouldQueue
{
    use Queueable;

    protected User $rejector;
    protected User $sender;

    /**
     * Створює новий екземпляр сповіщення.
     *
     * @param User $rejector Користувач, який відхилив запит
     * @param User $sender Користувач, який надіслав запит
     */
    public function __construct(User $rejector, User $sender)
    {
        $this->rejector = $rejector;
        $this->sender = $sender;
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
        return $this->getNotificationData();
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
        $userUrl = str_replace('/api', '', route('users.show', ['identifier' => $this->rejector->username]));

        return [
            'message' => "Користувач <a href=\"{$userUrl}\">{$this->rejector->username}</a> відхилив ваш запит на дружбу.",
            'rejector_id' => $this->rejector->id,
            'sender_id' => $this->sender->id,
            'type' => 'friend_remove',
        ];
    }

    /**
     * Визначає канали для трансляції сповіщення.
     *
     * @return array
     */
    public function broadcastOn(): array
    {
        return [new PrivateChannel('notifications.' . $this->sender->id)];
    }

    /**
     * Визначає ім'я події для трансляції.
     *
     * @return string
     */
    public function broadcastAs(): string
    {
        return 'friend-request.rejected';
    }
}
