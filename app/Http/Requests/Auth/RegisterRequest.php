<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

class RegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'username' => 'required|string|min:4|max:16|unique:users,username',
            'email' => 'required|string|email|max:128|unique:users,email',
            'password' => 'required|string|min:8|max:24',
        ];
    }
}
