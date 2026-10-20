<?php

namespace App\Http\Controllers;

use App\Http\Resources\DestinationResource;
use App\Http\Resources\TourListResource;
use App\Services\PublicCatalogService;
use Inertia\Inertia;
use Inertia\Response;

class PublicController extends Controller
{
    public function __construct(
        protected PublicCatalogService $catalogService
    ) {}

    /**
     * Display the public homepage with featured packages and destinations.
     */
    public function home(): Response
    {
        $featuredPackages = TourListResource::collection(
            $this->catalogService->featuredTours(6)
        )->resolve();

        $destinations = DestinationResource::collection(
            $this->catalogService->destinations()
        )->resolve();

        return Inertia::render('Public/Home', [
            'featuredPackages' => $featuredPackages,
            'destinations' => $destinations,
        ]);
    }
}
