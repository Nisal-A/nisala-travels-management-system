<?php

namespace App\Http\Controllers\Portal;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProfileController extends Controller
{
    public function edit(Request $request)
    {
        return Inertia::render('Portal/Profile/Edit');
    }
    
    public function update(Request $request)
    {
        return back()->with('success', 'Profile updated');
    }
    
    public function updatePassword(Request $request)
    {
        return back()->with('success', 'Password updated');
    }
}
