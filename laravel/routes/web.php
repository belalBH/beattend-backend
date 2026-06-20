<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
*/

// Serve the Single Page Application React entry layout
Route::get('{any}', function () {
    return view('app');
})->where('any', '.*');
