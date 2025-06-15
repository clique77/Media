<?php

namespace App\Http\Controllers\Social;

use App\Http\Controllers\Controller;
use App\Http\Requests\Social\UserBlockRequests\CreateUserBlockRequest;
use App\Models\UserBlock;
use App\Services\Social\UserBlockService;
use Exception;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserBlockController extends Controller
{
    use AuthorizesRequests;

    public function __construct(protected UserBlockService $userBlockService)
    {
    }

    public function store(CreateUserBlockRequest $request): JsonResponse
    {
        try {
            $userBlock = $this->userBlockService->create($request->validated());

            return response()->json([
                'message' => 'Користувача заблоковано.',
                'data' => $userBlock,
            ], 201);
        } catch (Exception $e) {
            return response()->json([
                'error' => 'Не вдалося заблокувати користувача: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * @throws AuthorizationException
     */
    public function destroy(UserBlock $userBlock): JsonResponse
    {
        $this->authorize('delete', $userBlock);

        try {
            $this->userBlockService->delete($userBlock);

            return response()->json([
                'message' => 'Користувача розблоковано.',
            ]);
        } catch (Exception $e) {
            return response()->json([
                'error' => 'Не вдалося розблокувати користувача: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function index(Request $request): JsonResponse
    {
        try {
            $blocks = $this->userBlockService->getUserBlocks();

            return response()->json($blocks);
        } catch (Exception $e) {
            return response()->json([
                'error' => 'Не вдалося отримати список блокувань: ' . $e->getMessage(),
            ], 500);
        }
    }
}
