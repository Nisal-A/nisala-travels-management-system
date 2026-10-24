<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreTourPackageRequest;
use App\Http\Requests\UpdateTourPackageRequest;
use App\Models\Destination;
use App\Models\TourPackage;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;

class TourPackageController extends Controller
{
    public function index(Request $request)
    {
        $query = TourPackage::with('destination');

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
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
            'filters' => (object) $request->only(['search', 'status', 'destination', 'sort', 'direction']),
        ]);
    }

    public function create()
    {
        $destinations = Destination::where('status', 'active')
            ->orderBy('country')
            ->orderBy('city_region')
            ->get();

        return Inertia::render('Tours/Create', [
            'destinations' => $destinations,
            'tiers' => config('tour_tiers.tiers', []),
            'allowed_by_destination' => config('tour_tiers.allowed_by_destination', []),
        ]);
    }

    public function store(StoreTourPackageRequest $request)
    {
        $data = $request->validated();

        if ($request->hasFile('hero_image')) {
            $data['hero_image'] = $request->file('hero_image')->store('tours', 'public');
        }

        $data['gallery'] = $this->resolveGallery($request);
        $data['highlights'] = $this->cleanStringList($request->input('highlights'));
        $data['tags'] = $this->cleanStringList($request->input('tags'));
        $data['departure_months'] = $this->cleanStringList($request->input('departure_months'));
        $data['itinerary'] = $this->cleanItineraryList($request->input('itinerary'));
        $data['faqs'] = $this->cleanFaqsList($request->input('faqs'));

        unset($data['gallery_files'], $data['gallery_order']);

        $tour = TourPackage::create($data);

        $this->clearPublicCatalogCache($tour);

        return redirect()->route('tours.index')->with('success', 'Tour Package created successfully.');
    }

    public function show(TourPackage $tour)
    {
        return redirect()->route('tours.edit', $tour);
    }

    public function edit(TourPackage $tour)
    {
        $tour->load('destination');
        $destinations = Destination::where('status', 'active')
            ->orWhere('id', $tour->destination_id)
            ->orderBy('country')
            ->orderBy('city_region')
            ->get();

        return Inertia::render('Tours/Edit', [
            'tour' => $tour,
            'destinations' => $destinations,
            'tiers' => config('tour_tiers.tiers', []),
            'allowed_by_destination' => config('tour_tiers.allowed_by_destination', []),
        ]);
    }

    public function update(UpdateTourPackageRequest $request, TourPackage $tour)
    {
        $data = $request->validated();

        if ($request->hasFile('hero_image')) {
            $data['hero_image'] = $request->file('hero_image')->store('tours', 'public');
        } elseif ($request->exists('hero_image') && empty($request->input('hero_image'))) {
            $data['hero_image'] = null;
        }

        $data['gallery'] = $this->resolveGallery($request, $tour->gallery ?? []);
        $data['highlights'] = $this->cleanStringList($request->input('highlights'));
        $data['tags'] = $this->cleanStringList($request->input('tags'));
        $data['departure_months'] = $this->cleanStringList($request->input('departure_months'));
        $data['itinerary'] = $this->cleanItineraryList($request->input('itinerary'));
        $data['faqs'] = $this->cleanFaqsList($request->input('faqs'));

        unset($data['gallery_files'], $data['gallery_order']);

        $tour->update($data);

        $this->clearPublicCatalogCache($tour);

        return redirect()->route('tours.index')->with('success', 'Tour Package updated successfully.');
    }

    public function destroy(TourPackage $tour)
    {
        $tour->delete();

        $this->clearPublicCatalogCache($tour);

        return redirect()->route('tours.index')->with('success', 'Tour Package removed successfully.');
    }

    protected function resolveGallery(Request $request, array $fallback = []): array
    {
        $uploadedGalleryPaths = [];

        if ($request->hasFile('gallery_files')) {
            foreach ($request->file('gallery_files') as $file) {
                if ($file instanceof UploadedFile) {
                    $uploadedGalleryPaths[] = $file->store('tours', 'public');
                }
            }
        } elseif ($request->hasFile('gallery')) {
            foreach ($request->file('gallery') as $file) {
                if ($file instanceof UploadedFile) {
                    $uploadedGalleryPaths[] = $file->store('tours', 'public');
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

    protected function cleanItineraryList($items): ?array
    {
        if (!is_array($items)) {
            return null;
        }

        $cleaned = [];
        foreach ($items as $item) {
            if (!is_array($item)) {
                continue;
            }
            $day = isset($item['day']) && $item['day'] !== '' ? (int) $item['day'] : null;
            $title = trim((string) ($item['title'] ?? ''));
            $desc = trim((string) ($item['description'] ?? ''));
            if ($day !== null || $title !== '' || $desc !== '') {
                $cleaned[] = [
                    'day' => $day ?? (count($cleaned) + 1),
                    'title' => $title,
                    'description' => $desc,
                ];
            }
        }

        return empty($cleaned) ? null : $cleaned;
    }

    protected function cleanFaqsList($items): ?array
    {
        if (!is_array($items)) {
            return null;
        }

        $cleaned = [];
        foreach ($items as $item) {
            if (!is_array($item)) {
                continue;
            }
            $question = trim((string) ($item['question'] ?? ''));
            $answer = trim((string) ($item['answer'] ?? ''));
            if ($question !== '' || $answer !== '') {
                $cleaned[] = [
                    'question' => $question,
                    'answer' => $answer,
                ];
            }
        }

        return empty($cleaned) ? null : $cleaned;
    }

    protected function clearPublicCatalogCache(?TourPackage $tour = null): void
    {
        if (Cache::supportsTags()) {
            Cache::tags(['public-catalog', 'destinations', 'tours'])->flush();
        }

        Cache::forget('public.destinations.all');
        Cache::forget('public.tours.all');
        if ($tour && !empty($tour->slug)) {
            Cache::forget("public.tour.{$tour->slug}");
        }
    }
}
