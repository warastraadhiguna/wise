<?php

use App\Http\Controllers\AuthorityController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\OrderDetailController;
use App\Http\Controllers\PriceCategoryController;
use App\Http\Controllers\ProductCategoryController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\ProductPriceRelationController;
use App\Http\Controllers\PurchaseController;
use App\Http\Controllers\PurchaseDetailController;
use App\Http\Controllers\StockController;
use App\Http\Controllers\SupplierController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\TransactionDetailController;
use App\Http\Controllers\UnitController;
use App\Http\Controllers\BrandController;
use App\Http\Controllers\CustomerController;
use Inertia\Inertia;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\StoreBranchController;

// Route::get('/', function () {
//     return Inertia::render('Welcome', [
//         'canLogin' => Route::has('login'),
//         'canRegister' => Route::has('register'),
//         'laravelVersion' => Application::VERSION,
//         'phpVersion' => PHP_VERSION,
//     ]);
// });


Route::get('/', [AuthenticatedSessionController::class, 'create']);


Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware(['auth', 'checkrole'])->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::resource('user', UserController::class);
    Route::resource('authority', AuthorityController::class);
    Route::resource('unit', UnitController::class);
    Route::resource('brand', BrandController::class);
    Route::resource('product-category', ProductCategoryController::class);
    Route::resource('price-category', PriceCategoryController::class);
    Route::resource('customer', CustomerController::class);
    Route::resource('supplier', SupplierController::class);
    Route::resource('store-branch', StoreBranchController::class);
    Route::resource('order', OrderController::class);
    Route::resource('purchase', PurchaseController::class);
    Route::resource('product', ProductController::class);
    Route::resource('stock', StockController::class);

    Route::resource('transaction', TransactionController::class);


    Route::resource('order-detail', OrderDetailController::class);
    Route::resource('purchase-detail', PurchaseDetailController::class);

    Route::resource('transaction-detail', TransactionDetailController::class);

    Route::resource('product-price-relation', ProductPriceRelationController::class);
});



require __DIR__.'/auth.php';