<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MemoryYearResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * Rules:
     * - Returns year, title, summary, destination name, and media.
     * - media contains type, url, alt_text, caption, poster_url, external_url for video.
     * - Never return consent fields or internal metadata.
     */
    public function toArray(Request $request): array
    {
        $destinationName = is_array($this->resource)
            ? ($this->resource['destination_name'] ?? $this->resource['destination'] ?? '')
            : ($this->destination_name ?? $this->destination?->name ?? $this->destination ?? '');

        $media = is_array($this->resource)
            ? ($this->resource['media'] ?? [])
            : ($this->media ?? []);

        // If resource has separate 'photos' and 'videos' collections, normalize them to unified media list
        if (empty($media)) {
            $photos = is_array($this->resource) ? ($this->resource['photos'] ?? []) : ($this->photos ?? []);
            $videos = is_array($this->resource) ? ($this->resource['videos'] ?? []) : ($this->videos ?? []);

            $media = [];
            foreach ($photos as $photo) {
                $media[] = [
                    'type' => 'image',
                    'url' => (string) (is_array($photo) ? ($photo['url'] ?? $photo['src'] ?? '') : ($photo->url ?? $photo->src ?? '')),
                    'alt_text' => (string) (is_array($photo) ? ($photo['alt_text'] ?? $photo['alt'] ?? '') : ($photo->alt_text ?? $photo->alt ?? '')),
                    'caption' => is_array($photo) ? ($photo['caption'] ?? null) : ($photo->caption ?? null),
                    'poster_url' => null,
                    'external_url' => null,
                ];
            }
            foreach ($videos as $video) {
                $media[] = [
                    'type' => 'video',
                    'url' => (string) (is_array($video) ? ($video['url'] ?? $video['videoUrl'] ?? $video['video_url'] ?? '') : ($video->url ?? $video->videoUrl ?? $video->video_url ?? '')),
                    'alt_text' => (string) (is_array($video) ? ($video['alt_text'] ?? $video['title'] ?? '') : ($video->alt_text ?? $video->title ?? '')),
                    'caption' => is_array($video) ? ($video['caption'] ?? $video['title'] ?? null) : ($video->caption ?? $video->title ?? null),
                    'poster_url' => is_array($video) ? ($video['poster_url'] ?? $video['poster'] ?? null) : ($video->poster_url ?? $video->poster ?? null),
                    'external_url' => is_array($video) ? ($video['external_url'] ?? $video['videoUrl'] ?? $video['video_url'] ?? null) : ($video->external_url ?? $video->videoUrl ?? $video->video_url ?? null),
                ];
            }
        } else {
            $normalizedMedia = [];
            foreach ($media as $item) {
                $normalizedMedia[] = [
                    'type' => (string) (is_array($item) ? ($item['type'] ?? 'image') : ($item->type ?? 'image')),
                    'url' => (string) (is_array($item) ? ($item['url'] ?? $item['src'] ?? '') : ($item->url ?? $item->src ?? '')),
                    'alt_text' => (string) (is_array($item) ? ($item['alt_text'] ?? $item['alt'] ?? '') : ($item->alt_text ?? $item->alt ?? '')),
                    'caption' => is_array($item) ? ($item['caption'] ?? null) : ($item->caption ?? null),
                    'poster_url' => is_array($item) ? ($item['poster_url'] ?? null) : ($item->poster_url ?? null),
                    'external_url' => is_array($item) ? ($item['external_url'] ?? null) : ($item->external_url ?? null),
                ];
            }
            $media = $normalizedMedia;
        }

        $year = is_array($this->resource) ? ($this->resource['year'] ?? null) : $this->year;
        $title = is_array($this->resource) ? ($this->resource['title'] ?? null) : $this->title;
        $summary = is_array($this->resource) ? ($this->resource['summary'] ?? null) : $this->summary;

        return [
            'year' => (int) $year,
            'title' => (string) $title,
            'summary' => (string) $summary,
            'destination_name' => (string) $destinationName,
            'destination' => (string) $destinationName,
            'media' => $media,
        ];
    }
}
