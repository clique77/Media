<?php

namespace App\Http\Requests\Social\UserBlockRequests;

use App\Enums\BlockReason;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CreateUserBlockRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Правила валідації.
     */
    public function rules(): array
    {
        return [
            'blocked_id' => ['required', 'exists:users,id'],
            'reason'  => ['nullable', Rule::in(BlockReason::getValues())],
        ];
    }
}
