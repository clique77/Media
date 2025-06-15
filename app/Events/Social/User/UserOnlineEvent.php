<?php

namespace App\Events\Social\User;

use App\Models\User;
use Illuminate\Broadcasting\Channel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Queue\SerializesModels;

class UserOnlineEvent implements ShouldBroadcastNow
{
    use SerializesModels;

    public function __construct(public User $user)
    {
    }

    public function broadcastOn(): Channel
    {
        return new Channel('public-user-status');
    }

    public function broadcastAs(): string
    {
        return 'user.online';
    }

    public function broadcastWith(): array
    {
        return [
            'id' => $this->user->id,
            'name' => $this->user->name,
        ];
    }
}
