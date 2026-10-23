<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreDestinationRequest;
use App\Http\Requests\UpdateDestinationRequest;
use App\Models\Destination;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;

class DestinationController extends Controller
{
    public function index(Request $request)
    {
        $query = Destination::withCount('tourPackages');

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('country', 'like', "%{$search}%")
                    ->orWhere('city_region', 'like', "%{$search}%")
                    ->orWhere('slug', 'like', "%{$search}%");
            });
        }

        if ($request->filled('status') && $request->input('status') !== 'all') {
            $query->where('status', $request->input('status'));
        }

        if ($request->filled('listing_state') && $request->input('listing_state') !== 'all') {
            $query->where('listing_state', $request->input('listing_state'));
        }

        $sortField = $request->input('sort', 'created_at');
        $sortDirection = $request->input('direction', 'desc');

        $allowedSortFields = ['country', 'city_region', 'slug', 'status', 'listing_state', 'tour_packages_count', 'created_at'];
        if (in_array($sortField, $allowedSortFields)) {
            $query->orderBy($sortField, $sortDirection === 'asc' ? 'asc' : 'desc');
        } else {
            $query->orderBy('created_at', 'desc');
        }

        $destinations = $query->paginate(10)->withQueryString();

        return Inertia::render('Destinations/Index', [
            'destinations' => $destinations,
            'filters' => (object) $request->only(['search', 'status', 'listing_state', 'sort', 'direction']),
        ]);
    }

    public function create()
    {
        return Inertia::render('Destinations/Create');
    }

    public function store(StoreDestinationRequest $request)
    {
        $data = $request->validated();

        if ($request->hasFile('hero_image')) {
            $data['hero_image'] = $request->file('hero_image')->store('destinations', 'public');
        }

        $data['gallery'] = $this->resolveGallery($request);
        $data['highlights'] = $this->cleanStringList($request->input('highlights'));
        $data['recommendations'] = $this->cleanStringList($request->input('recommendations'));
        $data['facts'] = $this->cleanFactsList($request->input('facts'));

        unset($data['gallery_files']);

        $destination = Destination::create($data);

        $this->clearPublicCatalogCache();

        return redirect()->route('destinations.index')->with('success', 'Destination created successfully.');
    }

    public function show(Destination $destination)
    {
        return redirect()->route('destinations.edit', $destination);
    }

    public function edit(Destination $destination)
    {
        $destination->loadCount('tourPackages');

        return Inertia::render('Destinations/Edit', [
            'destination' => $destination,
        ]);
    }

    public function update(UpdateDestinationRequest $request, Destination $destination)
    {
        $data = $request->validated();

        if ($request->hasFile('hero_image')) {
            $data['hero_image'] = $request->file('hero_image')->store('destinations', 'public');
        } elseif ($request->exists('hero_image') && empty($request->input('hero_image'))) {
            $data['hero_image'] = null;
        }

        $data['gallery'] = $this->resolveGallery($request, $destination->gallery ?? []);
        $data['highlights'] = $this->cleanStringList($request->input('highlights'));
        $data['recommendations'] = $this->cleanStringList($request->input('recommendations'));
        $data['facts'] = $this->cleanFactsList($request->input('facts'));

        unset($data['gallery_files']);

        $destination->update($data);

        $this->clearPublicCatalogCache();

        return redirect()->route('destinations.index')->with('success', 'Destination updated successfully.');
    }

    public function destroy(Destination $destination)
    {
        if ($destination->tourPackages()->count() > 0) {
            return redirect()->back()->with('error', 'Remove or move its tours first.');
        }

        $destination->delete();

        $this->clearPublicCatalogCache();

        return redirect()->route('destinations.index')->with('success', 'Destination removed successfully.');
    }

    protected function resolveGallery(Request $request, array $fallback = []): array
    {
        $uploadedGalleryPaths = [];

        if ($request->hasFile('gallery_files')) {
            foreach ($request->file('gallery_files') as $file) {
                if ($file instanceof UploadedFile) {
                    $uploadedGalleryPaths[] = $file->store('destinations', 'public');
                }
            }
        } elseif ($request->hasFile('gallery')) {
            foreach ($request->file('gallery') as $file) {
                if ($file instanceof UploadedFile) {
                    $uploadedGalleryPaths[] = $file->store('destinations', 'public');
                }
            }
        }

        $rawGallery = $request->input('gallery');
        if (is_array($rawGallery)) {
            $existingGallery = array_values(array_filter($rawGallery, 'is_string'));
        } elseif ($request->has('gallery')) {
            $existingGallery = [];
        } else {
            $existingGallery = $fallback;
        }

        if ($request->filled('gallery_order') && is_array($request->input('gallery_order'))) {
            $gallery = [];
            foreach ($request->input('gallery_order') as $token) {
                if (str_starts_with($token, 'existing:')) {
                    $idx = (int) substr($token, 9);
                    if (isset($existingGallery[$idx])) {
                        $gallery[] = $existingGallery[$idx];
                    }
                } elseif (str_starts_with($token, 'new:')) {
                    $idx = (int) substr($token, 4);
                    if (isset($uploadedGalleryPaths[$idx])) {
                        $gallery[] = $uploadedGalleryPaths[$idx];
                    }
                }
            }
            return $gallery;
        }

        return array_values(array_merge($existingGallery, $uploadedGalleryPaths));
    }

    protected function cleanStringList($items): ?array
    {
        if (!is_array($items)) {
            return null;
        }

        $cleaned = array_values(array_filter(
            array_map(fn ($item) => is_string($item) ? trim($item) : '', $items),
            fn ($item) => $item !== ''
        ));

        return empty($cleaned) ? null : $cleaned;
    }

    protected function cleanFactsList($items): ?array
    {
        if (!is_array($items)) {
            return null;
        }

        $cleaned = array_values(array_filter(
            $items,
            function ($f) {
                if (!is_array($f)) {
                    return false;
                }
                $label = trim((string) ($f['label'] ?? ''));
                $value = trim((string) ($f['value'] ?? ''));
                return $label !== '' || $value !== '';
            }
        ));

        return empty($cleaned) ? null : $cleaned;
    }

    protected function clearPublicCatalogCache(): void
    {
        if (Cache::supportsTags()) {
            Cache::tags(['public-catalog', 'destinations', 'tours'])->flush();
        } else {
            Cache::forget('public.destinations.all');
            Cache::forget('public.tours.all');
        }
    }
}

