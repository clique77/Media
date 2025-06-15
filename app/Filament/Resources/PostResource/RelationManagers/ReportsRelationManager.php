<?php

namespace App\Filament\Resources\PostResource\RelationManagers;

use Filament\Resources\RelationManagers\RelationManager;
use Filament\Tables;

class ReportsRelationManager extends RelationManager
{
    protected static string $relationship = 'reports';

    public function table(Tables\Table $table): Tables\Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('reason')->label('Reason'),
                Tables\Columns\TextColumn::make('user.username')->label('Reported By'),
                Tables\Columns\TextColumn::make('created_at')->dateTime()->label('Reported At'),
            ]);
    }
}

