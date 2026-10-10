<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\TourDetailResource;
use App\Http\Resources\TourListResource;
use App\Models\Destination;
use App\Models\TourPackage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class PublicTourController extends Controller
{
    public function index(Request $request)
    {
        $query = TourPackage::with('destination')
            ->where('is_active', true)
            ->where('status', 'active');

        if ($request->filled('destination')) {
            $query->whereHas('destination', fn ($q) => $q->where('country', $request->destination)->orWhere('city_region', $request->destination)->orWhere('id', $request->destination));
        }
        if ($request->filled('level')) {
            $query->where('package_name', 'like', '%'.$request->level.'%');
        }
        if ($request->filled('duration_min')) {
            $query->where('duration_days', '>=', $request->duration_min);
        }
        if ($request->filled('duration_max')) {
            $query->where('duration_days', '<=', $request->duration_max);
        }
        if ($request->filled('price_min')) {
            $query->where('price', '>=', $request->price_min);
        }
        if ($request->filled('price_max')) {
            $query->where('price', '<=', $request->price_max);
        }
        if ($request->filled('search')) {
            $query->where('package_name', 'like', '%'.$request->search.'%');
        }

        switch ($request->sort) {
            case 'price_asc': $query->orderBy('price', 'asc');
                break;
            case 'price_desc': $query->orderBy('price', 'desc');
                break;
            case 'duration': $query->orderBy('duration_days', 'asc');
                break;
            case 'newest': $query->latest();
                break;
            case 'popular': $query->latest();
                break; // Can be enhanced later
            default: $query->latest();
                break;
        }
        $cacheKey = 'tours_list_'.md5(json_encode($request->all()));

        $tours = Cache::remember($cacheKey, 300, function () use ($query) {
            return $query->paginate(15);
        });

        return TourListResource::collection($tours);
    }

    public function show($slug)
    {
        $tour = TourPackage::with('destination')
            ->where(function ($q) use ($slug) {
                $q->where('slug', $slug)->orWhere('id', $slug);
            })
            ->where('is_active', true)
            ->where('status', 'active')
            ->firstOrFail();

        return new TourDetailResource($tour);
    }

    public function featured()
    {
        $tours = Cache::remember('featured_tours', 300, function () {
            return TourPackage::with('destination')
                ->where('is_active', true)
                ->where('status', 'active')
                ->where('is_featured', true)
                ->take(6)
                ->get();
        });

        return TourListResource::collection($tours);
    }

    public function destinations()
    {
        return response()->json(Destination::withCount(['tourPackages' => fn ($q) => $q->where('is_active', true)->where('status', 'active')])->get());
    }
}
