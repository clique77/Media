<?php

namespace App\Models;

use App\Models\Traits\HasSlug;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class Movie extends Model
{
    use HasFactory, HasSlug;

    protected $fillable = [
        'title',
        'description',
        'slug',
        'release_date',
        'runtime',
        'poster_path',
        'backdrop_path',
        'video_path',
        'api_rating',
        'user_rating',
        'director_id',
    ];

    protected $casts = [
        'release_date' => 'date',
    ];

    /**
     * Зв'язок з таблицею Director (1 до 1).
     */
    public function director(): BelongsTo
    {
        return $this->belongsTo(Director::class);
    }

    /**
     * Зв'язок з таблицею Actor (багато до багатьох).
     */
    public function actors(): BelongsToMany
    {
        return $this->belongsToMany(Actor::class, 'movie_actor');
    }

    /**
     * Зв'язок з таблицею Genre (багато до багатьох).
     */
    public function genres(): BelongsToMany
    {
        return $this->belongsToMany(Genre::class, 'movie_genre');
    }

    public function comments(): MorphMany
    {
        return $this->morphMany(Comment::class, 'commentable');
    }
}

