<?php

namespace App\Http\Requests\Social\ReportRequests;

use App\Enums\ReportReason;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CreateReportRequest extends FormRequest
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
            'post_id' => ['required', 'exists:posts,id'],
            'reason'  => ['nullable', Rule::in(ReportReason::getValues())],
        ];
    }
}
