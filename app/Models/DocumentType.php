<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class DocumentType extends Model
{
    use HasFactory;
    protected $fillable = [
        'name',
        'description',
        'is_required',
        'is_active',
        'tracks_expiry',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_required' => 'boolean',
            'is_active' => 'boolean',
            'tracks_expiry' => 'boolean',
        ];
    }

    /**
     * Get all documents of this type.
     */
    public function documents()
    {
        return $this->hasMany(CustomerDocument::class);
    }
}
