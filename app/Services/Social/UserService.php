<?php

namespace App\Services\Social;

use App\Actions\Social\UserActions\DeleteUserAction;
use App\Actions\Social\UserActions\GetTopUsersAction;
use App\Actions\Social\UserActions\GetUserAction;
use App\Actions\Social\UserActions\GetUsersAction;
use App\Actions\Social\UserActions\UpdateUserAction;
use App\Models\User;
use Exception;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\CursorPaginator;

class UserService
{
    public function __construct(
        protected GetUserAction $getUserAction,
        protected GetUsersAction $getUsersAction,
        protected UpdateUserAction $updateUserAction,
        protected DeleteUserAction $deleteUserAction,
        protected GetTopUsersAction $getTopUsersAction
    ) {
    }

    /**
     * @throws Exception
     */
    public function getUser(string $identifier): array
    {
        return ($this->getUserAction)($identifier);
    }

    /**
     * @throws Exception
     */
    public function getUsers(int $perPage = 10): CursorPaginator
    {
        return ($this->getUsersAction)($perPage);
    }

    /**
     * @throws Exception
     */
    public function update(User $user, array $data): User
    {
        return ($this->updateUserAction)($user, $data);
    }

    /**
     * @throws Exception
     */
    public function delete(User $user): void
    {
        ($this->deleteUserAction)($user);
    }

    /**
     * @throws Exception
     */
    public function getTopUsers(): Collection
    {
        return ($this->getTopUsersAction)();
    }

    /**
     * @throws Exception
     */
    public function me(): User
    {
        $user = auth()->user();

        if (!$user) {
            throw new Exception('Користувач не авторизований.');
        }

        return $user->makeHidden(['password', 'google_id', 'github_id']);
    }

}
