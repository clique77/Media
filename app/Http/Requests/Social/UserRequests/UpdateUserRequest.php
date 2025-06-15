<?php

namespace App\Http\Requests\Social\UserRequests;

use App\Enums\FileExtension;
use App\Enums\Gender;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateUserRequest extends FormRequest
{
    /**
     * Визначає, чи авторизований користувач для цього запиту.
     *
     * @return bool
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Отримує валідаційні правила для запиту.
     *
     * @return array
     */
    public function rules(): array
    {
        $allowedExtensions = FileExtension::getImageExtensions();
        $mimes = implode(',', $allowedExtensions);

        return [
            'username' => [
                'nullable',
                'string',
                'min:4',
                'max:16',
                Rule::unique('users', 'username')->ignore($this->user()->id),
            ],
            'first_name' => 'nullable|string|min:2|max:16|regex:/^[\pL\'-]+$/u',
            'last_name' => 'nullable|string|min:2|max:24|regex:/^[\pL\'-]+$/u',
            'avatar' => ['nullable', 'image', 'mimes:' . $mimes, 'max:20480'],
            'gender' => ['nullable', 'string', Rule::in(Gender::getValues())],
            'biography' => 'nullable|string|max:564',
            'birthday' => 'nullable|date',
            'country' => 'nullable|string|max:24',
            'is_online' => 'nullable|boolean',
            'last_seen_at' => 'nullable|date',
        ];
    }
}
