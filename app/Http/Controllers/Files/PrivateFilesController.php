<?php

namespace App\Http\Controllers\Files;

use App\Http\Controllers\Controller;
use App\Models\Chat;
use App\Models\Message;
use App\Models\Post;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class PrivateFilesController extends Controller
{
    /**
     * Віддає файл, прикріплений до поста, якщо користувач має доступ.
     *
     * @param string $directory Директорія файлу (наприклад, attachments)
     * @param string $fileName Ім'я файлу (наприклад, something.webp)
     * @return Response|JsonResponse|BinaryFileResponse
     */
    public function servePostFile(string $directory, string $fileName): Response|JsonResponse|BinaryFileResponse
    {
        if ($directory !== 'attachments') {
            return response()->json(['error' => 'Недозволена директорія'], 403);
        }

        if (preg_match('/[\/\\\]/', $fileName)) {
            return response()->json(['error' => 'Недозволене ім\'я файлу'], 403);
        }

        $filePath = "{$directory}/{$fileName}";
        $post = Post::whereJsonContains('attachments', $filePath)->first();

        if (!$post) {
            return response()->json(['error' => 'Пост із таким файлом не знайдено'], 404);
        }

        $user = Auth::user();
        $isAuthor = $post->user_id === $user->id;
        $isAdmin = $user->role === 'admin';
        $isPublic = $post->visibility === 'public';
        $isFriend = false;
        logger('Is public ' . $isPublic);
        if (!$isAuthor && !$isAdmin && !$isPublic) {
            $isFriend = $user->isFriendWith($post->user_id);
        }
        logger('Is friend ' . $isFriend);
        if (!$isAuthor && !$isAdmin && !$isPublic && !$isFriend) {
            return response()->json(['error' => 'Немає доступу до цього файлу'], 403);
        }

        if (!Storage::disk('private')->exists($filePath)) {
            return response()->json(['error' => 'Файл не знайдено'], 404);
        }

        $fullPath = Storage::disk('private')->path($filePath);
        $mimeType = mime_content_type($fullPath);
        logger('Mime type ' . $mimeType);
        logger('Full path ' . $fullPath);
        return response()->file($fullPath, [
            'Content-Type' => $mimeType,
            'Cache-Control' => 'max-age=31536000',
        ]);
    }

    /**
     * Віддає файл, прикріплений до повідомлення в чаті, якщо користувач є учасником чату.
     *
     * @param string $directory Директорія файлу (наприклад, attachments)
     * @param string $fileName Ім'я файлу (наприклад, something.webp)
     * @return Response|JsonResponse|BinaryFileResponse
     */
    public function serveChatFile(string $directory, string $fileName): Response|JsonResponse|BinaryFileResponse
    {
        if ($directory !== 'attachments') {
            return response()->json(['error' => 'Недозволена директорія'], 403);
        }

        if (preg_match('/[\/\\\]/', $fileName)) {
            return response()->json(['error' => 'Недозволене ім\'я файлу'], 403);
        }

        $filePath = "{$directory}/{$fileName}";
        $message = Message::whereJsonContains('attachments', $filePath)->first();

        if (!$message) {
            return response()->json(['error' => 'Повідомлення із таким файлом не знайдено'], 404);
        }

        $chat = Chat::find($message->chat_id);
        if (!$chat) {
            return response()->json(['error' => 'Чат не знайдено'], 404);
        }

        $user = Auth::user();
        if ($chat->user_one_id !== $user->id && $chat->user_two_id !== $user->id) {
            return response()->json(['error' => 'Немає доступу до цього файлу'], 403);
        }

        if ($user->blockedUsers()->whereIn('blocked_id', [$chat->user_one_id, $chat->user_two_id])->exists()) {
            return response()->json(['error' => 'Немає доступу до цього файлу'], 403);
        }

        if (!Storage::disk('private')->exists($filePath)) {
            return response()->json(['error' => 'Файл не знайдено'], 404);
        }

        $fullPath = Storage::disk('private')->path($filePath);
        $mimeType = mime_content_type($fullPath);
        return response()->file($fullPath, [
            'Content-Type' => $mimeType,
            'Cache-Control' => 'max-age=31536000',
        ]);
    }
}
