<?php

namespace App\Enums;

enum NotificationType: string
{
    case FRIEND_REQUEST = 'friend_request';
    case NEW_MESSAGE = 'new_message';
    case POST_COMMENT = 'post_comment';
    case POST_LIKE = 'post_like';
    case COMMENT_REPLY = 'comment_reply';

    public static function getValues(): array
    {
        return array_map(fn($item) => $item->value, NotificationType::cases());
    }
}
