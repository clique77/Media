<?php

namespace App\Policies;

use App\Models\User;
use App\Models\UserBlock;
use Illuminate\Auth\Access\Response;

class UserBlockPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return $user->role === 'admin';
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, UserBlock $userBlock): bool
    {
        return $user->role === 'admin';
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->role === 'admin';
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, UserBlock $userBlock): bool
    {
        return false;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, UserBlock $userBlock): bool
    {
        return $userBlock->user_id === $user->id || $user->role === 'admin';
    }
}
