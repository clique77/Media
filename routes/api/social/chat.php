<?php

use App\Http\Controllers\Social\ChatController;
use Illuminate\Support\Facades\Route;

Route::prefix('chats')->middleware(['auth', 'verified'])->group(function () {
    Route::get('/', [ChatController::class, 'index']);
    Route::post('/', [ChatController::class, 'store']);
    Route::get('/{chat}', [ChatController::class, 'show']);
    Route::put('/{chat}', [ChatController::class, 'update']);
    Route::delete('/{chat}', [ChatController::class, 'destroy']);
});
