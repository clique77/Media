<?php

use App\Enums\FriendRequestPrivacy;
use App\Enums\MessagePrivacy;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('settings', function (Blueprint $table) {
            $table->id();
            $table->foreignUuid('user_id')->unique()->constrained()->onDelete('cascade');
            $table->json('notifications_enabled');
            $table->enum('message_privacy', MessagePrivacy::getValues())
                ->default(MessagePrivacy::EVERYONE);
            $table->enum('friend_request_privacy', FriendRequestPrivacy::getValues())
                ->default(FriendRequestPrivacy::EVERYONE);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('settings');
    }
};
