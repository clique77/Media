<?php

use App\Enums\PostVisibility;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('posts', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('title');
            $table->text('content');
            $table->foreignUuid('user_id')->constrained()->onDelete('cascade');
            $table->json('attachments')->nullable();
            $table->string('slug')->unique();
            $table->unsignedInteger('likes_count')->default(0);
            $table->unsignedInteger('comments_count')->default(0);
            $table->unsignedInteger('reports_count')->default(0);
            $table->unsignedInteger('views_count')->default(0);
            $table->boolean('comments_enabled')->default(true);
            $table->enum('visibility', PostVisibility::getValues())->default(PostVisibility::PUBLIC->value);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('posts');
    }
};
