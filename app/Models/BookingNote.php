<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class BookingNote extends Model
{
    use HasFactory;

    protected $guarded = [];

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(BookingNote::class, 'parent_id');
    }

    public function replies(): HasMany
    {
        return $this->hasMany(BookingNote::class, 'parent_id')->with(['user:id,name,email', 'replies']);
    }
}
