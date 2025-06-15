<?php

namespace App\Filament\Resources\UserBlockResource\Pages;

use App\Filament\Resources\UserBlockResource\UserBlockResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;
use Filament\Tables;
use Filament\Tables\Table;
use Filament\Tables\Columns\TextColumn;

class ListUserBlocks extends ListRecords
{
    protected static string $resource = UserBlockResource::class;

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
                TextColumn::make('blocker.username')
                    ->label('Хто блокує')
                    ->searchable()
                    ->sortable(),

                TextColumn::make('blocked.username')
                    ->label('Заблокований')
                    ->searchable()
                    ->sortable(),

                TextColumn::make('reason')
                    ->label('Причина')
                    ->sortable()
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'Spam' => 'warning',
                        'Harassment' => 'danger',
                        'Offensive Content' => 'rose',
                        'Other' => 'gray',
                        default => 'gray',
                    }),
            ])
            ->filters([])
            ->actions([
                Tables\Actions\EditAction::make(),
                Tables\Actions\DeleteAction::make(),
            ]);
    }
}
