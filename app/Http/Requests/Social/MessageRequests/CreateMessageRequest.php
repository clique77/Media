<?php

namespace App\Http\Requests\Social\MessageRequests;

use App\Enums\FileExtension;
use Illuminate\Foundation\Http\FormRequest;

class CreateMessageRequest extends FormRequest
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
            'chat_id' => 'required|string|exists:chats,id',
            'content' => 'nullable|string|max:360|required_without:attachments',
            'attachments' => 'nullable|array|required_without:content',
            'attachments.*' => [
                'file',
                'mimes:' . $mimes,
                'max:10240',
            ],
        ];
    }
}
