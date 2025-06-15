<?php

namespace App\Actions\Social\ReportActions;

use App\Models\Report;
use Illuminate\Support\Facades\DB;
use Exception;

class DeleteReportAction
{
    /**
     * Видаляє репорт.
     *
     * @param Report $report Об'єкт репорту, який потрібно видалити
     * @return void
     * @throws Exception Викидається, якщо сталася помилка під час видалення репорту
     */
    public function __invoke(Report $report): void
    {
        DB::beginTransaction();

        try {
            $report->delete();

            DB::commit();
        } catch (Exception $e) {
            DB::rollBack();
            throw new Exception('Помилка під час видалення репорту: ' . $e->getMessage());
        }
    }
}
