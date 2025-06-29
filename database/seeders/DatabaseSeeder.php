<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Events\Social\User\UserRegisteredEvent;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

       $user = User::factory()->create([
            'username' => 'NightFury',
            'email' => 'brawltop155@gmail.com',
            'password' => Hash::make('123321123321'),
            'role' => 'admin',
        ]);
        event(new UserRegisteredEvent($user));
    }
}
