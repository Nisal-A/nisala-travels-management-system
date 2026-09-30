<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Destination extends Model
{
    use HasFactory;
    
    protected $fillable = [
        'country',
        'city_region',
        'description',
        'travel_information',
        'status',
    ];

    public function tourPackages()
    {
        return $this->hasMany(TourPackage::class);
    }
}
