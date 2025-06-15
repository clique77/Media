<?php

namespace App\Filament\Resources\MessageResource;

use App\Models\Chat;
use App\Models\Message;
use App\Models\User;
use Filament\Forms;
use Filament\Resources\Resource;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\Checkbox;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Select;

class MessageResource extends Resource
{
    protected static ?string $model = Message::class;

    protected static ?string $navigationIcon = 'heroicon-o-envelope';

    protected static ?string $navigationGroup = 'Соціальна мережа';
    protected static ?string $navigationLabel = 'Повідомлення';

    public static function form(Forms\Form $form): Forms\Form
    {
        return $form
            ->schema([
                Select::make('chat_id')
                    ->label('Чат')
                    ->options(function () {
                        return Chat::all()->pluck('id', 'id');
                    })
                    ->required(),

                Select::make('user_id')
                    ->label('Користувач')
                    ->options(function () {
                        return User::all()->pluck('username', 'id');
                    })
                    ->required(),

                Textarea::make('content')
                    ->label('Повідомлення')
                    ->required(),

                FileUpload::make('attachments')
                    ->label('Вкладення')
                    ->multiple()
                    ->disk('private')
                    ->directory('attachments'),

                Checkbox::make('is_read')
                    ->label('Чи прочитано')
                    ->default(false),
            ]);
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListMessages::route('/'),
            'create' => Pages\CreateMessage::route('/create'),
            'edit' => Pages\EditMessage::route('/{record}/edit'),
        ];
    }
}

