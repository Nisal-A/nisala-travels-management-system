<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\TestimonialResource;
use App\Services\PublicCatalogService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class PublicTestimonialController extends Controller
{
    public function __construct(
        protected PublicCatalogService $catalogService
    ) {}

    /**
     * Get published, consented traveler testimonials.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $testimonials = $this->catalogService->testimonials();

        return TestimonialResource::collection($testimonials);
    }
}
