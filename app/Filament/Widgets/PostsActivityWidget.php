<?php

namespace App\Filament\Widgets;

use Filament\Widgets\ChartWidget;
use App\Models\Post;
use Carbon\Carbon;

class PostsActivityWidget extends ChartWidget
{
    protected static ?string $heading = 'Активність публікацій';

    protected function getData(): array
    {
        $dates = collect(range(6, 0))->map(function ($daysAgo) {
            return Carbon::now()->subDays($daysAgo)->format('Y-m-d');
        });

        $postsData = $dates->map(function ($date) {
            return Post::whereDate('created_at', $date)->count();
        });

        return [
            'labels' => $dates->toArray(),
            'datasets' => [
                [
                    'label' => 'Кількість публікацій',
                    'data' => $postsData->toArray(),
                    'borderColor' => '#36A2EB',
                    'backgroundColor' => 'rgba(54, 162, 235, 0.2)',
                ],
            ],
        ];
    }

    protected function getType(): string
    {
        return 'line';
    }
}
