<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\MemoryYearResource;
use App\Services\PublicCatalogService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class PublicMemoryController extends Controller
{
    public function __construct(
        protected PublicCatalogService $catalogService
    ) {}

    /**
     * Get published, consented traveler memory year groups, newest first.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $memories = $this->catalogService->memories();

        return MemoryYearResource::collection($memories);
    }
}
