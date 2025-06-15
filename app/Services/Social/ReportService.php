<?php

namespace App\Services\Social;

use App\Actions\Social\ReportActions\CreateReportAction;
use App\Actions\Social\ReportActions\DeleteReportAction;
use App\Actions\Social\ReportActions\GetReportsAction;
use App\Models\Report;
use Exception;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class ReportService
{
    public function __construct(
        protected CreateReportAction $createReportAction,
        protected DeleteReportAction $deleteReportAction,
        protected GetReportsAction $getReportsAction,
    ) {
    }

    /**
     * Створює скаргу.
     *
     * @throws Exception
     */
    public function create(array $data): Report
    {
        return ($this->createReportAction)($data);
    }

    /**
     * Видаляє скаргу.
     *
     * @throws Exception
     */
    public function delete(Report $report): void
    {
        ($this->deleteReportAction)($report);
    }

    /**
     * Отримує всі скарги поточного користувача.
     *
     * @throws Exception
     */
    public function getReports(int $perPage = 20): LengthAwarePaginator
    {
        return ($this->getReportsAction)($perPage);
    }
}
