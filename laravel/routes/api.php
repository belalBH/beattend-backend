<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\CompanyController;
use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\AttendanceLocationController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

Route::middleware('api')->group(function () {
    // Company endpoints
    Route::apiResource('companies', CompanyController::class);

    // Employee endpoints
    Route::apiResource('employees', EmployeeController::class);

    // Office Location / Geofence range endpoints
    Route::apiResource('office-locations', AttendanceLocationController::class);

    // Dynamic endpoint for checking attendance check-in coordinates inside radius
    Route::post('/attendance/check', function (Request $request) {
        $request->validate([
            'employee_id' => 'required|exists:employees,id',
            'latitude' => 'required|numeric',
            'longitude' => 'required|numeric',
        ]);

        $empLat = $request->latitude;
        $empLng = $request->longitude;

        // Retrieve active branches
        $locations = \App\Models\OfficeLocation::all();
        $isWithinRange = false;
        $matchingBranch = null;

        foreach ($locations as $loc) {
            // Calculate distance using Haversine formula
            $earthRadius = 6371000; // Earth's radius in meters
            $latFrom = deg2rad($empLat);
            $lonFrom = deg2rad($empLng);
            $latTo = deg2rad($loc->lat);
            $lonTo = deg2rad($loc->lng);

            $latDelta = $latTo - $latFrom;
            $lonDelta = $lonTo - $lonFrom;

            $angle = 2 * asin(sqrt(pow(sin($latDelta / 2), 2) +
                cos($latFrom) * cos($latTo) * pow(sin($lonDelta / 2), 2)));
            
            $distance = $angle * $earthRadius;

            if ($distance <= $loc->radius) {
                $isWithinRange = true;
                $matchingBranch = $loc;
                break;
            }
        }

        if ($isWithinRange) {
            return response()->json([
                'success' => true,
                'message' => 'تم تسجيل الحضور بنجاح داخل النطاق الجغرافي: ' . $matchingBranch->name,
                'branch' => $matchingBranch
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'عذراً، أنت خارج النطاق الجغرافي المصرح به لتسجيل الحضور.'
        ], 403);
    });
});
