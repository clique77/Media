<?php

namespace App\Http\Controllers\Social;

use App\Http\Controllers\Controller;
use App\Services\Social\TagService;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TagController extends Controller
{
    public function __construct(protected TagService $tagService)
    {
    }

    public function index(Request $request): JsonResponse
    {
        try {
            $perPage = $request->get('perPage', 20);
            $tags = $this->tagService->getTags($perPage);

            return response()->json($tags);
        } catch (Exception $e) {
            return response()->json([
                'error' => 'Не вдалося отримати теги: ' . $e->getMessage(),
            ], 500);
        }
    }
}
