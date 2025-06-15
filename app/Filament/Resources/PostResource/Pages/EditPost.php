<?php

namespace App\Filament\Resources\PostResource\Pages;

use App\Filament\Resources\PostResource\PostResource;
use Filament\Resources\Pages\EditRecord;

class EditPost extends EditRecord
{
    protected static string $resource = PostResource::class;
}

