<?php

use App\Models\Chat;
use App\Models\User;
use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('chat.{chatId}', function (User $user, $chatId) {
    $chat = Chat::findOrFail($chatId);

    return $user->can('view', $chat);
});

Broadcast::channel('notifications.{userId}', function (User $user, $userId) {
    return $user->id === $userId;
});

Broadcast::channel('chats.user.{userId}', function (User $user, $userId) {
    return $user->id === $userId;
});

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return $user->id === $id;
});
