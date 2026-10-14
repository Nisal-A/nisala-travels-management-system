<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\DestinationResource;
use App\Http\Resources\TourDetailResource;
use App\Http\Resources\TourListResource;
use App\Models\Destination;
use App\Models\TourPackage;
use Illuminate\Support\Facades\Cache;

class PublicTourController extends Controller
{
    public function index()
    {
        $tours = Cache::remember('public.tours.all', 300, function () {
            return TourPackage::published()
                ->with('destination')
                ->orderBy('sort_order')
                ->orderBy('id')
                ->get();
        });

        return TourListResource::collection($tours);
    }

    public function show(string $slug)
    {
        if (is_numeric($slug)) {
            abort(404);
        }

        $tour = Cache::remember("public.tour.{$slug}", 300, function () use ($slug) {
            return TourPackage::published()
                ->with('destination')
                ->where('slug', $slug)
                ->firstOrFail();
        });

        return new TourDetailResource($tour);
    }

    public function destinations()
    {
        $destinations = Cache::remember('public.destinations.all', 300, function () {
            return Destination::published()
                ->orderBy('sort_order')
                ->orderBy('id')
                ->get();
        });

        return DestinationResource::collection($destinations);
    }
}
