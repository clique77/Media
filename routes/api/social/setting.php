<?php

use App\Http\Controllers\Social\UserSettingsController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->prefix('settings')->group(function () {
    Route::get('/', [UserSettingsController::class, 'getSettings'])->name('settings.get');
    Route::post('/notifications', [UserSettingsController::class, 'updateNotification'])->name('settings.notifications.update');
    Route::post('/message-privacy', [UserSettingsController::class, 'updateMessagePrivacy'])->name('settings.message-privacy.update');
    Route::post('/friend-request-privacy', [UserSettingsController::class, 'updateFriendRequestPrivacy'])->name('settings.friend-request-privacy.update');
});
