<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\In;

class Destination extends Model
{
    use HasFactory, SoftDeletes;

    public const LISTING_STATE_LIVE = 'live';
    public const LISTING_STATE_COMING_SOON = 'coming_soon';
    public const LISTING_STATE_HIDDEN = 'hidden';

    public const LISTING_STATES = [
        self::LISTING_STATE_LIVE,
        self::LISTING_STATE_COMING_SOON,
        self::LISTING_STATE_HIDDEN,
    ];

    protected $fillable = [
        'country',
        'city_region',
        'description',
        'travel_information',
        'status',
        'listing_state',
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

    /**
     * Validation rule restricting listing_state to allowed values.
     */
    public static function listingStateRule(): In
    {
        return Rule::in(self::LISTING_STATES);
    }

    public function setRegionAttribute(?string $value): void
    {
        if ($value !== null && !in_array($value, ['south-asia', 'southeast-asia'], true)) {
            throw new \InvalidArgumentException("Invalid region: {$value}. Allowed values are 'south-asia' and 'southeast-asia'.");
        }

        $this->attributes['region'] = $value;
    }

    public function setListingStateAttribute(?string $value): void
    {
        if ($value !== null && !in_array($value, self::LISTING_STATES, true)) {
            throw new \InvalidArgumentException("Invalid listing_state: {$value}. Allowed values are 'live', 'coming_soon', and 'hidden'.");
        }

        $this->attributes['listing_state'] = $value ?? self::LISTING_STATE_LIVE;
    }

    /**
     * Scope to published destinations (status = active).
     */
    public function scopePublished($query)
    {
        return $query->where('status', 'active');
    }

    /**
     * Scope to public listed destinations (listing_state = live AND status = active).
     */
    public function scopePublicListed($query)
    {
        return $query->where('listing_state', self::LISTING_STATE_LIVE)
            ->where('status', 'active');
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
