<?php

namespace App\Models;

use App\Enums\SupplierType;
use App\Services\NumberGenerator;
use App\Traits\Filterable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Supplier extends Model
{
    use HasFactory, SoftDeletes, Filterable;

    protected $guarded = [];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'type' => SupplierType::class,
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (Supplier $supplier) {
            if (empty($supplier->supplier_code)) {
                $supplier->supplier_code = app(NumberGenerator::class)->supplier();
            }
        });
    }

    public function costLines(): HasMany
    {
        return $this->hasMany(PackageCostLine::class);
    }

    public function getSearchableColumns(): array
    {
        return ['supplier_code', 'name', 'contact_name', 'phone', 'email'];
    }

    public function getFilterableColumns(): array
    {
        return ['type', 'is_active', 'default_currency'];
    }

    public function getSortableColumns(): array
    {
        return ['supplier_code', 'name', 'type', 'is_active', 'created_at'];
    }
}
