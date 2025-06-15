<?php

namespace App\Services\Social;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;
use Exception;

class ContentModerationService
{
    protected string $apiUser;
    protected string $apiSecret;

    public function __construct()
    {
        $this->apiUser = config('services.sightengine.user');
        $this->apiSecret = config('services.sightengine.secret');
    }

    /**
     * Перевіряє зображення на заборонений контент (base64).
     *
     * @param UploadedFile $image
     * @return void
     * @throws Exception
     */
    public function moderateImage(UploadedFile $image): void
    {
        $response = Http::attach(
            'media', file_get_contents($image->getRealPath()), $image->getClientOriginalName()
        )->post('https://api.sightengine.com/1.0/check.json', [
            'models' => 'nudity,wad,offensive,gore,text-content',
            'api_user' => $this->apiUser,
            'api_secret' => $this->apiSecret,
        ]);

        if (!$response->successful()) {
            throw new Exception('Не вдалося перевірити зображення: API недоступне.');
        }

        $data = $response->json();

        if (!empty($data['error'])) {
            throw new Exception('Помилка при перевірці зображення: ' . $data['error']['message']);
        }

        if (
            ($data['nudity']['raw'] ?? 0) > 0.6 ||
            ($data['weapon'] ?? 0) > 0.5 ||
            ($data['alcohol'] ?? 0) > 0.5 ||
            ($data['drugs'] ?? 0) > 0.5 ||
            ($data['gore']['prob'] ?? 0) > 0.3 ||
            ($data['offensive']['prob'] ?? 0) > 0.5
        ) {
            throw new Exception('Зображення містить заборонений контент.');
        }
    }

    /**
     * Перевіряє текст на образливий, ненависницький або неприпустимий вміст.
     *
     * @param string $text
     * @return void
     * @throws Exception
     */
    public function moderateText(string $text): void
    {
        if (!$text) return;
        $response = Http::asForm()->post('https://api.sightengine.com/1.0/text/check.json', [
            'text' => $text,
            'lang' => 'en,ru,fr,it,pt,es,tr',
            'mode' => 'standard',
            'api_user' => $this->apiUser,
            'api_secret' => $this->apiSecret,
        ]);

        if (!$response->successful()) {
            throw new Exception('Не вдалося перевірити текст: API недоступне.');
        }

        $data = $response->json();

        if (!empty($data['error'])) {
            throw new Exception('Помилка при перевірці тексту: ' . $data['error']['message']);
        }

        foreach ($data['threat']['matches'] ?? [] as $threat) {
            if (in_array($threat['type'], ['hate', 'self-harm', 'violence'])) {
                throw new Exception('Текст містить заборонені висловлювання: ' . $threat['type']);
            }
        }

        foreach ($data['profanity']['matches'] ?? [] as $badword) {
            if ($badword['intensity'] > 0.5) {
                throw new Exception('Текст містить ненормативну лексику.');
            }
        }
    }
}
