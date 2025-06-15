<?php

namespace App\Providers;

use App\Services\Files\FileService;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Facades\Broadcast;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->singleton('fileService', function ($app) {
            return new FileService();
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Broadcast::routes(['middleware' => ['auth']]);

        require base_path('routes/channels.php');

        if (env('APP_ENV') !== 'local') {
            URL::forceScheme('https');
        }
    }
}
