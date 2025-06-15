<?php

use App\Http\Controllers\Social\UserStatusController;
use Illuminate\Support\Facades\Route;

Route::prefix('user/status')->group(function () {
    Route::middleware(['auth'])->group(function () {
        Route::post('/online', [UserStatusController::class, 'setOnline']);
        Route::post('/offline', [UserStatusController::class, 'setOffline']);
    });

    Route::get('/online-ids', [UserStatusController::class, 'getOnlineUserIds']);
});
