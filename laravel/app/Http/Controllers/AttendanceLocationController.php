<?php

namespace App\Http\Controllers;

use App\Models\OfficeLocation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AttendanceLocationController extends Controller
{
    /**
     * Display a listing of office geofence locations.
     */
    public function index(): JsonResponse
    {
        return response()->json(OfficeLocation::all());
    }

    /**
     * Store a newly created office geofence location.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'lat' => 'required|numeric',
            'lng' => 'required|numeric',
            'radius' => 'required|integer|min:10',
        ]);

        $location = OfficeLocation::create($validated);
        return response()->json($location, 201);
    }

    /**
     * Update the specified location's radius or coordinates.
     */
    public function update(Request $request, OfficeLocation $location): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'string|max:255',
            'lat' => 'numeric',
            'lng' => 'numeric',
            'radius' => 'integer|min:10',
        ]);

        $location->update($validated);
        return response()->json($location);
    }

    /**
     * Remove the specified location.
     */
    public function destroy(OfficeLocation $location): JsonResponse
    {
        $location->delete();
        return response()->json(['message' => 'Geofence location deleted successfully']);
    }
}
