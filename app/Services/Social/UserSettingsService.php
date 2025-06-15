<?php

namespace App\Services\Social;

use App\Enums\FriendRequestPrivacy;
use App\Enums\MessagePrivacy;
use App\Enums\NotificationType;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Support\Facades\Auth;

class UserSettingsService
{
    /**
     * Update notification setting for a specific type.
     *
     * @param NotificationType $type
     * @param bool $enabled
     * @return Setting
     */
    public function updateNotificationSetting(NotificationType $type, bool $enabled): Setting
    {
        $user = Auth::user();
        $settings = $this->getOrCreateSettings($user);

        $settings->setNotificationEnabled($type, $enabled);

        return $settings;
    }

    /**
     * Update message privacy setting.
     *
     * @param MessagePrivacy $privacy
     * @return Setting
     */
    public function updateMessagePrivacy(MessagePrivacy $privacy): Setting
    {
        $user = Auth::user();
        $settings = $this->getOrCreateSettings($user);

        $settings->update([
            'message_privacy' => $privacy->value
        ]);

        return $settings;
    }

    /**
     * Update friend request privacy setting.
     *
     * @param FriendRequestPrivacy $privacy
     * @return Setting
     */
    public function updateFriendRequestPrivacy(FriendRequestPrivacy $privacy): Setting
    {
        $user = Auth::user();
        $settings = $this->getOrCreateSettings($user);

        $settings->update([
            'friend_request_privacy' => $privacy->value
        ]);

        return $settings;
    }

    /**
     * Get user settings.
     *
     * @return Setting
     */
    public function getUserSettings(): Setting
    {
        $user = Auth::user();
        return $this->getOrCreateSettings($user);
    }

    /**
     * Get or create settings for a user.
     *
     * @param User $user
     * @return Setting
     */
    private function getOrCreateSettings(User $user): Setting
    {
        return Setting::firstOrCreate(
            ['user_id' => $user->id],
            [
                'notifications_enabled' => [],
                'message_privacy' => MessagePrivacy::EVERYONE->value,
                'friend_request_privacy' => FriendRequestPrivacy::EVERYONE->value,
            ]
        );
    }
}
