<?php

use App\Http\Controllers\Social\PostViewController;
use Illuminate\Support\Facades\Route;

Route::get('post-views', [PostViewController::class, 'index'])->middleware(['auth', 'verified']);
