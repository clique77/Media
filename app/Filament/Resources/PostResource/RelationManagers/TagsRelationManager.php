<?php

namespace App\Filament\Resources\PostResource\RelationManagers;

use Filament\Resources\RelationManagers\RelationManager;
use Filament\Tables;

class TagsRelationManager extends RelationManager
{
    protected static string $relationship = 'tags';

    public function table(Tables\Table $table): Tables\Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('name')->label('Tag'),
                Tables\Columns\TextColumn::make('slug')->label('Slug'),
            ]);
    }
}

