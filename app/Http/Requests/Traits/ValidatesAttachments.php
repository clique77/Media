<?php

namespace App\Http\Requests\Traits;

trait ValidatesAttachments
{
    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            if ($this->has('attachments')) {
                foreach ($this->file('attachments', []) as $file) {
                    $mimeType = $file->getMimeType();
                    $maxSize = $this->getMaxSizeByMimeType($mimeType);

                    if ($maxSize && $file->getSize() > $maxSize) {
                        $validator->errors()->add(
                            'attachments',
                            "Файл {$file->getClientOriginalName()} перевищує максимальний розмір {$maxSize} байт."
                        );
                    }
                }
            }
        });
    }

    private function getMaxSizeByMimeType(string $mimeType): ?int
    {
        $imageTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'];
        $videoTypes = ['video/mp4', 'video/avi'];

        if (in_array($mimeType, $imageTypes, true)) {
            return 5 * 1024 * 1024;
        }

        if (in_array($mimeType, $videoTypes, true)) {
            return 50 * 1024 * 1024;
        }

        return null;
    }
}
