<?php

namespace App\Providers;

use Illuminate\Foundation\Support\Providers\RouteServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Route;
use App\Models\Post;
use App\Models\Movie;
use App\Models\Comment;

class RouteServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        parent::boot();

        Route::bind('likeable', function ($value, $route) {
            $likeableType = $route->parameter('likeable_type');

            return match ($likeableType) {
                'posts' => Post::findOrFail($value),
                'movies' => Movie::findOrFail($value),
                'comments' => Comment::findOrFail($value),
                default => abort(404, 'Invalid likeable type'),
            };
        });

        Route::bind('commentable', function ($value, $route) {
            $commentableType = $route->parameter('commentable_type');

            return match ($commentableType) {
                'posts' => Post::findOrFail($value),
                'movies' => Movie::findOrFail($value),
                default => abort(404, 'Invalid commentable type'),
            };
        });
    }
}
