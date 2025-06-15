<?php

namespace App\Http\Requests\Social\SettingRequests;

use App\Enums\MessagePrivacy;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Enum;

class UpdateMessagePrivacyRequest extends FormRequest
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
            'privacy' => ['required', new Enum(MessagePrivacy::class)],
        ];
    }

    /**
     * Get the message privacy setting.
     *
     * @return MessagePrivacy
     */
    public function privacy(): MessagePrivacy
    {
        return MessagePrivacy::from($this->privacy);
    }
}
