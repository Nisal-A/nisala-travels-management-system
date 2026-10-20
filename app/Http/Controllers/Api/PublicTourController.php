<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\DestinationResource;
use App\Http\Resources\TourDetailResource;
use App\Http\Resources\TourListResource;
use App\Services\PublicCatalogService;
use Illuminate\Http\Request;

class PublicTourController extends Controller
{
    public function __construct(
        protected PublicCatalogService $catalogService
    ) {}

    public function index(Request $request)
    {
        $tours = $this->catalogService->tours($request->all());

        return TourListResource::collection($tours);
    }

    public function show(string $slug)
    {
        $tour = $this->catalogService->tourBySlug($slug);

        return new TourDetailResource($tour);
    }

    public function destinations()
    {
        $destinations = $this->catalogService->destinations();

        return DestinationResource::collection($destinations);
    }
}
