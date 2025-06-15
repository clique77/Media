<?php

namespace App\Filament\Resources\ChatResource\Pages;

use App\Filament\Resources\ChatResource\ChatResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;
use Filament\Tables\Actions\DeleteAction;
use Filament\Tables\Actions\EditAction;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;

class ListChats extends ListRecords
{
    protected static string $resource = ChatResource::class;

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
                TextColumn::make('userOne.username')
                    ->label('Перший користувач')
                    ->sortable(),
                TextColumn::make('userTwo.username')
                    ->label('Другий користувач')
                    ->sortable(),
                TextColumn::make('last_message')
                    ->label('Останнє повідомлення'),
                TextColumn::make('last_message_at')
                    ->label('Дата останнього повідомлення')
                    ->dateTime(),
            ])
            ->actions([
                EditAction::make(),
                DeleteAction::make(),
            ]);
    }
}

