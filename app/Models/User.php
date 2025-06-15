<?php

namespace App\Models;

use Filament\Models\Contracts\FilamentUser;
use Filament\Models\Contracts\HasName;
use Filament\Panel;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Tymon\JWTAuth\Contracts\JWTSubject;

class User extends Authenticatable implements MustVerifyEmail, JWTSubject, FilamentUser, HasName
{
    use HasFactory, Notifiable, HasUuids;

    protected $fillable = [
        'username',
        'first_name',
        'last_name',
        'email',
        'password',
        'role',
        'avatar',
        'biography',
        'birthday',
        'country',
        'gender',
        'is_online',
        'last_seen_at',
        'is_blocked',
        'google_id',
        'github_id',
    ];

    protected $hidden = [
        'password',
        'google_id',
        'github_id',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'birthday' => 'date',
        'is_online' => 'boolean',
        'last_seen_at' => 'datetime',
        'is_blocked' => 'boolean',
    ];

    public function canAccessPanel(Panel $panel): bool
    {
        return $this->role === 'admin';
    }

    public function getFilamentName(): string
    {
        return $this->username;
    }

    public function getJWTIdentifier()
    {
        return $this->getKey();
    }

    public function getJWTCustomClaims(): array
    {
        return [
            'role' => $this->role,
        ];
    }

    public function posts(): HasMany
    {
        return $this->hasMany(Post::class);
    }

    public function comments(): HasMany
    {
        return $this->hasMany(Comment::class);
    }

    public function chats(): HasMany
    {
        return $this->hasMany(Chat::class);
    }

    public function likes(): HasMany
    {
        return $this->hasMany(Like::class);
    }

    public function views(): HasMany
    {
        return $this->hasMany(PostView::class);
    }

    public function friends()
    {
        return $this->belongsToMany(User::class, 'friendships', 'user_id', 'friend_id')
            ->wherePivot('status', 'accepted')
            ->select('users.*', 'friendships.id as pivot_friendship_id', 'friendships.user_id as pivot_user_id', 'friendships.friend_id as pivot_friend_id')
            ->union(
                $this->belongsToMany(User::class, 'friendships', 'friend_id', 'user_id')
                    ->wherePivot('status', 'accepted')
                    ->select('users.*', 'friendships.id as pivot_friendship_id', 'friendships.user_id as pivot_user_id', 'friendships.friend_id as pivot_friend_id')
            );
    }

    public function sentFriendRequests(): HasMany
    {
        return $this->hasMany(Friendship::class, 'user_id');
    }

    public function receivedFriendRequests(): HasMany
    {
        return $this->hasMany(Friendship::class, 'friend_id');
    }

    public function blockedUsers(): HasMany
    {
        return $this->hasMany(UserBlock::class, 'user_id');
    }

    public function blockedByUsers(): HasMany
    {
        return $this->hasMany(UserBlock::class, 'blocked_id');
    }

    public function settings(): HasOne
    {
        return $this->hasOne(Setting::class);
    }

    public function isFriendWith($friendId)
    {
        return Friendship::where(function($query) use ($friendId) {
            $query->where('user_id', $this->id)
                ->where('friend_id', $friendId);
        })->orWhere(function($query) use ($friendId) {
            $query->where('user_id', $friendId)
                ->where('friend_id', $this->id);
        })->exists();
    }
}
