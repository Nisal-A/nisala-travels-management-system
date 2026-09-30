<?php

namespace App\Http\Controllers;

use App\Models\TourPackage;
use App\Models\Destination;
use App\Http\Requests\StoreTourPackageRequest;
use App\Http\Requests\UpdateTourPackageRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TourPackageController extends Controller
{
    public function index(Request $request)
    {
        $query = TourPackage::with('destination');

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function($q) use ($search) {
                $q->where('package_name', 'like', "%{$search}%");
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->filled('destination')) {
            $query->where('destination_id', $request->input('destination'));
        }

        $sortField = $request->input('sort', 'created_at');
        $sortDirection = $request->input('direction', 'desc');
        
        $allowedSortFields = ['package_name', 'price', 'start_date', 'created_at', 'status'];
        if (in_array($sortField, $allowedSortFields)) {
            $query->orderBy($sortField, $sortDirection === 'asc' ? 'asc' : 'desc');
        } else {
            $query->orderBy('created_at', 'desc');
        }

        $tours = $query->paginate(10)->withQueryString();
        $destinations = Destination::orderBy('country')->orderBy('city_region')->get();

        return Inertia::render('Tours/Index', [
            'tours' => $tours,
            'destinations' => $destinations,
            'filters' => (object) $request->only(['search', 'status', 'destination', 'sort', 'direction'])
        ]);
    }

    public function create()
    {
        $destinations = Destination::orderBy('country')->orderBy('city_region')->get();
        return Inertia::render('Tours/Create', [
            'destinations' => $destinations
        ]);
    }

    public function store(StoreTourPackageRequest $request)
    {
        TourPackage::create($request->validated());
        return redirect()->route('tours.index')->with('success', 'Tour Package created successfully.');
    }

    public function show(TourPackage $tour)
    {
        $tour->load('destination');
        return Inertia::render('Tours/Show', [
            'tour' => $tour,
        ]);
    }

    public function edit(TourPackage $tour)
    {
        $destinations = Destination::orderBy('country')->orderBy('city_region')->get();
        return Inertia::render('Tours/Edit', [
            'tour' => $tour,
            'destinations' => $destinations,
        ]);
    }

    public function update(UpdateTourPackageRequest $request, TourPackage $tour)
    {
        $tour->update($request->validated());
        return redirect()->route('tours.index')->with('success', 'Tour Package updated successfully.');
    }

    public function destroy(TourPackage $tour)
    {
        $tour->delete();
        return redirect()->route('tours.index')->with('success', 'Tour Package removed successfully.');
    }
}
