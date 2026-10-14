<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Destination extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'country',
        'city_region',
        'description',
        'travel_information',
        'status',
        'slug',
        'region',
        'tagline',
        'best_months',
        'facts',
        'highlights',
        'hero_image',
        'gallery',
        'sort_order',
    ];

    protected $casts = [
        'facts' => 'array',
        'highlights' => 'array',
        'gallery' => 'array',
    ];

    public function setRegionAttribute(?string $value): void
    {
        if ($value !== null && !in_array($value, ['south-asia', 'southeast-asia'], true)) {
            throw new \InvalidArgumentException("Invalid region: {$value}. Allowed values are 'south-asia' and 'southeast-asia'.");
        }

        $this->attributes['region'] = $value;
    }

    public function scopePublished($query)
    {
        return $query->where('status', 'active');
    }

    public function publicTourCount(): int
    {
        return $this->tourPackages()->published()->count();
    }

    public function tourPackages()
    {
        return $this->hasMany(TourPackage::class);
    }
}
