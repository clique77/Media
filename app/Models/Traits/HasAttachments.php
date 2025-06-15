<?php

namespace App\Models\Traits;

use App\Facades\Files\FileFacade;
use Illuminate\Support\Facades\Log;

trait HasAttachments
{
    protected static function booted(): void
    {
        static::deleting(function ($model) {
            if (!empty($model->attachments)) {
                foreach ((array) $model->attachments as $file) {
                    $disk = $model->visibility === 'public' ? 'public' : 'private';
                    FileFacade::deleteFile($file, disk: $disk);
                }
            }
        });

        /*static::updating(function ($model) {
            if ($model->isDirty('visibility')) {
                $oldVisibility = $model->getOriginal('visibility');
                $newVisibility = $model->visibility->value;
                logger($oldVisibility);
                logger($newVisibility);
                if ($oldVisibility !== $newVisibility && !empty($model->attachments)) {
                    foreach ((array) $model->attachments as $file) {
                        $oldDisk = $oldVisibility === 'public' ? 'public' : 'private';
                        $newDisk = $newVisibility === 'public' ? 'public' : 'private';

                        if ($oldDisk !== $newDisk) {
                            FileFacade::moveFile($file, $oldDisk, $newDisk);
                        }
                    }
                }
            }
        });*/
    }
}


