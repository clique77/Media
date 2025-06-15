<?php

namespace App\Filament\Resources\UserResource;

use App\Enums\Gender;
use App\Enums\Role;
use App\Models\User;
use Filament\Forms;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Resources\Resource;
use Illuminate\Support\Facades\Hash;

class UserResource extends Resource
{
    protected static ?string $model = User::class;

    protected static ?string $navigationIcon = 'heroicon-o-users';

    protected static ?string $navigationGroup = 'Соціальна мережа';
    protected static ?string $navigationLabel = 'Користувачі';

    public static function form(Forms\Form $form): Forms\Form
    {
        return $form
            ->schema([
                TextInput::make('username')
                    ->required()
                    ->label('Нікнейм')
                    ->maxLength(255),

                TextInput::make('first_name')
                    ->label('Ім\'я')
                    ->maxLength(255),

                TextInput::make('last_name')
                    ->label('Прізвище')
                    ->maxLength(255),

                TextInput::make('email')
                    ->email()
                    ->label('Електронна адреса')
                    ->unique(ignoreRecord: true)
                    ->required(),

                TextInput::make('password')
                    ->password()
                    ->label('Пароль')
                    ->required(fn($context) => $context === 'create')
                    ->dehydrateStateUsing(fn($state) => Hash::make($state)),

                Select::make('role')
                    ->label('Роль')
                    ->options(
                        array_combine(Role::getValues(), Role::getValues())
                    )
                    ->required()
                    ->default(Role::USER->value),

                FileUpload::make('avatar')
                    ->label('Аватар')
                    ->image()
                    ->disk('public')
                    ->directory('avatars')
                    ->visibility('public'),

                Select::make('gender')
                    ->label('Стать')
                    ->options(
                        array_combine(Gender::getValues(), Gender::getValues())
                    )
                    ->required()
                    ->default(Gender::MALE->value),

                TextInput::make('country')
                    ->label('Країна')
                    ->maxLength(255),

                TextInput::make('biography')
                    ->label('Біографія')
                    ->maxLength(500)
                    ->columnSpanFull(),

                TextInput::make('birthday')
                    ->label('День народження')
                    ->type('date'),
            ]);
    }

    public static function getRelations(): array
    {
        return [];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListUsers::route('/'),
            'create' => Pages\CreateUser::route('/create'),
            'edit' => Pages\EditUser::route('/{record}/edit'),
        ];
    }
}
