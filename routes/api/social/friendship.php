<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Social\FriendshipController;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::prefix('friendships')->group(function () {
        Route::post('/send', [FriendshipController::class, 'sendFriendRequest']);
        Route::post('/{friendship}/accept', [FriendshipController::class, 'acceptFriendRequest']);
        Route::post('/{friendship}/reject', [FriendshipController::class, 'rejectFriendRequest']);
        Route::delete('/{friendship}/cancel', [FriendshipController::class, 'cancelFriendRequest']);
        Route::delete('/{friendship}/remove', [FriendshipController::class, 'removeFriend']);

        Route::get('/{user}/sent-requests', [FriendshipController::class, 'getSentFriendRequests']);
        Route::get('/{user}/received-requests', [FriendshipController::class, 'getReceivedFriendRequests']);
    });
});

Route::get('/friendships/{user}/friends', [FriendshipController::class, 'getFriends']);
