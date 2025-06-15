<?php

namespace App\Enums;

enum FileExtension: string
{
    // Зображення
    case JPG = 'jpg';
    case JPEG = 'jpeg';
    case PNG = 'png';
    case GIF = 'gif';
    case WEBP = 'webp';

    // Відео
    case MP4 = 'mp4';
    case AVI = 'avi';

    // Документи
    case TXT = 'txt';
    case PDF = 'pdf';
    case DOC = 'doc';
    case DOCX = 'docx';

    public static function getImageExtensions(): array
    {
        return [self::JPG->value, self::JPEG->value, self::PNG->value, self::GIF->value, self::WEBP->value];
    }

    public static function getVideoExtensions(): array
    {
        return [self::MP4->value, self::AVI->value];
    }

    public static function getDocumentExtensions(): array
    {
        return [self::TXT->value, self::PDF->value, self::DOC->value, self::DOCX->value];
    }

    public static function getAllExtensions(): array
    {
        return array_merge(
            self::getImageExtensions(),
            self::getVideoExtensions(),
            self::getDocumentExtensions()
        );
    }
}
