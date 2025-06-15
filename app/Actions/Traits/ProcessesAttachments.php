<?php

namespace App\Actions\Traits;

use App\Facades\Files\FileFacade;
use Exception;

trait ProcessesAttachments
{
    /**
     * Обробляє вкладення для різних типів контенту (пости, повідомлення тощо).
     *
     * @param array $attachments Масив файлів для обробки.
     * @param string $visibility Видимість файлу (public, private, friends, тощо).
     * @return array|null JSON-рядок із збереженими файлами або null, якщо вкладень немає.
     * @throws Exception
     */
    private function processAttachments(array $attachments, string $visibility): ?array
    {
        try {
            if (empty($attachments)) {
                return null;
            }

            $storageDisk = in_array($visibility, ['private', 'friends'], true) ? 'private' : 'public';

            $processedFiles = [];
            foreach ($attachments as $file) {
                $processedFiles[] = FileFacade::saveFile($file, disk: $storageDisk);
            }

            return $processedFiles;
        } catch (Exception $e) {
            throw new Exception('Помилка під час обробки файлів. Можлива проблема з збереженням файлів.');
        }
    }
}
