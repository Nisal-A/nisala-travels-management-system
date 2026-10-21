<?php

namespace App\Services;

use App\Models\MemoryMedia;
use App\Models\MemoryYear;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class MemoryPublishingService
{
    public const MAX_IMAGES_PER_YEAR = 10;
    public const MAX_VIDEOS_PER_YEAR = 2;
    public const MAX_IMAGE_SIZE_BYTES = 5242880; // 5 MB
    public const MAX_IMAGE_DIMENSION = 2000;

    /**
     * Check if a memory year meets all publishing requirements.
     */
    public function canPublish(MemoryYear $memoryYear): bool
    {
        return !empty($memoryYear->consent_confirmed_at) && $memoryYear->media()->count() > 0;
    }

    /**
     * Publish a memory year, verifying consent and at least one media item.
     */
    public function publish(MemoryYear $memoryYear): MemoryYear
    {
        if (empty($memoryYear->consent_confirmed_at)) {
            throw ValidationException::withMessages([
                'consent_confirmed_at' => ['Publishing requires verified consent confirmation.'],
            ]);
        }

        if ($memoryYear->media()->count() === 0) {
            throw ValidationException::withMessages([
                'media' => ['Publishing requires at least one media item.'],
            ]);
        }

        $memoryYear->update(['is_published' => true]);

        return $memoryYear->fresh(['media', 'destination']);
    }

    /**
     * Unpublish a memory year.
     */
    public function unpublish(MemoryYear $memoryYear): MemoryYear
    {
        $memoryYear->update(['is_published' => false]);

        return $memoryYear->fresh(['media', 'destination']);
    }

    /**
     * Toggle the published status of a memory year.
     */
    public function togglePublish(MemoryYear $memoryYear): MemoryYear
    {
        if ($memoryYear->is_published) {
            return $this->unpublish($memoryYear);
        }

        return $this->publish($memoryYear);
    }

    /**
     * Create a new memory year.
     */
    public function createYear(array $data): MemoryYear
    {
        $isPublished = (bool) ($data['is_published'] ?? false);

        if ($isPublished) {
            if (empty($data['consent_confirmed_at'])) {
                throw ValidationException::withMessages([
                    'consent_confirmed_at' => ['Publishing requires verified consent confirmation.'],
                ]);
            }
            // Cannot publish with zero media items
            throw ValidationException::withMessages([
                'media' => ['Publishing requires at least one media item.'],
            ]);
        }

        return MemoryYear::create($data);
    }

    /**
     * Update an existing memory year.
     */
    public function updateYear(MemoryYear $memoryYear, array $data): MemoryYear
    {
        $isPublished = isset($data['is_published']) ? (bool) $data['is_published'] : $memoryYear->is_published;

        if ($isPublished) {
            $consent = $data['consent_confirmed_at'] ?? $memoryYear->consent_confirmed_at;
            if (empty($consent)) {
                throw ValidationException::withMessages([
                    'consent_confirmed_at' => ['Publishing requires verified consent confirmation.'],
                ]);
            }
            if ($memoryYear->media()->count() === 0) {
                throw ValidationException::withMessages([
                    'media' => ['Publishing requires at least one media item.'],
                ]);
            }
        }

        $memoryYear->update($data);

        return $memoryYear->fresh(['media', 'destination']);
    }

    /**
     * Delete a memory year and associated media files.
     */
    public function deleteYear(MemoryYear $memoryYear): void
    {
        foreach ($memoryYear->media as $media) {
            $media->delete();
        }

        $memoryYear->delete();
    }

    /**
     * Add an image to a memory year.
     */
    public function addImage(
        MemoryYear $memoryYear,
        UploadedFile $file,
        string $altText,
        ?string $caption = null,
        ?int $sortOrder = null
    ): MemoryMedia {
        $currentImageCount = $memoryYear->media()->where('type', 'image')->count();

        if ($currentImageCount >= self::MAX_IMAGES_PER_YEAR) {
            throw ValidationException::withMessages([
                'image' => ['A memory year can have at most ' . self::MAX_IMAGES_PER_YEAR . ' images.'],
            ]);
        }

        if (empty(trim($altText))) {
            throw ValidationException::withMessages([
                'alt_text' => ['Alt text is required for images.'],
            ]);
        }

        $this->validateImageFile($file);

        $filePath = $this->processAndStoreImage($file);

        $sortOrder = $sortOrder ?? (($memoryYear->media()->max('sort_order') ?? 0) + 1);

        return $memoryYear->media()->create([
            'type' => 'image',
            'file_path' => $filePath,
            'external_url' => null,
            'poster_path' => null,
            'alt_text' => trim($altText),
            'caption' => $caption,
            'sort_order' => $sortOrder,
        ]);
    }

    /**
     * Add an external video to a memory year.
     */
    public function addVideo(
        MemoryYear $memoryYear,
        string $externalUrl,
        ?string $caption = null,
        ?string $posterPath = null,
        ?int $sortOrder = null
    ): MemoryMedia {
        $currentVideoCount = $memoryYear->media()->where('type', 'video')->count();

        if ($currentVideoCount >= self::MAX_VIDEOS_PER_YEAR) {
            throw ValidationException::withMessages([
                'video' => ['A memory year can have at most ' . self::MAX_VIDEOS_PER_YEAR . ' videos.'],
            ]);
        }

        $url = trim($externalUrl);
        if (empty($url) || !filter_var($url, FILTER_VALIDATE_URL)) {
            throw ValidationException::withMessages([
                'external_url' => ['A valid external video URL is required.'],
            ]);
        }

        $sortOrder = $sortOrder ?? (($memoryYear->media()->max('sort_order') ?? 0) + 1);

        return $memoryYear->media()->create([
            'type' => 'video',
            'file_path' => null,
            'external_url' => $url,
            'poster_path' => $posterPath,
            'alt_text' => null,
            'caption' => $caption,
            'sort_order' => $sortOrder,
        ]);
    }

    /**
     * Remove a media item from a memory year.
     */
    public function removeMedia(MemoryYear $memoryYear, MemoryMedia $media): void
    {
        if ($media->memory_year_id !== $memoryYear->id) {
            throw ValidationException::withMessages([
                'media' => ['Media item does not belong to this memory year.'],
            ]);
        }

        $media->delete();

        // If no media items remain, unpublish to maintain constraint
        if ($memoryYear->is_published && $memoryYear->media()->count() === 0) {
            $memoryYear->update(['is_published' => false]);
        }
    }

    /**
     * Validate image file integrity, mime type, size, and security against PHP execution.
     */
    public function validateImageFile(UploadedFile $file): void
    {
        // 1. Size check
        if ($file->getSize() > self::MAX_IMAGE_SIZE_BYTES) {
            throw ValidationException::withMessages([
                'image' => ['The image must not exceed 5 MB.'],
            ]);
        }

        // 2. Extension check
        $clientName = strtolower($file->getClientOriginalName());
        $extension = strtolower($file->getClientOriginalExtension());
        if (!in_array($extension, ['jpg', 'jpeg', 'png', 'webp'])) {
            throw ValidationException::withMessages([
                'image' => ['The image must be a file of type: jpg, png, webp.'],
            ]);
        }

        // Detect disguised PHP extensions (e.g., shell.php.jpg or script.php)
        if (preg_match('/\.php(\.|$)/i', $clientName)) {
            throw ValidationException::withMessages([
                'image' => ['The uploaded file is not a permitted image.'],
            ]);
        }

        // 3. Mime check
        $mime = strtolower($file->getMimeType() ?? '');
        if (!in_array($mime, ['image/jpeg', 'image/pjpeg', 'image/png', 'image/webp'])) {
            throw ValidationException::withMessages([
                'image' => ['The image must be a valid JPEG, PNG, or WebP file.'],
            ]);
        }

        if (str_contains($mime, 'php') || str_starts_with($mime, 'text/')) {
            throw ValidationException::withMessages([
                'image' => ['The uploaded file contains forbidden content.'],
            ]);
        }

        // 4. Raw content inspection for embedded PHP code
        $content = @file_get_contents($file->getRealPath());
        if ($content === false || strlen($content) === 0) {
            throw ValidationException::withMessages([
                'image' => ['The uploaded image file is unreadable or empty.'],
            ]);
        }

        if (stripos($content, '<?php') !== false || stripos($content, '<?=') !== false || stripos($content, '<script') !== false) {
            throw ValidationException::withMessages([
                'image' => ['The uploaded file contains executable code and was rejected.'],
            ]);
        }

        // 5. Image dimension and type verification via getimagesize
        $imageInfo = @getimagesize($file->getRealPath());
        if (!$imageInfo || empty($imageInfo[0]) || empty($imageInfo[1])) {
            throw ValidationException::withMessages([
                'image' => ['The file is not a valid image.'],
            ]);
        }

        if (!in_array($imageInfo[2], [IMAGETYPE_JPEG, IMAGETYPE_PNG, IMAGETYPE_WEBP])) {
            throw ValidationException::withMessages([
                'image' => ['The file is not a valid JPEG, PNG, or WebP image.'],
            ]);
        }
    }

    /**
     * Process image: resize to max 2000px dimension and convert to WebP on public disk under memories/.
     */
    public function processAndStoreImage(UploadedFile $file): string
    {
        $content = file_get_contents($file->getRealPath());
        $src = @imagecreatefromstring($content);

        if ($src === false) {
            throw ValidationException::withMessages([
                'image' => ['Unable to decode image file.'],
            ]);
        }

        $origWidth = imagesx($src);
        $origHeight = imagesy($src);

        $maxDim = self::MAX_IMAGE_DIMENSION;
        $targetWidth = $origWidth;
        $targetHeight = $origHeight;

        if ($origWidth > $maxDim || $origHeight > $maxDim) {
            if ($origWidth >= $origHeight) {
                $targetWidth = $maxDim;
                $targetHeight = (int) round(($origHeight / $origWidth) * $maxDim);
            } else {
                $targetHeight = $maxDim;
                $targetWidth = (int) round(($origWidth / $origHeight) * $maxDim);
            }
        }

        $targetImg = imagecreatetruecolor($targetWidth, $targetHeight);
        imagealphablending($targetImg, false);
        imagesavealpha($targetImg, true);

        imagecopyresampled(
            $targetImg,
            $src,
            0, 0, 0, 0,
            $targetWidth, $targetHeight,
            $origWidth, $origHeight
        );

        ob_start();
        imagewebp($targetImg, null, 85);
        $webpBinary = ob_get_clean();

        imagedestroy($src);
        imagedestroy($targetImg);

        if (empty($webpBinary)) {
            throw new \RuntimeException('Failed to convert image to WebP format.');
        }

        $filename = Str::random(40) . '.webp';
        $path = 'memories/' . $filename;

        // Public disk only under memories/
        Storage::disk('public')->put($path, $webpBinary);

        return $path;
    }
}
