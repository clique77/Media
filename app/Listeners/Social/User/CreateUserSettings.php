<?php

namespace App\Listeners\Social\User;

use App\Enums\FriendRequestPrivacy;
use App\Enums\MessagePrivacy;
use App\Enums\NotificationType;
use App\Events\Social\User\UserRegisteredEvent;
use App\Models\Setting;

class CreateUserSettings
{
    public function handle(UserRegisteredEvent $event): void
    {
        Setting::create([
            'user_id' => $event->user->id,
            'notifications_enabled' => array_fill_keys(NotificationType::getValues(), true),
            'message_privacy' => MessagePrivacy::EVERYONE->value,
            'friend_request_privacy' => FriendRequestPrivacy::EVERYONE->value,
        ]);
    }
}
