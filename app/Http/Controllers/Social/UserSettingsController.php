<?php

namespace App\Http\Controllers\Social;

use App\Http\Controllers\Controller;
use App\Http\Requests\Social\SettingRequests\UpdateFriendRequestPrivacyRequest;
use App\Http\Requests\Social\SettingRequests\UpdateMessagePrivacyRequest;
use App\Http\Requests\Social\SettingRequests\UpdateNotificationRequest;
use App\Services\Social\UserSettingsService;
use Illuminate\Http\JsonResponse;

class UserSettingsController extends Controller
{
    public function __construct(protected UserSettingsService $settingsService)
    {
    }

    /**
     * Update notification setting.
     *
     * @param UpdateNotificationRequest $request
     * @return JsonResponse
     */
    public function updateNotification(UpdateNotificationRequest $request): JsonResponse
    {
        $settings = $this->settingsService->updateNotificationSetting(
            $request->type(),
            $request->enabled()
        );

        return response()->json([
            'message' => 'Notification setting updated successfully',
            'settings' => $settings,
        ]);
    }

    /**
     * Update message privacy setting.
     *
     * @param UpdateMessagePrivacyRequest $request
     * @return JsonResponse
     */
    public function updateMessagePrivacy(UpdateMessagePrivacyRequest $request): JsonResponse
    {
        $settings = $this->settingsService->updateMessagePrivacy($request->privacy());

        return response()->json([
            'message' => 'Message privacy setting updated successfully',
            'settings' => $settings,
        ]);
    }

    /**
     * Update friend request privacy setting.
     *
     * @param UpdateFriendRequestPrivacyRequest $request
     * @return JsonResponse
     */
    public function updateFriendRequestPrivacy(UpdateFriendRequestPrivacyRequest $request): JsonResponse
    {
        $settings = $this->settingsService->updateFriendRequestPrivacy($request->privacy());

        return response()->json([
            'message' => 'Friend request privacy setting updated successfully',
            'settings' => $settings,
        ]);
    }

    /**
     * Get the authenticated user's settings.
     *
     * @return JsonResponse
     */
    public function getSettings(): JsonResponse
    {
        $settings = $this->settingsService->getUserSettings();

        return response()->json($settings);
    }
}
