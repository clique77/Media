<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Mail\Mailable;

class WelcomeMail extends Mailable
{
    public function __construct(public User $user, public string $profileUrl)
    {
    }

    public function build(): WelcomeMail
    {
        return $this->view('emails.welcome')
        ->with([
            'user' => $this->user,
            'dashboardUrl' => $this->profileUrl,
        ]);
    }
}

