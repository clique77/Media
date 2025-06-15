<?php

namespace App\Exceptions\Handlers;

use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Illuminate\Http\JsonResponse;

class AccessDeniedHttpExceptionHandler
{
    public static function handle(AccessDeniedHttpException $exception): JsonResponse
    {
        return response()->json(['message' => 'This action is not allowed.'], 403);
    }
}
