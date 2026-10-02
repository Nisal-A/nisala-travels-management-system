<?php

namespace App\Http\Controllers;

use App\Models\SavedFilter;
use Illuminate\Http\Request;

class SavedFilterController extends Controller
{
    /**
     * Store a newly created saved filter.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'table_key' => 'required|string|max:255',
            'name' => 'required|string|max:255',
            'filters' => 'required|array',
        ]);

        $savedFilter = SavedFilter::updateOrCreate(
            [
                'user_id' => $request->user()->id,
                'table_key' => $validated['table_key'],
                'name' => $validated['name'],
            ],
            [
                'filters' => $validated['filters'],
            ]
        );

        return back()->with('success', 'Filter saved successfully.');
    }

    /**
     * Remove the specified saved filter.
     */
    public function destroy(Request $request, SavedFilter $savedFilter)
    {
        if ($savedFilter->user_id !== $request->user()->id) {
            abort(403);
        }

        $savedFilter->delete();

        return back()->with('success', 'Saved filter deleted.');
    }
}
