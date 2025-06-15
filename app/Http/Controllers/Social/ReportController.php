<?php

namespace App\Http\Controllers\Social;

use App\Http\Controllers\Controller;
use App\Http\Requests\Social\ReportRequests\CreateReportRequest;
use App\Models\Report;
use App\Services\Social\ReportService;
use Exception;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    use AuthorizesRequests;

    public function __construct(protected ReportService $reportService)
    {
    }

    public function store(CreateReportRequest $request): JsonResponse
    {
        try {
            $report = $this->reportService->create($request->validated());

            return response()->json([
                'message' => 'Скаргу створено.',
                'data' => $report,
            ], 201);
        } catch (Exception $e) {
            return response()->json([
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * @throws AuthorizationException
     */
    public function destroy(Report $report): JsonResponse
    {
        $this->authorize('delete', $report);

        try {
            $this->reportService->delete($report);

            return response()->json([
                'message' => 'Скаргу видалено.',
            ]);
        } catch (Exception $e) {
            return response()->json([
                'error' => 'Не вдалося видалити скаргу: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function index(Request $request): JsonResponse
    {
        try {
            $perPage = $request->get('perPage', 20);
            $reports = $this->reportService->getReports($perPage);

            return response()->json($reports);
        } catch (Exception $e) {
            return response()->json([
                'error' => 'Не вдалося отримати список скарг: ' . $e->getMessage(),
            ], 500);
        }
    }
}
