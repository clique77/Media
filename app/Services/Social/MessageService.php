<?php

namespace App\Services\Social;

use App\Actions\Social\MessageActions\CreateMessageAction;
use App\Actions\Social\MessageActions\DeleteMessageAction;
use App\Actions\Social\MessageActions\GetMessagesAction;
use App\Actions\Social\MessageActions\UpdateMessageAction;
use App\Models\Chat;
use App\Models\Message;
use Illuminate\Pagination\CursorPaginator;

class MessageService
{
    public function __construct(
        protected CreateMessageAction $createMessageAction,
        protected DeleteMessageAction $deleteMessageAction,
        protected GetMessagesAction $getMessagesAction,
        protected UpdateMessageAction $updateMessageAction
    ) {
    }

    public function create(array $data): Message
    {
        return ($this->createMessageAction)($data);
    }

    public function delete(Message $message): void
    {
        ($this->deleteMessageAction)($message);
    }

    public function getMessages(
        Chat $chat,
        int $perPage = 20,
    ): CursorPaginator {
        return ($this->getMessagesAction)($chat, $perPage);
    }

    public function update(Message $message, array $data): Message
    {
        return ($this->updateMessageAction)($message, $data);
    }
}
