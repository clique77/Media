<?php

namespace App\Actions\Social\ReportActions;

use App\Models\Report;
use App\Enums\ReportReason;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Exception;

class CreateReportAction
{
    /**
     * Створює репорт для поста.
     *
     * @param array $data Дані репорту, що включають пост_id, reason
     * @return Report Створений запис репорту
     * @throws Exception Викидається, якщо сталася помилка під час створення репорту
     */
    public function __invoke(array $data): Report
    {
        DB::beginTransaction();

        try {
            $this->ensureConditionsMet($data);

            $report = $this->createReport($data);

            DB::commit();

            return $report;
        } catch (Exception $e) {
            DB::rollBack();
            throw new Exception('Помилка під час створення репорту: ' . $e->getMessage());
        }
    }

    /**
     * Перевіряє всі необхідні умови перед створенням репорту.
     *
     * @param array $data Дані репорту
     * @throws Exception Якщо умови не виконані
     */
    private function ensureConditionsMet(array $data): void
    {
        $this->validateNotAlreadyReported($data);
    }

    /**
     * Перевіряє, чи користувач вже подав репорт на цей пост.
     *
     * @param array $data
     * @throws Exception
     */
    private function validateNotAlreadyReported(array $data): void
    {
        $exists = Report::where('user_id', Auth::id())
            ->where('post_id', $data['post_id'])
            ->exists();

        if ($exists) {
            throw new Exception('Ви вже подали репорт на цей пост.');
        }
    }

    /**
     * Створює запис репорту у базі даних.
     *
     * @param array $data Дані репорту
     * @return Report
     */
    private function createReport(array $data): Report
    {
        return Report::create([
            'post_id' => $data['post_id'],
            'user_id' => Auth::id(),
            'reason' => $data['reason'] ?? ReportReason::OTHER->value,
        ]);
    }
}
