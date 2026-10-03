<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreDestinationRequest;
use App\Http\Requests\UpdateDestinationRequest;
use App\Models\Destination;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DestinationController extends Controller
{
    public function index(Request $request)
    {
        $query = Destination::query();

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('country', 'like', "%{$search}%")
                    ->orWhere('city_region', 'like', "%{$search}%");
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        $sortField = $request->input('sort', 'created_at');
        $sortDirection = $request->input('direction', 'desc');

        $allowedSortFields = ['country', 'city_region', 'created_at', 'status'];
        if (in_array($sortField, $allowedSortFields)) {
            $query->orderBy($sortField, $sortDirection === 'asc' ? 'asc' : 'desc');
        } else {
            $query->orderBy('created_at', 'desc');
        }

        $destinations = $query->paginate(10)->withQueryString();

        return Inertia::render('Destinations/Index', [
            'destinations' => $destinations,
            'filters' => (object) $request->only(['search', 'status', 'sort', 'direction']),
        ]);
    }

    public function create()
    {
        return Inertia::render('Destinations/Create');
    }

    public function store(StoreDestinationRequest $request)
    {
        Destination::create($request->validated());

        return redirect()->route('destinations.index')->with('success', 'Destination created successfully.');
    }

    public function show(Destination $destination)
    {
        $destination->load('tourPackages');

        return Inertia::render('Destinations/Show', [
            'destination' => $destination,
        ]);
    }

    public function edit(Destination $destination)
    {
        return Inertia::render('Destinations/Edit', [
            'destination' => $destination,
        ]);
    }

    public function update(UpdateDestinationRequest $request, Destination $destination)
    {
        $destination->update($request->validated());

        return redirect()->route('destinations.index')->with('success', 'Destination updated successfully.');
    }

    public function destroy(Destination $destination)
    {
        $destination->delete();

        return redirect()->route('destinations.index')->with('success', 'Destination removed successfully.');
    }
}
