<?php

namespace App\Enums;

enum Gender: string
{
    case MALE = 'male';
    case FEMALE = 'female';

    public static function getValues(): array
    {
        return array_map(fn($item) => $item->value, Gender::cases());
    }
}
