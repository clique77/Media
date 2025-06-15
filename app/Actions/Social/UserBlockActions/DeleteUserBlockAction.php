<?php

namespace App\Actions\Social\UserBlockActions;

use App\Models\UserBlock;
use Illuminate\Support\Facades\DB;
use Exception;

class DeleteUserBlockAction
{
    /**
     * Видаляє запис про блокування користувача.
     *
     * @param UserBlock $userBlock Модель блокування, яку потрібно видалити
     * @return void
     * @throws Exception Якщо сталася помилка під час видалення
     */
    public function __invoke(UserBlock $userBlock): void
    {
        DB::beginTransaction();

        try {
            $userBlock->delete();

            DB::commit();
        } catch (Exception $e) {
            DB::rollBack();
            throw new Exception('Помилка під час розблокування користувача.');
        }
    }
}
