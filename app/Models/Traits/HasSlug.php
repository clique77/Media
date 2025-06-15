<?php

namespace App\Models\Traits;

use App\Models\Post;
use Exception;
use Illuminate\Support\Str;

trait HasSlug
{
    /**
     * Boot the HasSlug trait for a model.
     * Automatically generates a slug when creating or updating a model.
     */
    protected static function bootHasSlug(): void
    {
        static::creating(function ($model) {
            if (!$model->slug) {
                $slugSource = $model->getSlugSource();
                $name = $model->getSlugName();
                $model->slug = $model->generateSlug($slugSource, $name);
            }
        });

        static::updating(function ($model) {
            if ($model->isDirty('title') || $model->isDirty('name')) {
                $slugSource = $model->getSlugSource();
                $name = $model->getSlugName();
                $model->slug = $model->generateSlug($slugSource, $name);
            }
        });
    }

    /**
     * Retrieve the primary source field (title or name) for slug generation.
     *
     * @return string The title or name to use for the slug
     * @throws Exception If neither title nor name is available
     */
    private function getSlugSource(): string
    {
        if (!empty($this->title)) {
            return $this->title;
        }

        if (!empty($this->name)) {
            return $this->name;
        }

        throw new Exception('Не вдалося згенерувати слаг: відсутні атрибути title або name.');
    }

    /**
     * Retrieve the name field for slug generation, typically from the user relationship.
     *
     * @return string|null The name to use in the slug, or null if not available
     */
    private function getSlugName(): ?string
    {
        if (isset($this->user) && !empty($this->user->name)) {
            return $this->user->name;
        }

        if (!empty($this->name)) {
            return $this->name;
        }

        return null;
    }

    /**
     * Generate a unique slug based on the primary source (title or name) and optional name.
     *
     * @param string $source The primary source (title or name) for the slug
     * @param string|null $name The name to include in the slug, if available
     * @return string The generated unique slug
     * @throws Exception If there is an error querying the database
     */
    private function generateSlug(string $source, ?string $name = null): string
    {
        try {
            $sourceSlug = Str::slug($source);

            $baseSlug = $name ? Str::slug($name) . '-' . $sourceSlug : $sourceSlug;

            $existingSlugs = Post::where('slug', 'like', "$baseSlug%")
                ->pluck('slug')
                ->toArray();

            if (!in_array($baseSlug, $existingSlugs)) {
                return $baseSlug;
            }

            $counter = 1;
            $newSlug = "$baseSlug-$counter";
            while (in_array($newSlug, $existingSlugs)) {
                $counter++;
                $newSlug = "$baseSlug-$counter";
            }

            return $newSlug;
        } catch (Exception $e) {
            throw new Exception('Помилка при генерації слагу: ' . $e->getMessage());
        }
    }
}
