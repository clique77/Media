<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\EmailVerificationController;

Route::prefix('email')->group(function () {
    Route::get('/verify', [EmailVerificationController::class, 'show'])
        ->name('verification.notice');

    Route::get('/verify/{id}/{hash}', [EmailVerificationController::class, 'verify'])
        ->middleware(['signed', 'email.verify'])
        ->name('verification.verify');

    Route::post('/resend', [EmailVerificationController::class, 'resend'])
        ->name('verification.resend');
});
