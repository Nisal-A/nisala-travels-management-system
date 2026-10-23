<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Destination;
use App\Models\MemoryMedia;
use App\Models\MemoryYear;
use App\Services\MemoryPublishingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class MemoryYearController extends Controller
{
    public function __construct(
        protected MemoryPublishingService $publishingService
    ) {}

    /**
     * Display a listing of memory years for staff.
     */
    public function index(Request $request): Response|JsonResponse
    {
        $years = MemoryYear::with(['destination', 'media'])
            ->orderByDesc('year')
            ->orderBy('sort_order')
            ->paginate(15);

        if ($request->wantsJson()) {
            return response()->json($years);
        }

        return Inertia::render('Admin/Memories/Index', [
            'years' => $years,
        ]);
    }

    /**
     * Show the form for creating a new memory year.
     */
    public function create(): Response
    {
        $destinations = Destination::orderBy('country')
            ->orderBy('city_region')
            ->get(['id', 'country', 'city_region']);

        return Inertia::render('Admin/Memories/Create', [
            'destinations' => $destinations,
        ]);
    }

    /**
     * Store a newly created memory year.
     */
    public function store(Request $request): RedirectResponse|JsonResponse
    {
        $validated = $request->validate([
            'year' => ['required', 'integer', 'min:1900', 'max:2100', 'unique:memory_years,year'],
            'title' => ['required', 'string', 'max:255'],
            'summary' => ['nullable', 'string'],
            'destination_id' => ['nullable', 'exists:destinations,id'],
            'tour_name' => ['nullable', 'string', 'max:255'],
            'consent_confirmed_at' => ['nullable', 'date'],
            'is_published' => ['nullable', 'boolean'],
            'sort_order' => ['nullable', 'integer'],
        ]);

        $memoryYear = $this->publishingService->createYear($validated);

        if ($request->wantsJson()) {
            return response()->json([
                'message' => 'Memory year created successfully.',
                'memory_year' => $memoryYear,
            ], 201);
        }

        return redirect()->route('admin.memories.edit', $memoryYear->id)
            ->with('success', 'Memory year created successfully.');
    }

    /**
     * Show the form for editing the specified memory year and managing media.
     */
    public function edit(MemoryYear $memoryYear): Response
    {
        $memoryYear->load([
            'destination',
            'media' => fn ($query) => $query->orderBy('sort_order')->orderBy('id'),
        ]);

        $destinations = Destination::orderBy('country')
            ->orderBy('city_region')
            ->get(['id', 'country', 'city_region']);

        return Inertia::render('Admin/Memories/Edit', [
            'memoryYear' => $memoryYear,
            'destinations' => $destinations,
            'canPublish' => $this->publishingService->canPublish($memoryYear),
        ]);
    }

    /**
     * Update the specified memory year.
     */
    public function update(Request $request, MemoryYear $memoryYear): RedirectResponse|JsonResponse
    {
        $validated = $request->validate([
            'year' => [
                'required',
                'integer',
                'min:1900',
                'max:2100',
                Rule::unique('memory_years', 'year')->ignore($memoryYear->id),
            ],
            'title' => ['required', 'string', 'max:255'],
            'summary' => ['nullable', 'string'],
            'destination_id' => ['nullable', 'exists:destinations,id'],
            'tour_name' => ['nullable', 'string', 'max:255'],
            'consent_confirmed_at' => ['nullable', 'date'],
            'is_published' => ['nullable', 'boolean'],
            'sort_order' => ['nullable', 'integer'],
        ]);

        $updatedYear = $this->publishingService->updateYear($memoryYear, $validated);

        if ($request->wantsJson()) {
            return response()->json([
                'message' => 'Memory year updated successfully.',
                'memory_year' => $updatedYear,
            ]);
        }

        return redirect()->back()->with('success', 'Memory year updated successfully.');
    }

    /**
     * Remove the specified memory year and its media.
     */
    public function destroy(Request $request, MemoryYear $memoryYear): RedirectResponse|JsonResponse
    {
        $this->publishingService->deleteYear($memoryYear);

        if ($request->wantsJson()) {
            return response()->json(['message' => 'Memory year deleted successfully.']);
        }

        return redirect()->route('admin.memories.index')
            ->with('success', 'Memory year deleted successfully.');
    }

    /**
     * Toggle published state for a memory year.
     */
    public function togglePublish(Request $request, MemoryYear $memoryYear): RedirectResponse|JsonResponse
    {
        $updatedYear = $this->publishingService->togglePublish($memoryYear);

        $status = $updatedYear->is_published ? 'published' : 'unpublished';

        if ($request->wantsJson()) {
            return response()->json([
                'message' => "Memory year is now {$status}.",
                'is_published' => $updatedYear->is_published,
                'memory_year' => $updatedYear,
            ]);
        }

        return redirect()->back()->with('success', "Memory year is now {$status}.");
    }

    /**
     * Store a media item (image or video) for a memory year.
     */
    public function storeMedia(Request $request, MemoryYear $memoryYear): RedirectResponse|JsonResponse
    {
        $request->validate([
            'type' => ['required', 'string', Rule::in(['image', 'video'])],
        ]);

        $type = $request->input('type');

        if ($type === 'image') {
            if ($memoryYear->media()->where('type', 'image')->count() >= MemoryPublishingService::MAX_IMAGES_PER_YEAR) {
                throw ValidationException::withMessages([
                    'image' => ['A memory year can have at most ' . MemoryPublishingService::MAX_IMAGES_PER_YEAR . ' images.'],
                ]);
            }

            // Form request validation for image
            // Reject files that are not valid images, exceed 5MB, or are disguised
            $request->validate([
                'image' => [
                    'required',
                    'file',
                    'max:5120',
                    'mimes:jpeg,jpg,png,webp',
                ],
                'alt_text' => ['required', 'string', 'max:255'],
                'caption' => ['nullable', 'string', 'max:500'],
                'sort_order' => ['nullable', 'integer'],
            ], [
                'alt_text.required' => 'Alt text is required for images.',
            ]);

            $media = $this->publishingService->addImage(
                $memoryYear,
                $request->file('image'),
                (string) $request->input('alt_text'),
                $request->input('caption'),
                $request->filled('sort_order') ? (int) $request->input('sort_order') : null
            );
        } else {
            if ($memoryYear->media()->where('type', 'video')->count() >= MemoryPublishingService::MAX_VIDEOS_PER_YEAR) {
                throw ValidationException::withMessages([
                    'video' => ['A memory year can have at most ' . MemoryPublishingService::MAX_VIDEOS_PER_YEAR . ' videos.'],
                ]);
            }

            // Form request validation for video
            $request->validate([
                'external_url' => ['required', 'url', 'max:500'],
                'caption' => ['nullable', 'string', 'max:500'],
                'sort_order' => ['nullable', 'integer'],
            ], [
                'external_url.required' => 'A video URL is required.',
                'external_url.url' => 'Please provide a valid video URL.',
            ]);

            $media = $this->publishingService->addVideo(
                $memoryYear,
                (string) $request->input('external_url'),
                $request->input('caption'),
                $request->input('poster_path'),
                $request->filled('sort_order') ? (int) $request->input('sort_order') : null
            );
        }

        if ($request->wantsJson()) {
            return response()->json([
                'message' => 'Media item added successfully.',
                'media' => $media,
            ], 201);
        }

        return redirect()->back()->with('success', 'Media item added successfully.');
    }

    /**
     * Remove a media item.
     */
    public function destroyMedia(Request $request, MemoryYear $memoryYear, MemoryMedia $media): RedirectResponse|JsonResponse
    {
        $this->publishingService->removeMedia($memoryYear, $media);

        if ($request->wantsJson()) {
            return response()->json(['message' => 'Media item deleted successfully.']);
        }

        return redirect()->back()->with('success', 'Media item removed successfully.');
    }
}
