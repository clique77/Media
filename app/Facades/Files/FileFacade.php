<?php
namespace App\Facades\Files;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Facade;

/**
 * @method static string saveFile(UploadedFile $file, string $folder = 'attachments', string $disk = 'public')
 * @method static string moveFile(string $filePath, string $fromDisk, string $toDisk)
 * @method static void deleteFile(string $filePath, string $disk = 'public')
 */
class FileFacade extends Facade
{
    /**
     * Отримує назву сервісу в контейнері, з яким буде працювати фасад.
     *
     * @return string
     */
    protected static function getFacadeAccessor(): string
    {
        return 'fileService';
    }
}

