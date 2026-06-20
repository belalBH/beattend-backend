<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Company extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'logo',
        'industry',
        'status',
        'cr_number',
        'expiry_date',
    ];

    /**
     * Relationship with Employees.
     */
    public function employees(): HasMany
    {
        return $this->hasMany(Employee::class);
    }
}
