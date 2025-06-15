<?php

namespace App\Models;

use App\Enums\NotificationType;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Setting extends Model
{
    protected $fillable = [
        'user_id',
        'notifications_enabled',
        'message_privacy',
        'friend_request_privacy',
    ];

    protected $casts = [
        'notifications_enabled' => 'array',
    ];

    /**
     * Зв’язок із користувачем.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Змінити значення сповіщень за типом.
     *
     * @param NotificationType $type Тип сповіщення (значення enum)
     * @param bool $enabled Стан сповіщення (true/false)
     */
    public function setNotificationEnabled(NotificationType $type, bool $enabled): void
    {

        $notifications = $this->notifications_enabled ?? [];

        $notifications[$type->value] = $enabled;

        $this->notifications_enabled = $notifications;

        $this->save();
    }

    /**
     * Отримати значення сповіщення для конкретного типу.
     *
     * @param NotificationType $type Тип сповіщення
     * @return bool
     */
    public function getNotificationEnabled(NotificationType $type): bool
    {
        return $this->notifications_enabled[$type->value] ?? true;
    }
}
