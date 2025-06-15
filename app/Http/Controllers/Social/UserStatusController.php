<?php

namespace App\Http\Controllers\Social;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use App\Events\Social\User\UserOnlineEvent;
use App\Events\Social\User\UserOfflineEvent;

class UserStatusController extends Controller
{
    public function setOnline(): JsonResponse
    {
        $user = Auth::user();

        $user->update([
            'is_online' => true,
        ]);

        broadcast(new UserOnlineEvent($user));

        return response()->json(['message' => 'User is online']);
    }

    public function setOffline(): JsonResponse
    {
        $user = Auth::user();

        $user->update([
            'is_online' => false,
            'last_seen_at' => now(),
        ]);

        broadcast(new UserOfflineEvent($user));

        return response()->json(['message' => 'User is offline']);
    }

    public function getOnlineUserIds(): JsonResponse
    {
        $onlineUserIds = User::where('is_online', true)->pluck('id');

        return response()->json($onlineUserIds);
    }

}


