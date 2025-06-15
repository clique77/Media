<?php

namespace App\Events\Social\Chat;

use App\Models\Chat;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ChatUpdatedEvent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(private Chat $chat)
    {
    }

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel("chats.user.{$this->chat->user_one_id}"),
            new PrivateChannel("chats.user.{$this->chat->user_two_id}"),
        ];
    }

    public function broadcastAs(): string
    {
        return 'chat.updated';
    }

    public function broadcastWith(): array
    {
        return [
            'chat' => $this->chat->toArray(),
        ];
    }
}

