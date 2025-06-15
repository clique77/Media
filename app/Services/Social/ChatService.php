<?php

namespace App\Services\Social;

use App\Actions\Social\ChatActions\CreateChatAction;
use App\Actions\Social\ChatActions\DeleteChatAction;
use App\Actions\Social\ChatActions\GetChatAction;
use App\Actions\Social\ChatActions\GetChatsAction;
use App\Actions\Social\ChatActions\UpdateChatAction;
use App\Models\Chat;
use Exception;
use Illuminate\Contracts\Pagination\CursorPaginator;

class ChatService
{
    public function __construct(
        protected CreateChatAction $createChatAction,
        protected DeleteChatAction $deleteChatAction,
        protected GetChatAction $getChatAction,
        protected GetChatsAction $getChatsAction,
        protected UpdateChatAction $updateChatAction
    ) {
    }

    /**
     * @throws Exception
     */
    public function create(array $data): Chat
    {
        return ($this->createChatAction)($data);
    }

    /**
     * @throws Exception
     */
    public function delete(Chat $chat): void
    {
        ($this->deleteChatAction)($chat);
    }

    /**
     * @throws Exception
     */
    public function getChat(string $chatId): ?Chat
    {
        return ($this->getChatAction)($chatId);
    }

    /**
     * @throws Exception
     */
    public function getChats(int $perPage = 20): CursorPaginator
    {
        return ($this->getChatsAction)($perPage);
    }

    /**
     * @throws Exception
     */
    public function update(Chat $chat, array $data): Chat
    {
        return ($this->updateChatAction)($chat, $data);
    }
}
