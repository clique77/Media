<?php

namespace App\Listeners\Social\User;

use App\Events\Social\User\UserRegisteredEvent;
use App\Mail\WelcomeMail;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Support\Facades\Mail;

class SendWelcomeEmail implements ShouldQueue
{
    public function handle(UserRegisteredEvent $event): void
    {
        $profileUrl = url('/profile');
        Mail::to($event->user->email)->send(new WelcomeMail($event->user, $profileUrl));
    }
}
