<?php

namespace App\Models;

use App\Models\Traits\HasAttachments;
use App\Models\Traits\HasSlug;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class Post extends Model
{
    use HasFactory, HasUuids, HasSlug, HasAttachments;

    protected $fillable = [
        'title',
        'content',
        'user_id',
        'attachments',
        'slug',
        'likes_count',
        'comments_count',
        'reports_count',
        'views_count',
        'comments_enabled',
        'visibility',
    ];

    protected $casts = [
        'attachments' => 'array',
        'comments_enabled' => 'boolean',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function likes(): MorphMany
    {
        return $this->morphMany(Like::class, 'likeable');
    }

    public function comments(): MorphMany
    {
        return $this->morphMany(Comment::class, 'commentable');
    }

    public function reports(): HasMany
    {
        return $this->hasMany(Report::class);
    }

    public function views(): HasMany
    {
        return $this->hasMany(PostView::class);
    }

    public function tags(): BelongsToMany
    {
        return $this->belongsToMany(Tag::class, 'post_tag', 'post_id', 'tag_id');
    }
}
