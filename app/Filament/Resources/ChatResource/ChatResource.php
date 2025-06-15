<?php

namespace App\Filament\Resources\ChatResource;

use App\Models\Chat;
use App\Models\User;
use Filament\Forms;
use Filament\Forms\Components\DateTimePicker;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Resources\Resource;
use Filament\Tables;

class ChatResource extends Resource
{
    protected static ?string $model = Chat::class;

    protected static ?string $navigationIcon = 'heroicon-o-chat-bubble-left-right';

    protected static ?string $navigationGroup = 'Соціальна мережа';

    protected static ?string $navigationLabel = 'Чати';

    public static function form(Forms\Form $form): Forms\Form
    {
        return $form
            ->schema([
                Select::make('user_one_id')
                    ->label('Перший користувач')
                    ->options(function () {
                        return User::all()->pluck('username', 'id');
                    })
                    ->required(),

                Select::make('user_two_id')
                    ->label('Другий користувач')
                    ->options(function () {
                        return User::all()->pluck('username', 'id');
                    })
                    ->required(),

                TextInput::make('last_message')
                    ->label('Останнє повідомлення')
                    ->maxLength(255)
                    ->required(),

                DateTimePicker::make('last_message_at')
                    ->label('Час останнього повідомлення')
                    ->required(),
            ]);
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListChats::route('/'),
            'create' => Pages\CreateChat::route('/create'),
            'edit' => Pages\EditChat::route('/{record}/edit'),
        ];
    }
}
