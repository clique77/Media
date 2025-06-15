<?php

namespace App\Filament\Resources\RefreshTokenResource\Pages;

use App\Filament\Resources\RefreshTokenResource\RefreshTokenResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;
use Filament\Tables;
use Filament\Tables\Table;
use Filament\Tables\Columns\TextColumn;

class ListRefreshTokens extends ListRecords
{
    protected static string $resource = RefreshTokenResource::class;

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
                TextColumn::make('user.username')
                    ->label('Користувач')
                    ->sortable()
                    ->searchable(),

                TextColumn::make('token')
                    ->label('Токен')
                    ->limit(20)
                    ->copyable()
                    ->sortable()
                    ->searchable(),

                TextColumn::make('expires_at')
                    ->label('Термін придатності')
                    ->dateTime()
                    ->sortable(),
            ])
            ->filters([

            ])
            ->actions([
                Tables\Actions\EditAction::make(),
                Tables\Actions\DeleteAction::make(),
            ]);
    }
}

