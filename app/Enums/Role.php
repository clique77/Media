<?php

namespace App\Enums;

enum Role: string
{
    case USER = 'user';
    case MODERATOR = 'moderator';
    case ADMIN = 'admin';

    public static function getValues(): array
    {
        return array_map(fn($item) => $item->value, Role::cases());
    }
}
