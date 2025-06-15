<?php

namespace App\Filament\Resources\PostResource\Pages;

use App\Filament\Resources\PostResource\PostResource;
use App\Models\User;
use Filament\Actions\CreateAction;
use Filament\Forms\Components\DatePicker;
use Filament\Resources\Pages\ListRecords;
use Filament\Tables\Actions\DeleteAction;
use Filament\Tables\Actions\EditAction;
use Filament\Tables\Columns\ImageColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\Filter;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;

class ListPosts extends ListRecords
{
    protected static string $resource = PostResource::class;

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
                TextColumn::make('title')
                    ->label('Назва')
                    ->searchable(),
                TextColumn::make('user.username')
                    ->label('Автор'),
                ImageColumn::make('attachments')
                    ->disk(fn($record) => $record->visibility === 'public' ? 'public' : 'private')
                    ->visibility(fn($record) => $record->visibility === 'public' ? 'public' : 'private')
                    ->label('Вкладення'),
                TextColumn::make('visibility')
                    ->label('Видимість'),
                TextColumn::make('created_at')
                    ->label('Дата створення'),
                TextColumn::make('updated_at')
                    ->label('Дата оновлення'),
            ])
            ->actions([
                EditAction::make(),
                DeleteAction::make(),
            ])
            ->filters($this->getFilters());
    }

    protected function getFilters(): array
    {
        return [
            SelectFilter::make('visibility')
                ->options([
                    'public' => 'Public',
                    'private' => 'Private',
                    'friends' => 'Friends',
                ])
                ->label('Visibility Filter'),

            SelectFilter::make('user_id')
                ->options(function () {
                    return User::pluck('username', 'id')->toArray();
                })
                ->label('Filter by Author'),

            // Унікальні назви для полів
            Filter::make('created_at')
                ->form([
                    DatePicker::make('created_start_date')->label('Created Start Date'),
                    DatePicker::make('created_end_date')->label('Created End Date'),
                ])
                ->query(function ($query, $data) {
                    if (isset($data['created_start_date'])) {
                        $query->where('created_at', '>=', $data['created_start_date']);
                    }
                    if (isset($data['created_end_date'])) {
                        $query->where('created_at', '<=', $data['created_end_date']);
                    }
                })
                ->label('Created Date Range'),

            Filter::make('updated_at')
                ->form([
                    DatePicker::make('updated_start_date')->label('Updated Start Date'),
                    DatePicker::make('updated_end_date')->label('Updated End Date'),
                ])
                ->query(function ($query, $data) {
                    if (isset($data['updated_start_date'])) {
                        $query->where('updated_at', '>=', $data['updated_start_date']);
                    }
                    if (isset($data['updated_end_date'])) {
                        $query->where('updated_at', '<=', $data['updated_end_date']);
                    }
                })
                ->label('Updated Date Range'),
        ];
    }
}
