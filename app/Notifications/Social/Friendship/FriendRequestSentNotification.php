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

class FriendRequestSentNotification extends Notification implements ShouldBroadcast, ShouldQueue
{
    use Queueable;

    protected User $sender;
    protected User $receiver;

    /**
     * Створює новий екземпляр сповіщення.
     *
     * @param User $sender Користувач, який надіслав запит у друзі
     * @param User $receiver Користувач, якому надіслано запит
     */
    public function __construct(User $sender, User $receiver)
    {
        $this->sender = $sender;
        $this->receiver = $receiver;
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
     * Отримує дані сповіщення для бази даних та передачі.
     *
     * @return array
     */
    protected function getNotificationData(): array
    {
        $userUrl = str_replace('/api', '', route('users.show', ['identifier' => $this->receiver->username]));

        return [
            'message' => "Ви надіслали запит у дружбу до <a href=\"{$userUrl}\">{$this->receiver->username}</a>",
            'sender_id' => $this->sender->id,
            'receiver_id' => $this->receiver->id,
            'type' => 'friend_add',
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
        return 'friend-request.sent';
    }
}
