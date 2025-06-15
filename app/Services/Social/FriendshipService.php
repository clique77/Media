<?php
namespace App\Services\Social;

use App\Actions\Social\FriendshipActions\AcceptFriendRequestAction;
use App\Actions\Social\FriendshipActions\CancelFriendRequestAction;
use App\Actions\Social\FriendshipActions\GetFriendsAction;
use App\Actions\Social\FriendshipActions\GetReceivedFriendRequestsAction;
use App\Actions\Social\FriendshipActions\GetSentFriendRequestsAction;
use App\Actions\Social\FriendshipActions\RejectFriendRequestAction;
use App\Actions\Social\FriendshipActions\RemoveFriendAction;
use App\Actions\Social\FriendshipActions\SendFriendRequestAction;
use App\Models\Friendship;
use App\Models\User;
use Exception;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

class FriendshipService
{
    public function __construct(
        protected AcceptFriendRequestAction $acceptFriendRequestAction,
        protected CancelFriendRequestAction $cancelFriendRequestAction,
        protected GetFriendsAction $getFriendsAction,
        protected GetReceivedFriendRequestsAction $getReceivedFriendRequestsAction,
        protected GetSentFriendRequestsAction $getSentFriendRequestsAction,
        protected RejectFriendRequestAction $rejectFriendRequestAction,
        protected RemoveFriendAction $removeFriendAction,
        protected SendFriendRequestAction $sendFriendRequestAction
    ) {
    }

    /**
     * Прийняття запиту на дружбу.
     *
     * @throws Exception
     */
    public function acceptFriendRequest(Friendship $friendship): Friendship
    {
        return ($this->acceptFriendRequestAction)($friendship);
    }

    /**
     * Скасування запиту на дружбу.
     *
     * @throws Exception
     */
    public function cancelFriendRequest(Friendship $friendship): void
    {
        ($this->cancelFriendRequestAction)($friendship);
    }

    /**
     * Надсилання запиту на дружбу.
     *
     * @throws Exception
     */
    public function sendFriendRequest(string $senderId, string $receiverId): Friendship
    {
        return ($this->sendFriendRequestAction)($senderId, $receiverId);
    }

    /**
     * Видалення друга.
     *
     * @throws Exception
     */
    public function removeFriend(Friendship $friendship): void
    {
        ($this->removeFriendAction)($friendship);
    }

    /**
     * Відхилення запиту на дружбу.
     *
     * @throws Exception
     */
    public function rejectFriendRequest(Friendship $friendship): void
    {
        ($this->rejectFriendRequestAction)($friendship);
    }

    /**
     * Отримання списку друзів.
     */
    public function getFriends(User $user): Collection
    {
        return ($this->getFriendsAction)($user);
    }

    /**
     * Отримання запитів на дружбу, що були надіслані.
     *
     * @throws Exception
     */
    public function getSentFriendRequests(User $user, int $perPage = 20): LengthAwarePaginator
    {
        return ($this->getSentFriendRequestsAction)($user, $perPage);
    }

    /**
     * Отримання запитів на дружбу, що були отримані.
     */
    public function getReceivedFriendRequests(User $user, int $perPage = 20): LengthAwarePaginator
    {
        return ($this->getReceivedFriendRequestsAction)($user, $perPage);
    }
}

