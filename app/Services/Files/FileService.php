<?php

namespace App\Services\Files;

use App\Enums\FileExtension;
use Exception;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Intervention\Image\Drivers\Gd\Driver;
use Intervention\Image\ImageManager;

class FileService
{
    /**
     * Зберегти файл на вказаному диску.
     *
     * @param UploadedFile $file
     * @param string $folder
     * @param string $disk
     * @return string
     */
    public function saveFile(UploadedFile $file, string $folder = 'attachments', string $disk = 'public'): string
    {
        /*if (in_array(strtolower($file->getClientOriginalExtension()), FileExtension::getImageExtensions())) {
            $file = $this->convertToWebp($file);
        }*/

        $fileName = Str::uuid() . '.' . $file->getClientOriginalExtension();
        return Storage::disk($disk)->putFileAs($folder, $file, $fileName);
    }

    /**
     * Перемістити файл з одного диска на інший.
     *
     * @param string $filePath
     * @param string $fromDisk
     * @param string $toDisk
     * @return string
     */
    public function moveFile(string $filePath, string $fromDisk, string $toDisk): string
    {
        $newPath = $filePath;

        Storage::disk($toDisk)->put($newPath, Storage::disk($fromDisk)->get($filePath));
        Storage::disk($fromDisk)->delete($filePath);

        return $newPath;
    }

    /**
     * Видалити файл з вказаного диска.
     *
     * @param string $filePath
     * @param string $disk
     * @return void
     */
    public function deleteFile(string $filePath, string $disk = 'public'): void
    {
        Storage::disk($disk)->delete($filePath);
    }

    /**
     * Конвертувати зображення у WebP.
     *
     * @param UploadedFile $file
     * @param int $quality
     * @return UploadedFile
     */
    protected function convertToWebp(UploadedFile $file, int $quality = 90): UploadedFile
    {
        try {
            $manager = new ImageManager(new Driver());
            $image = $manager->read($file->getPathname())->toWebp($quality);
            $tmpPath = tempnam(sys_get_temp_dir(), 'webp_') . '.webp';
            $image->save($tmpPath);
            return new UploadedFile(
                $tmpPath,
                pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME) . '.webp',
                'image/webp',
                null,
                true
            );
        } catch (Exception $e) {
            return $file;
        }
    }
}
