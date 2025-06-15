<?php

namespace App\Filament\Resources\CommentResource;

use App\Models\Comment;
use Filament\Forms;
use Filament\Forms\Components\Select;
use Filament\Resources\Resource;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;

class CommentResource extends Resource
{
    protected static ?string $model = Comment::class;

    protected static ?string $navigationLabel = 'Коментарі';

    protected static ?string $navigationGroup = 'Соціальна мережа';

    protected static ?string $navigationIcon = 'heroicon-o-chat-bubble-oval-left';

    public static function form(Forms\Form $form): Forms\Form
    {
        return $form
            ->schema([
                Select::make('user_id')
                    ->label('Користувач')
                    ->relationship('user', 'username')
                    ->required(),

                Textarea::make('content')
                    ->label('Контент')
                    ->required()
                    ->rows(4),

                TextInput::make('likes_count')
                    ->label('Кількість лайків')
                    ->required()
                    ->numeric(),

                Select::make('parent_id')
                    ->label('Батьківський коментар')
                    ->relationship('parent', 'content')
                    ->nullable(),
            ]);
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListComments::route('/'),
            'create' => Pages\CreateComment::route('/create'),
            'edit' => Pages\EditComment::route('/{record}/edit')
        ];
    }
}

