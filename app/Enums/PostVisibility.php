<?php

namespace App\Enums;

enum PostVisibility: string
{
    case PUBLIC = 'public';

    case PRIVATE = 'private';
    case FRIENDS = 'friends';

    public static function getValues(): array
    {
        return array_map(fn($item) => $item->value, PostVisibility::cases());
    }
}
