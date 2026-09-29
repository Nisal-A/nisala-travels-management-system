<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreTourPackageRequest;
use App\Http\Requests\UpdateTourPackageRequest;
use App\Models\TourPackage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;

class TourPackageController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        Gate::authorize('viewAny', TourPackage::class);

        // Normally you would return an Inertia response here.
        // For NT-009.2, we just return the data structure or a placeholder render.
        $packages = TourPackage::with(['destination', 'category'])
            ->orderBy('id', 'desc')
            ->paginate(15);

        return Inertia::render('Tours/Index', [
            'packages' => $packages,
            'destinations' => \App\Models\Destination::orderBy('country')->get(),
            'categories' => \App\Models\TourCategory::orderBy('name')->get()
        ]);
    }

    public function create()
    {
        Gate::authorize('create', TourPackage::class);

        return Inertia::render('Tours/Form', [
            'destinations' => \App\Models\Destination::orderBy('country')->get(),
            'categories' => \App\Models\TourCategory::orderBy('name')->get()
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreTourPackageRequest $request)
    {
        $validated = $request->validated();

        try {
            DB::beginTransaction();

            // Extract itineraries from validated data
            $itineraries = $validated['itineraries'] ?? [];
            unset($validated['itineraries']);

            $validated['created_by'] = $request->user()->id;
            $validated['available_seats'] = $validated['capacity'];
            
            // Generate package_id
            $latest = TourPackage::withTrashed()->orderBy('id', 'desc')->first();
            $nextId = $latest ? $latest->id + 1 : 1;
            $validated['package_id'] = 'PKG-' . str_pad($nextId, 5, '0', STR_PAD_LEFT);

            $package = TourPackage::create($validated);

            if (!empty($itineraries)) {
                $package->itineraries()->createMany($itineraries);
            }

            DB::commit();

            return redirect()->route('tour-packages.show', $package)->with('success', 'Tour package created successfully.');

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Failed to create tour package.']);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(TourPackage $tourPackage)
    {
        Gate::authorize('view', $tourPackage);

        $tourPackage->load(['destination', 'category', 'itineraries' => function($q) {
            $q->orderBy('day_number');
        }, 'createdBy', 'updatedBy']);

        return Inertia::render('Tours/Show', [
            'tourPackage' => $tourPackage
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(TourPackage $tourPackage)
    {
        Gate::authorize('update', $tourPackage);

        $tourPackage->load('itineraries');

        return Inertia::render('Tours/Form', [
            'tourPackage' => $tourPackage,
            'destinations' => \App\Models\Destination::orderBy('country')->get(),
            'categories' => \App\Models\TourCategory::orderBy('name')->get()
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateTourPackageRequest $request, TourPackage $tourPackage)
    {
        $validated = $request->validated();

        try {
            DB::beginTransaction();

            $itineraries = $validated['itineraries'] ?? [];
            unset($validated['itineraries']);

            $validated['updated_by'] = $request->user()->id;

            $tourPackage->update($validated);

            if (!empty($itineraries)) {
                // Sync itineraries
                // First delete ones not in the request
                $providedIds = collect($itineraries)->pluck('id')->filter()->toArray();
                $tourPackage->itineraries()->whereNotIn('id', $providedIds)->delete();

                foreach ($itineraries as $itineraryData) {
                    if (isset($itineraryData['id'])) {
                        $tourPackage->itineraries()->where('id', $itineraryData['id'])->update($itineraryData);
                    } else {
                        $tourPackage->itineraries()->create($itineraryData);
                    }
                }
            } else {
                $tourPackage->itineraries()->delete();
            }

            DB::commit();

            return redirect()->route('tour-packages.show', $tourPackage)->with('success', 'Tour package updated successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Failed to update tour package.']);
        }
    }

    /**
     * Change the status of the package.
     */
    public function changeStatus(Request $request, TourPackage $tourPackage)
    {
        Gate::authorize('changeStatus', $tourPackage);

        $validated = $request->validate([
            'status' => ['required', 'in:draft,active,inactive,archived']
        ]);

        $tourPackage->update([
            'status' => $validated['status'],
            'updated_by' => $request->user()->id
        ]);

        return back()->with('success', 'Status updated successfully.');
    }

    /**
     * Remove the specified resource from storage. (Soft delete)
     */
    public function destroy(TourPackage $tourPackage)
    {
        Gate::authorize('delete', $tourPackage);

        $tourPackage->update(['updated_by' => auth()->id()]);
        $tourPackage->delete();

        return redirect()->route('tour-packages.index')->with('success', 'Tour package archived successfully.');
    }

    /**
     * Restore the specified resource.
     */
    public function restore($id)
    {
        $tourPackage = TourPackage::withTrashed()->findOrFail($id);
        
        Gate::authorize('restore', $tourPackage);

        $tourPackage->restore();
        $tourPackage->update(['updated_by' => auth()->id()]);

        return back()->with('success', 'Tour package restored successfully.');
    }
}
