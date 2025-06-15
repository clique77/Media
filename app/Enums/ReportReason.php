<?php

namespace App\Enums;

enum ReportReason: string
{
    case SPAM = 'Spam';
    case COPYRIGHT = 'Copyright';
    case OFFENSIVE_CONTENT = 'Offensive_content';
    case MISLEADING = 'Misleading';
    case OTHER = 'Other';

    public static function getValues(): array
    {
        return array_map(fn($item) => $item->value, ReportReason::cases());
    }
}
