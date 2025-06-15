<?php

namespace App\Console\Commands;

use App\Models\Actor;
use App\Models\Director;
use App\Models\Genre;
use App\Models\Movie;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;

class FetchMoviesCommand extends Command
{
    /**
     * Назва та підпис команди для виконання через командний рядок.
     *
     * Це визначає, як користувач викликає команду через Artisan.
     *
     * @var string
     */
    protected $signature = 'movies:fetch';

    /**
     * Опис команди для виконання через командний рядок.
     *
     * Опис пояснює, що робить ця команда.
     *
     * @var string
     */
    protected $description = 'Fetch new movies from TMDb API and save to database';

    /**
     * URL для звернення до TMDb API.
     *
     * @var string
     */
    private string $apiUrl;

    /**
     * Ключ API для доступу до TMDb.
     *
     * @var string
     */
    private string $apiKey;

    /**
     * Асоціативний масив жанрів фільмів з їхнім ID на назву.
     *
     * Використовується для перетворення ID жанрів на їхні відповідні назви.
     *
     * @var array
     */
    private array $genresMap = [];

    /**
     * Загальна кількість сторінок фільмів для отримання.
     *
     * Це обмеження кількості сторінок, які будуть запитуватись з API.
     *
     * @var int
     */
    private int $totalPages = 5;

    /**
     * Виконання основної логіки команди: отримання фільмів та їх збереження у базі даних.
     *
     * Процес включає отримання жанрів, фільмів, акторів і режисерів із TMDb API,
     * обробку та збереження їх у відповідні таблиці бази даних.
     *
     * @return void
     */
    public function handle(): void
    {
        $this->apiUrl = config('services.tmdb.api_url');
        $this->apiKey = config('services.tmdb.api_key');

        $this->info('Fetching new movies from TMDb API...');

        $this->fetchGenres();

        for ($page = 1; $page <= $this->totalPages; $page++) {
            $this->info("Fetching page {$page} of new movies...");

            $response = Http::get("{$this->apiUrl}/movie/now_playing", [
                'api_key' => $this->apiKey,
                'language' => 'en-US',
                'page' => $page
            ]);

            if ($response->failed()) {
                $this->error("Failed to fetch page {$page} of new movies.");
                continue;
            }

            $movies = $response->json()['results'] ?? [];

            foreach ($movies as $movieData) {
                $this->processMovie($movieData);
            }
        }

        $this->info('New movies successfully fetched and stored.');
    }

    /**
     * Отримує жанри фільмів з TMDb API та зберігає їх у мапу.
     *
     * Цей метод запитує API для отримання списку жанрів фільмів та зберігає їх у масив
     * для подальшого використання при прив'язці жанрів до фільмів.
     *
     * @return void
     */
    private function fetchGenres(): void
    {
        $response = Http::get("{$this->apiUrl}/genre/movie/list", [
            'api_key' => $this->apiKey,
            'language' => 'en-US'
        ]);

        if ($response->successful()) {
            $this->genresMap = collect($response->json()['genres'] ?? [])
                ->pluck('name', 'id')
                ->toArray();
        }
    }

    /**
     * Обробляє отримані дані про фільм, створює або оновлює записи в базі даних.
     *
     * Використовує API для отримання додаткових деталей про фільм, акторів і режисерів.
     * Після цього додає фільм, акторів, режисерів та жанри в базу даних.
     *
     * @param array $movieData
     * @return void
     */
    private function processMovie(array $movieData): void
    {
        $directorData = $this->fetchDirector($movieData['id']);
        $director = Director::firstOrCreate(
            ['name' => $directorData['name']],
            ['birth_date' => $directorData['birth_date'], 'profile_path' => $directorData['profile_path']]
        );

        $movieDetails = $this->fetchMovieDetails($movieData['id']);

        $movie = Movie::firstOrCreate(
            ['title' => $movieData['title']],
            [
                'description' => $movieData['overview'] ?? null,
                'release_date' => $movieData['release_date'] ?? null,
                'runtime' => $movieDetails['runtime'] ?? null,
                'poster_path' => $movieData['poster_path'] ?? null,
                'backdrop_path' => $movieData['backdrop_path'] ?? null,
                'api_rating' => $movieData['vote_average'] ?? 0,
                'director_id' => $director->id,
            ]
        );

        $this->attachActors($movie, $movieData['id']);
        $this->attachGenres($movie, $movieData['genre_ids'] ?? []);
    }

