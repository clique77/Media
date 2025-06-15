<?php

namespace App\Http\Requests\Social\SettingRequests;

use App\Enums\FriendRequestPrivacy;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Enum;

class UpdateFriendRequestPrivacyRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array
     */
    public function rules(): array
    {
        return [
            'privacy' => ['required', new Enum(FriendRequestPrivacy::class)],
        ];
    }

    /**
     * Get the friend request privacy setting.
     *
     * @return FriendRequestPrivacy
     */
    public function privacy(): FriendRequestPrivacy
    {
        return FriendRequestPrivacy::from($this->privacy);
    }
}
