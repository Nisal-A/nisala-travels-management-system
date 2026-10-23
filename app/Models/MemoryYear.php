<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class MemoryYear extends Model
{
    use HasFactory;

    protected $fillable = [
        'year',
        'title',
        'summary',
        'destination_id',
        'tour_name',
        'consent_confirmed_at',
        'is_published',
        'sort_order',
    ];

    protected $casts = [
        'year' => 'integer',
        'is_published' => 'boolean',
        'sort_order' => 'integer',
        'consent_confirmed_at' => 'datetime',
    ];

    public function destination(): BelongsTo
    {
        return $this->belongsTo(Destination::class);
    }

    public function media(): HasMany
    {
        return $this->hasMany(MemoryMedia::class)->orderBy('sort_order')->orderBy('id');
    }

    public function images(): HasMany
    {
        return $this->hasMany(MemoryMedia::class)->where('type', 'image')->orderBy('sort_order')->orderBy('id');
    }

    public function videos(): HasMany
    {
        return $this->hasMany(MemoryMedia::class)->where('type', 'video')->orderBy('sort_order')->orderBy('id');
    }

    /**
     * Scope for querying published memories with confirmed consent.
     */
    public function scopePublished($query)
    {
        return $query->where('is_published', true)->whereNotNull('consent_confirmed_at');
    }
}
