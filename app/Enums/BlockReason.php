<?php

namespace App\Enums;

enum BlockReason: string
{
    case SPAM = 'Spam';
    case HARASSMENT = 'Harassment';
    case OFFENSIVE_CONTENT = 'Offensive Content';
    case OTHER = 'Other';

    public static function getValues(): array
    {
        return array_map(fn($item) => $item->value, BlockReason::cases());
    }
}
