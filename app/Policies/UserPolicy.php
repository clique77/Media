<?php

namespace App\Policies;

use App\Enums\Role;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class UserPolicy
{
    /**
     * Визначає, чи користувач може переглядати список користувачів.
     */
    public function viewAny(?User $user): bool
    {
        return true;
    }

    /**
     * Визначає, чи користувач може переглядати конкретного користувача.
     */
    public function view(?User $user, ?User $model): bool
    {
        return true;
    }

    /**
     * Визначає, чи користувач може створювати нових користувачів.
     */
    public function create(User $user): bool
    {
        return $user->role === 'admin';
    }

    /**
     * Визначає, чи користувач може оновлювати профіль іншого користувача.
     */
    public function update(User $user, User $model): bool
    {
        return $user->role === 'admin' || $user->id === $model->id;
    }

    /**
     * Визначає, чи користувач може видаляти користувача.
     */
    public function delete(User $user, User $model): bool
    {
        return $user->role === 'admin' && $user->id !== $model->id;
    }
}
