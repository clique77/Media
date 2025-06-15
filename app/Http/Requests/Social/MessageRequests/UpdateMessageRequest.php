<?php

namespace App\Http\Requests\Social\MessageRequests;

use App\Enums\FileExtension;
use Illuminate\Foundation\Http\FormRequest;

class UpdateMessageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $allowedExtensions = array_merge(
            FileExtension::getImageExtensions(),
            FileExtension::getVideoExtensions()
        );

        $mimes = implode(',', $allowedExtensions);

        return [
            'content' => 'nullable|string|max:360',
            'attachments' => 'nullable|array',
            'attachments.*' => [
                'file',
                'mimes:' . $mimes,
                'max:10240',
            ],
            'is_read' => 'nullable|boolean',
        ];
    }
}
