<?php

namespace App\Filament\Resources\CommentResource\Pages;

use App\Filament\Resources\CommentResource\CommentResource;
use Filament\Resources\Pages\ListRecords;
use Filament\Actions\CreateAction;
use Filament\Tables\Actions\DeleteAction;
use Filament\Tables\Actions\EditAction;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;

class ListComments extends ListRecords
{
    protected static string $resource = CommentResource::class;

    protected function getActions(): array
    {
        return [
            CreateAction::make(),
        ];
    }

    public function table(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('content')
                    ->label('Контент')
                    ->searchable(),

                TextColumn::make('user.username')
                    ->label('Автор')
                    ->sortable(),

                TextColumn::make('likes_count')
                    ->label('Кількість лайків')
                    ->sortable(),

                TextColumn::make('created_at')
                    ->label('Дата створення')
                    ->sortable()
                    ->dateTime(),

                TextColumn::make('updated_at')
                    ->label('Дата оновлення')
                    ->sortable()
                    ->dateTime(),
            ])
            ->filters([
            ])
            ->actions([
                EditAction::make(),
                DeleteAction::make(),
            ]);
    }
}

