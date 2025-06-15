<?php

namespace App\Http\Controllers\Social;

use App\Http\Controllers\Controller;
use App\Services\Social\PostViewService;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PostViewController extends Controller
{
    /**
     * Constructor для ініціалізації PostViewService.
     *
     * @param PostViewService $postViewService
     */
    public function __construct(protected PostViewService $postViewService)
    {
    }

    /**
     * Отримати список переглядів постів користувача.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $perPage = $request->get('perPage', 20);

            $views = $this->postViewService->getPostViews($perPage);

            return response()->json($views);
        } catch (Exception $e) {
            return response()->json([
                'error' => 'Не вдалося отримати перегляди постів: ' . $e->getMessage(),
            ], 500);
        }
    }
}
