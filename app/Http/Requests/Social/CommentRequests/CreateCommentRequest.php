<?php

namespace App\Http\Requests\Social\CommentRequests;

use Illuminate\Foundation\Http\FormRequest;

class CreateCommentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'parent_id' => 'nullable|exists:comments,id',
            'content' => 'required|string|max:256',
        ];
    }
}
