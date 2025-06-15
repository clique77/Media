<?php

use App\Http\Controllers\Social\NotificationController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::post('/notifications/mark-as-read', [NotificationController::class, 'markAsRead']);
    Route::post('/notifications/{notificationId}/mark-as-read', [NotificationController::class, 'markSingleAsRead']);
    Route::delete('/notifications/{notificationId}', [NotificationController::class, 'delete']);
});
