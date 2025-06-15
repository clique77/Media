<?php

namespace App\Actions\Social\UserBlockActions;

use App\Enums\BlockReason;
use App\Models\UserBlock;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Exception;

class CreateUserBlockAction
{
    /**
     * Блокує іншого користувача з певною причиною.
     *
     * @param array $data Дані блокування, що включають blocked_id і reason
     * @return UserBlock Створений запис блокування
     * @throws Exception Викидається, якщо сталася помилка під час блокування
     */
    public function __invoke(array $data): UserBlock
    {
        DB::beginTransaction();

        try {
            $this->ensureConditionsMet($data);

            $userBlock = $this->createUserBlock($data);

            DB::commit();

            return $userBlock;
        } catch (Exception $e) {
            DB::rollBack();
            throw new Exception('Помилка під час блокування користувача: ' . $e->getMessage());
        }
    }

    /**
     * Перевіряє всі необхідні умови перед блокуванням користувача.
     *
     * @param array $data Дані блокування
     * @throws Exception Якщо умови не виконані
     */
    private function ensureConditionsMet(array $data): void
    {
        $this->validateTargetIsDifferentUser($data);
        $this->validateNotAlreadyBlocked($data);
    }

    /**
     * Перевіряє, що користувач не блокує сам себе.
     *
     * @param array $data
     * @throws Exception
     */
    private function validateTargetIsDifferentUser(array $data): void
    {
        if (Auth::id() === $data['blocked_id']) {
            throw new Exception('Неможливо заблокувати самого себе.');
        }
    }

    /**
     * Перевіряє, що користувач ще не заблокував цільового користувача.
     *
     * @param array $data
     * @throws Exception
     */
    private function validateNotAlreadyBlocked(array $data): void
    {
        $exists = UserBlock::where('user_id', Auth::id())
            ->where('blocked_id', $data['blocked_id'])
            ->exists();

        if ($exists) {
            throw new Exception('Цей користувач вже заблокований.');
        }
    }

    /**
     * Створює запис блокування у базі даних.
     *
     * @param array $data Дані блокування
     * @return UserBlock
     */
    private function createUserBlock(array $data): UserBlock
    {
        return UserBlock::create([
            'user_id' => Auth::id(),
            'blocked_id' => $data['blocked_id'],
            'reason' => $data['reason'] ?? BlockReason::OTHER->value,
        ]);
    }
}
