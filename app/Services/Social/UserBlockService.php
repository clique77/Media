<?php

namespace App\Services\Social;

use App\Actions\Social\UserBlockActions\CreateUserBlockAction;
use App\Actions\Social\UserBlockActions\DeleteUserBlockAction;
use App\Actions\Social\UserBlockActions\GetBlockedUsersAction;
use App\Models\UserBlock;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Auth;
use Exception;

class UserBlockService
{
    public function __construct(
        protected CreateUserBlockAction $createUserBlockAction,
        protected DeleteUserBlockAction $deleteUserBlockAction,
        protected GetBlockedUsersAction $getBlockedUsersAction
    ) {
    }

    /**
     * Створює запис про блокування користувача.
     *
     * @param array $data Дані блокування (blocked_id, reason)
     * @return UserBlock
     * @throws Exception
     */
    public function create(array $data): UserBlock
    {
        return ($this->createUserBlockAction)($data);
    }

    /**
     * Видаляє запис про блокування (розблоковує користувача).
     *
     * @param UserBlock $userBlock
     * @return void
     * @throws Exception
     */
    public function delete(UserBlock $userBlock): void
    {
        ($this->deleteUserBlockAction)($userBlock);
    }

    /**
     * Повертає список заблокованих користувачів поточного користувача з пагінацією.
     *
     * @return Collection
     * @throws Exception
     */
    public function getUserBlocks(): Collection
    {
        return ($this->getBlockedUsersAction)();
    }
}
