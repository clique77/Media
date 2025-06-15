<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MovieRating extends Model
{
    protected $fillable = [
        'movie_id',
        'user_id',
        'rating',
    ];

    /**
     * Зв'язок з таблицею Movie (багато до одного).
     */
    public function movie(): BelongsTo
    {
        return $this->belongsTo(Movie::class);
    }

    /**
     * Зв'язок з таблицею User (багато до одного).
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}

