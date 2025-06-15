<?php

namespace App\Filament\Resources\PostResource;

use App\Enums\PostVisibility;
use App\Filament\Resources\PostResource\RelationManagers\CommentsRelationManager;
use App\Filament\Resources\PostResource\RelationManagers\LikesRelationManager;
use App\Filament\Resources\PostResource\RelationManagers\ReportsRelationManager;
use App\Filament\Resources\PostResource\RelationManagers\TagsRelationManager;
use App\Models\Post;
use Filament\Forms;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Resources\Resource;

class PostResource extends Resource
{
    protected static ?string $model = Post::class;

    protected static ?string $navigationIcon = 'heroicon-o-document-text';

    protected static ?string $navigationGroup = 'Соціальна мережа';
    protected static ?string $navigationLabel = 'Пости';
    public static function form(Forms\Form $form): Forms\Form
    {
        return $form
            ->schema([
                TextInput::make('title')
                    ->label('Назва')
                    ->required()
                    ->maxLength(255),
                Textarea::make('content')
                    ->label('Контент')
                    ->required(),
                Select::make('user_id')
                    ->label('Користувач')
                    ->relationship('user', 'username')
                    ->required(),
                FileUpload::make('attachments')
                    ->label('Вкладення')
                    ->multiple()
                    ->acceptedFileTypes(['image/jpeg', 'image/png', 'image/gif', 'video/mp4'])
                    ->maxSize(51200)
                    ->directory('attachments')
                    ->visibility(fn($get) => $get('visibility') === PostVisibility::PUBLIC->value ? 'public' : 'private'
                    )
                    ->disk(fn($get) => $get('visibility') === PostVisibility::PUBLIC->value ? 'public' : 'private')
                    ->columnSpan('full'),
                Toggle::make('comments_enabled')
                    ->label('Коментарі ввімкнено')
                    ->default(true),
                Select::make('visibility')
                    ->label('Видимість')
                    ->options(
                        array_combine(PostVisibility::getValues(), PostVisibility::getValues())
                    )
                    ->default(PostVisibility::PUBLIC->value)
                    ->live()
                    ->reactive(),
            ]);
    }


    public static function getRelations(): array
    {
        return [
            LikesRelationManager::class,
            CommentsRelationManager::class,
            ReportsRelationManager::class,
            TagsRelationManager::class,
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListPosts::route('/'),
            'create' => Pages\CreatePost::route('/create'),
            'edit' => Pages\EditPost::route('/{record}/edit'),
        ];
    }
}
