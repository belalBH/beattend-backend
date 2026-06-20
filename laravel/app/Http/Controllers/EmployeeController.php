<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EmployeeController extends Controller
{
    /**
     * Display a listing of employees.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Employee::with('company');

        if ($request->has('company_id')) {
            $query->where('company_id', $request->company_id);
        }

        return response()->json($query->get());
    }

    /**
     * Store a newly created employee.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'company_id' => 'required|exists:companies,id',
            'emp_no' => 'required|string|unique:employees,emp_no',
            'name' => 'required|string|max:225',
            'title' => 'required|string',
            'department' => 'required|string',
            'email' => 'required|email|unique:employees,email',
            'phone' => 'nullable|string',
            'salary' => 'nullable|numeric',
            'status' => 'nullable|string',
            'avatar' => 'nullable|string',
        ]);

        $employee = Employee::create($validated);
        return response()->json($employee, 201);
    }

    /**
     * Display the specified employee.
     */
    public function show(Employee $employee): JsonResponse
    {
        return response()->json($employee->load('company'));
    }

    /**
     * Update the specified employee.
     */
    public function update(Request $request, Employee $employee): JsonResponse
    {
        $validated = $request->validate([
            'company_id' => 'exists:companies,id',
            'emp_no' => 'string|unique:employees,emp_no,' . $employee->id,
            'name' => 'string|max:225',
            'title' => 'string',
            'department' => 'string',
            'email' => 'email|unique:employees,email,' . $employee->id,
            'phone' => 'nullable|string',
            'salary' => 'nullable|numeric',
            'status' => 'string',
            'avatar' => 'nullable|string',
        ]);

        $employee->update($validated);
        return response()->json($employee);
    }

    /**
     * Remove the specified employee.
     */
    public function destroy(Employee $employee): JsonResponse
    {
        $employee->delete();
        return response()->json(['message' => 'Employee deleted successfully']);
    }
}
