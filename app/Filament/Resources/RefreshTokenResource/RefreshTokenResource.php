<?php

namespace App\Filament\Resources\RefreshTokenResource;

use App\Models\RefreshToken;
use App\Models\User;
use Filament\Forms;
use Filament\Resources\Resource;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\DateTimePicker;
use Filament\Forms\Components\Select;

class RefreshTokenResource extends Resource
{
    protected static ?string $model = RefreshToken::class;

    protected static ?string $navigationIcon = 'heroicon-o-key';
    protected static ?string $navigationGroup = 'Безпека';
    protected static ?string $navigationLabel = 'Рефреш токени';

    public static function form(Forms\Form $form): Forms\Form
    {
        return $form
            ->schema([
                Select::make('user_id')
                    ->label('Користувач')
                    ->options(fn () => User::pluck('username', 'id'))
                    ->searchable()
                    ->required(),

                TextInput::make('token')
                    ->label('Токен')
                    ->required()
                    ->maxLength(255),

                DateTimePicker::make('expires_at')
                    ->label('Термін придатності')
                    ->required(),
            ]);
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListRefreshTokens::route('/'),
            'create' => Pages\CreateRefreshToken::route('/create'),
            'edit' => Pages\EditRefreshToken::route('/{record}/edit'),
        ];
    }
}

