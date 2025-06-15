<?php

namespace App\Http\Requests\Social\SettingRequests;

use App\Enums\NotificationType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Enum;

class UpdateNotificationRequest extends FormRequest
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
            'type' => ['required', new Enum(NotificationType::class)],
            'enabled' => ['required', 'boolean'],
        ];
    }

    /**
     * Get the notification type.
     *
     * @return NotificationType
     */
    public function type(): NotificationType
    {
        return NotificationType::from($this->type);
    }

    /**
     * Get the enabled status.
     *
     * @return bool
     */
    public function enabled(): bool
    {
        return $this->enabled;
    }
}
