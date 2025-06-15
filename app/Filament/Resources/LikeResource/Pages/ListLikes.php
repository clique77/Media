<?php

namespace App\Filament\Resources\LikeResource\Pages;

use App\Filament\Resources\LikeResource\LikeResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;
use Filament\Tables\Table;
use Filament\Tables\Columns\TextColumn;

class ListLikes extends ListRecords
{
    protected static string $resource = LikeResource::class;

    protected function getActions(): array
    {
        return [
            Actions\CreateAction::make(),
        ];
    }

    public function table(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('id')->label('ID')->sortable(),
                TextColumn::make('user.username')->label('Користувач')->sortable()->searchable(),
                TextColumn::make('likeable_type')->label('Лайкнута сутність')->sortable(),
                TextColumn::make('likeable_id')->label('ID лайкнутої сутності')->sortable(),
                TextColumn::make('created_at')->label('Дата створення')->dateTime()->sortable(),
            ])
            ->filters([]);
    }
}

