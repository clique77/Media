<?php
use App\Http\Controllers\Auth\OAuth2Controller;
use Illuminate\Support\Facades\Route;

Route::prefix('auth')->group(function () {
    Route::get('/google', [OAuth2Controller::class, 'redirectToGoogle']);
    Route::get('/google/callback', [OAuth2Controller::class, 'handleGoogleCallback']);

    Route::get('/github', [OAuth2Controller::class, 'redirectToGitHub']);
    Route::get('/github/callback', [OAuth2Controller::class, 'handleGitHubCallback']);
});
