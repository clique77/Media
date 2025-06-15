<?php

use App\Http\Controllers\Social\UserBlockController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->prefix('user-blocks')->group(function () {
    Route::get('/', [UserBlockController::class, 'index']);
    Route::post('/', [UserBlockController::class, 'store']);
    Route::delete('/{userBlock}', [UserBlockController::class, 'destroy']);
});
