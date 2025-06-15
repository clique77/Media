<?php

use App\Http\Controllers\Social\PostController;
use Illuminate\Support\Facades\Route;

Route::prefix('posts')->middleware(['auth', 'verified'])->group(function () {
    Route::post('/', [PostController::class, 'store'])->name('posts.store');
    Route::post('/{post}', [PostController::class, 'update'])->name('posts.update');
    Route::delete('/{post}', [PostController::class, 'destroy'])->name('posts.destroy');
});

Route::prefix('posts')->group(function () {
    Route::get('/', [PostController::class, 'index'])->name('posts.index');
    Route::get('/{identifier}', [PostController::class, 'show'])->name('posts.show');
});
