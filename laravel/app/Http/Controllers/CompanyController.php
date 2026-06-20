<?php

namespace App\Http\Controllers;

use App\Models\Company;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CompanyController extends Controller
{
    /**
     * Display a listing of companies.
     */
    public function index(): JsonResponse
    {
        $companies = Company::withCount('employees')->get();
        return response()->json($companies);
    }

    /**
     * Store a newly created company.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'logo' => 'nullable|string',
            'industry' => 'nullable|string',
            'status' => 'nullable|string',
            'cr_number' => 'nullable|string',
            'expiry_date' => 'nullable|date',
        ]);

        $company = Company::create($validated);
        return response()->json($company, 201);
    }

    /**
     * Display the specified company.
     */
    public function show(Company $company): JsonResponse
    {
        return response()->json($company->load('employees'));
    }

    /**
     * Update the specified company.
     */
    public function update(Request $request, Company $company): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'string|max:255',
            'logo' => 'nullable|string',
            'industry' => 'nullable|string',
            'status' => 'string',
            'cr_number' => 'nullable|string',
            'expiry_date' => 'nullable|date',
        ]);

        $company->update($validated);
        return response()->json($company);
    }

    /**
     * Remove the specified company.
     */
    public function destroy(Company $company): JsonResponse
    {
        $company->delete();
        return response()->json(['message' => 'Company deleted successfully']);
    }
}
