<?php

use App\Http\Controllers\DistributionDetailController;
use App\Http\Controllers\DistributionReceiptController;
use App\Http\Controllers\MutationController;
use App\Http\Controllers\MutationDetailController;
use App\Http\Controllers\MutationReceiptController;
use App\Http\Controllers\StockOpnameController;
use App\Models\StoreBranch;
use Inertia\Inertia;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UnitController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\BrandController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\StockController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\PurchaseController;
use App\Http\Controllers\SupplierController;
use App\Http\Controllers\AuthorityController;
use App\Http\Controllers\OrderDetailController;
use App\Http\Controllers\StoreBranchController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\PriceCategoryController;
use App\Http\Controllers\PurchaseDetailController;
use App\Http\Controllers\PurchaseReportController;
use App\Http\Controllers\ProductCategoryController;
use App\Http\Controllers\TransactionDetailController;
use App\Http\Controllers\TransactionReportController;
use App\Http\Controllers\TransactionPaymentController;
use App\Http\Controllers\ProductPriceRelationController;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DistributionController;
use App\Http\Controllers\PurchaseDetailReturnController;
use App\Http\Controllers\PurchasePaymentController;
use App\Http\Controllers\StockOpnameDetailController;
use App\Http\Controllers\TransactionDetailReturnController;

// Route::get('/', function () {
//     return Inertia::render('Welcome', [
//         'canLogin' => Route::has('login'),
//         'canRegister' => Route::has('register'),
//         'laravelVersion' => Application::VERSION,
//         'phpVersion' => PHP_VERSION,
//     ]);
// });


Route::get('/', [AuthenticatedSessionController::class, 'create']);


Route::get('/dashboard', [DashboardController::class, 'index'])->middleware(['auth', 'verified'])->name('dashboard');

Route::put('/dashboard', [DashboardController::class, 'update'])->middleware(['auth', 'verified'])->name('dashboard.update');


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

    Route::resource('stock-opname', StockOpnameController::class);

    Route::resource('product', ProductController::class);
    Route::resource('stock', StockController::class);

    Route::resource('transaction', TransactionController::class);
    Route::get('/transaction/{id}/print', [TransactionController::class, 'print'])->name('transaction.print');
    Route::get('/transaction/{id}/print-receipt', [TransactionController::class, 'printReceipt'])->name('transaction.print-receipt');

    Route::resource('order-detail', OrderDetailController::class);
    Route::resource('purchase-detail', PurchaseDetailController::class);

    Route::resource('stock-opname-detail', StockOpnameDetailController::class);

    Route::resource('transaction-detail', TransactionDetailController::class);

    Route::resource('transaction-payment', TransactionPaymentController::class);

    Route::resource('purchase-payment', PurchasePaymentController::class);

    Route::resource('distribution', DistributionController::class);

    Route::resource('distribution-receipt', DistributionReceiptController::class);

    Route::resource('distribution-detail', DistributionDetailController::class);

    Route::resource('mutation-receipt', MutationReceiptController::class);

    Route::resource('mutation-detail', MutationDetailController::class);

    Route::resource('mutation', MutationController::class);

    Route::resource('purchase-detail-return', PurchaseDetailReturnController::class);
    Route::resource('transaction-detail-return', TransactionDetailReturnController::class);
    Route::resource('product-price-relation', ProductPriceRelationController::class);

    Route::get('/purchase-report', [PurchaseReportController::class, 'index']);
    Route::get('/transaction-report', [TransactionReportController::class, 'index']);

});



require __DIR__.'/auth.php';
