<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class MemoryMedia extends Model
{
    use HasFactory;

    protected $fillable = [
        'memory_year_id',
        'type',
        'file_path',
        'external_url',
        'poster_path',
        'alt_text',
        'caption',
        'sort_order',
    ];

    protected $casts = [
        'sort_order' => 'integer',
    ];

    protected $appends = [
        'url',
        'poster_url',
    ];

    protected static function booted(): void
    {
        static::deleted(function (MemoryMedia $media) {
            if ($media->file_path && Storage::disk('public')->exists($media->file_path)) {
                Storage::disk('public')->delete($media->file_path);
            }
            if ($media->poster_path && Storage::disk('public')->exists($media->poster_path)) {
                Storage::disk('public')->delete($media->poster_path);
            }
        });
    }

    public function memoryYear(): BelongsTo
    {
        return $this->belongsTo(MemoryYear::class);
    }

    public function getUrlAttribute(): ?string
    {
        if ($this->type === 'video') {
            return $this->external_url;
        }

        if ($this->file_path) {
            if (str_starts_with($this->file_path, 'http://') || str_starts_with($this->file_path, 'https://') || str_starts_with($this->file_path, '/')) {
                return $this->file_path;
            }
            return Storage::disk('public')->url($this->file_path);
        }

        return null;
    }

    public function getPosterUrlAttribute(): ?string
    {
        if ($this->poster_path) {
            if (str_starts_with($this->poster_path, 'http://') || str_starts_with($this->poster_path, 'https://') || str_starts_with($this->poster_path, '/')) {
                return $this->poster_path;
            }
            return Storage::disk('public')->url($this->poster_path);
        }

        return null;
    }
}
