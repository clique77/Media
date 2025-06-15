<?php

namespace App\Filament\Resources\UserBlockResource;

use App\Enums\BlockReason;
use App\Models\User;
use App\Models\UserBlock;
use Filament\Forms;
use Filament\Forms\Components\Select;
use Filament\Resources\Resource;

class UserBlockResource extends Resource
{
    protected static ?string $model = UserBlock::class;

    protected static ?string $navigationIcon = 'heroicon-o-user-minus';
    protected static ?string $navigationGroup = 'Соціальна мережа';
    protected static ?string $navigationLabel = 'Блокування користувачів';

    public static function form(Forms\Form $form): Forms\Form
    {
        return $form
            ->schema([
                Select::make('user_id')
                    ->label('Хто блокує')
                    ->options(fn () => User::pluck('username', 'id'))
                    ->searchable()
                    ->required(),

                Select::make('blocked_id')
                    ->label('Заблокований')
                    ->options(fn () => User::pluck('username', 'id'))
                    ->searchable()
                    ->required(),

                Select::make('reason')
                    ->label('Причина')
                    ->options(array_combine(BlockReason::getValues(), BlockReason::getValues()))
                    ->required(),
            ]);
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListUserBlocks::route('/'),
            'create' => Pages\CreateUserBlock::route('/create'),
            'edit' => Pages\EditUserBlock::route('/{record}/edit'),
        ];
    }
}
