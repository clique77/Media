<?php

namespace App\Http\Requests\Social\FriendshipRequests;

use Illuminate\Foundation\Http\FormRequest;

class SendFriendRequestRequest extends FormRequest
{
    /**
     * Визначає, чи має користувач право робити цей запит.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Правила валідації для запиту.
     */
    public function rules(): array
    {
        return [
            'sender_id' => 'required|string|exists:users,id',
            'receiver_id' => 'required|string|exists:users,id',
        ];
    }
}
