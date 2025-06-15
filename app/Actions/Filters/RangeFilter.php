<?php

namespace App\Actions\Filters;

use Spatie\QueryBuilder\Filters\Filter;
use Illuminate\Database\Eloquent\Builder;

class RangeFilter implements Filter
{
    /**
     * Фільтрує запит за діапазоном значень для заданої властивості.
     *
     * Цей фільтр застосовує умову `whereBetween` до запиту, якщо значення фільтра є масивом
     * з двома елементами: 'from' і 'to', що вказують на межі діапазону.
     *
     * @param Builder $query Запит, до якого застосовуються фільтри
     * @param array $value Значення для фільтрації (масив з 'from' і 'to')
     * @param string $property Властивість, до якої застосовується фільтр
     * @return Builder Модифікований запит
     */
    public function __invoke(Builder $query, $value, string $property): Builder
    {
        if (is_array($value) && isset($value['from']) && isset($value['to'])) {
            $query->whereBetween($property, [$value['from'], $value['to']]);
        }

        return $query;
    }
}
