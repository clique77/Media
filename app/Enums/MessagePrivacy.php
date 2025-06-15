<?php

namespace App\Enums;

enum MessagePrivacy: string
{
    case EVERYONE = 'everyone';
    case FRIENDS_ONLY = 'friends_only';
    case NO_ONE = 'no_one';

    public static function getValues(): array
    {
        return array_map(fn($item) => $item->value, MessagePrivacy::cases());
    }
}
