<?php

namespace App\Filament\Widgets;

use App\Models\Comment;
use App\Models\Like;
use App\Models\Post;
use Filament\Widgets\ChartWidget;

class MediaStatsWidget extends ChartWidget
{
    protected static ?string $heading = 'Медіастатистика';

    protected function getData(): array
    {
        $totalPosts = Post::count();
        $totalLikes = Like::count();
        $totalComments = Comment::count();

        return [
            'datasets' => [
                [
                    'label' => 'Statistics',
                    'data' => [$totalPosts, $totalLikes, $totalComments],
                    'backgroundColor' => ['#3498db', '#e74c3c', '#2ecc71'],
                ],
            ],
            'labels' => ['Пости', 'Лайки', 'Коментарі'],
        ];
    }

    protected function getType(): string
    {
        return 'doughnut';
    }
}
