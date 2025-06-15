<?php

namespace App\Enums;

enum FriendRequestPrivacy: string
{
    case EVERYONE = 'everyone';
    case NO_ONE = 'no_one';

    public static function getValues(): array
    {
        return array_map(fn($item) => $item->value, FriendRequestPrivacy::cases());
    }
}
