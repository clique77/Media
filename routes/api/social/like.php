<?php

use App\Http\Controllers\Social\LikeController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::post('/{likeable_type}/{likeable}/likes', [LikeController::class, 'store'])->middleware('throttle:3,1');
    Route::delete('/likes/{like}', [LikeController::class, 'destroy'])->middleware('throttle:3,1');
    Route::get('/user/likes', [LikeController::class, 'userLikes']);
});
