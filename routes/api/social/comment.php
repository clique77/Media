<?php

use App\Http\Controllers\Social\CommentController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::post('{commentable_type}/{commentable}/comments', [CommentController::class, 'store'])
        ->name('comments.store');

    Route::put('comments/{comment}', [CommentController::class, 'update'])
        ->name('comments.update');

    Route::delete('comments/{comment}', [CommentController::class, 'destroy'])
        ->name('comments.destroy');

    Route::get('user/comments', [CommentController::class, 'userComments'])
        ->name('comments.user');
});

Route::get('{commentable_type}/{commentable}/comments', [CommentController::class, 'index'])
    ->name('comments.index');

Route::get('comments/{comment}', [CommentController::class, 'show'])
    ->name('comments.show');

Route::get('comments/{comment}/replies', [CommentController::class, 'replies'])
    ->name('comments.replies');
