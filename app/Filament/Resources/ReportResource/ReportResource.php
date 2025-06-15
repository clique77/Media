<?php

namespace App\Filament\Resources\ReportResource;

use App\Enums\ReportReason;
use App\Models\Post;
use App\Models\Report;
use App\Models\User;
use Filament\Forms;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Resources\Resource;

class ReportResource extends Resource
{
    protected static ?string $model = Report::class;

    protected static ?string $navigationIcon = 'heroicon-o-flag';
    protected static ?string $navigationGroup = 'Соціальна мережа';
    protected static ?string $navigationLabel = 'Скарги';

    public static function form(Forms\Form $form): Forms\Form
    {
        return $form
            ->schema([
                Select::make('user_id')
                    ->label('Користувач')
                    ->options(fn () => User::pluck('username', 'id'))
                    ->searchable()
                    ->required(),

                Select::make('post_id')
                    ->label('Пост')
                    ->options(fn () => Post::pluck('title', 'id'))
                    ->searchable()
                    ->required(),

                Select::make('reason')
                    ->label('Причина')
                    ->options(collect(ReportReason::cases())->mapWithKeys(fn ($case) => [
                        $case->value => self::getLabelForReason($case),
                    ]))
                    ->required(),
            ]);
    }

    protected static function getLabelForReason(ReportReason $reason): string
    {
        return match ($reason) {
            ReportReason::SPAM => 'Спам',
            ReportReason::COPYRIGHT => 'Порушення авторських прав',
            ReportReason::OFFENSIVE_CONTENT => 'Образливий контент',
            ReportReason::MISLEADING => 'Оманлива інформація',
            ReportReason::OTHER => 'Інше',
        };
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListReports::route('/'),
            'create' => Pages\CreateReport::route('/create'),
            'edit' => Pages\EditReport::route('/{record}/edit'),
        ];
    }
}