    /**
     * Отримує деталі фільму за його ID.
     *
     * Запитує API для отримання додаткової інформації про фільм (наприклад, тривалість).
     *
     * @param int $movieId
     * @return array
     */
    private function fetchMovieDetails(int $movieId): array
    {
        $response = Http::get("{$this->apiUrl}/movie/{$movieId}", [
            'api_key' => $this->apiKey,
            'language' => 'en-US'
        ]);

        if ($response->failed()) {
            return ['runtime' => null];
        }

        $movieDetails = $response->json();
        return [
            'runtime' => $movieDetails['runtime'] ?? null, // Отримуємо runtime
        ];
    }

    /**
     * Отримує інформацію про режисера фільму за його ID.
     *
     * Запитує API для отримання даних про режисера фільму.
     *
     * @param int $movieId
     * @return array
     */
    private function fetchDirector(int $movieId): array
    {
        $response = Http::get("{$this->apiUrl}/movie/{$movieId}/credits", [
            'api_key' => $this->apiKey,
            'language' => 'en-US'
        ]);

        if ($response->failed()) {
            return ['name' => 'Unknown Director', 'birth_date' => null, 'profile_path' => null];
        }

        $crew = collect($response->json()['crew'] ?? []);
        $director = $crew->firstWhere('job', 'Director');

        if ($director && isset($director['id'])) {
            $directorDetails = $this->fetchPersonDetails($director['id']);
            return [
                'name' => $director['name'] ?? 'Unknown Director',
                'birth_date' => $directorDetails['birth_date'] ?? null,
                'profile_path' => $directorDetails['profile_path'] ?? null
            ];
        }

        return [
            'name' => 'Unknown Director',
            'birth_date' => null,
            'profile_path' => null
        ];
    }

    /**
     * Отримує деталі актора за його ID.
     *
     * Запитує API для отримання додаткової інформації про актора.
     *
     * @param int $actorId
     * @return array
     */
    private function fetchActorDetails(int $actorId): array
    {
        $response = Http::get("{$this->apiUrl}/person/{$actorId}", [
            'api_key' => $this->apiKey,
            'language' => 'en-US'
        ]);

        if ($response->failed()) {
            return ['birth_date' => null, 'profile_path' => null];
        }

        $actorDetails = $response->json();
        return [
            'birth_date' => $actorDetails['birthday'] ?? null,
            'profile_path' => $actorDetails['profile_path'] ?? null
        ];
    }

    /**
     * Додає акторів до фільму за їх ID.
     *
     * Зберігає акторів у таблиці `actors` та встановлює зв'язок з фільмом.
     *
     * @param Movie $movie
     * @param int $movieId
     * @return void
     */
    private function attachActors(Movie $movie, int $movieId): void
    {
        $response = Http::get("{$this->apiUrl}/movie/{$movieId}/credits", [
            'api_key' => $this->apiKey,
            'language' => 'en-US'
        ]);

        if ($response->failed()) {
            return;
        }

        $actors = collect($response->json()['cast'] ?? [])
            ->take(10)
            ->map(function ($actor) {
                $actorDetails = $this->fetchActorDetails($actor['id']);
                return Actor::firstOrCreate(
                    [
                        'name' => $actor['name'],
                        'birth_date' => $actorDetails['birth_date'],
                        'profile_path' => $actorDetails['profile_path']
                    ]
                );
            });

        $movie->actors()->sync($actors->pluck('id'));
    }

    /**
     * Додає жанри до фільму за їх ID.
     *
     * Зберігає жанри у таблиці `genres` та встановлює зв'язок з фільмом.
     *
     * @param Movie $movie
     * @param array $genreIds
     * @return void
     */
    private function attachGenres(Movie $movie, array $genreIds): void
    {
        $genres = collect($genreIds)
            ->map(fn($id) => Genre::firstOrCreate(['name' => $this->genresMap[$id] ?? 'Unknown']));

        $movie->genres()->sync($genres->pluck('id'));
    }

    /**
     * Отримує деталі особи (актора чи режисера) за його ID.
     *
     * Запитує API для отримання додаткової інформації про особу.
     *
     * @param int $personId
     * @return array
     */
    private function fetchPersonDetails(int $personId): array
    {
        $response = Http::get("{$this->apiUrl}/person/{$personId}", [
            'api_key' => $this->apiKey,
            'language' => 'en-US'
        ]);

        if ($response->failed()) {
            return ['birth_date' => null, 'profile_path' => null];
        }

        $personDetails = $response->json();
        return [
            'birth_date' => $personDetails['birthday'] ?? null,
            'profile_path' => $personDetails['profile_path'] ?? null
        ];
    }
}
