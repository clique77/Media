<?php

namespace App\Events\Social\User;

use App\Models\User;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
class UserRegisteredEvent
{
    use Dispatchable, SerializesModels;

    public function __construct(public User $user)
    {
    }
}
