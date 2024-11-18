<?php

namespace App\Http\Controllers;

use App\Models\PaymentStatus;
use App\Models\Purchase;
use Carbon\Carbon;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PurchaseReportController extends Controller
{
    public function index()
    {
        $startDate = Request()->input("startDate") ?? Carbon::now()->format('Y-m-d');
        $endDate = Request()->input("endDate") ?? Carbon::now()->format('Y-m-d');

        $paymentMethod = Request()->input("paymentMethod") ?? "";
        $status = Request()->input("status") ?? "";

        $data = [
            "title" => "Purchase Report",
            'purchases' => Purchase::select('purchases.*', 'name', 'company_name')
            ->addSelect(DB::raw('(SELECT SUM(quantity * (price - discount - (price*discount_percent/100))) FROM purchase_details WHERE purchase_details.purchase_id = purchases.id) as total_amount'))
            ->with('orderUser', 'approvedOrderUser', 'storeBranch', 'purchaseUser', 'approvedUser', 'purchaseDetails', 'purchaseDetails.product', 'purchaseDetails.product.unit', 'supplier', 'paymentStatus')
            ->withSum('purchasePayment', 'amount')
            ->leftJoin('suppliers', 'purchases.supplier_id', '=', 'suppliers.id')
            ->where(function ($query) {
                $query->whereRaw('IFNULL(suppliers.name, "") LIKE ?', ['%%'])
                    ->orWhereRaw('IFNULL(suppliers.company_name, "") LIKE ?', ['%%']);
            })
            ->whereNotNull('purchases.user_id')
            ->whereNotNull('purchases.supplier_id')
            ->whereBetween('purchase_date', [$startDate, $endDate])
            ->when($paymentMethod, function ($query) use ($paymentMethod) {
                return $query->where('payment_status_id', $paymentMethod);
            })
            ->when(!empty($status), function ($query) use ($status) {
                return $status == "approved" ? $query->whereNotNull('approve_purchase_date') : $query->whereNull('approve_purchase_date');
            })
            ->orderByRaw('CASE WHEN purchases.approve_purchase_date IS NULL THEN 0 ELSE 1 END asc')
            ->orderBy('purchases.purchase_date', 'desc')
            ->orderBy('purchases.approve_order_date')
            ->orderBy('purchases.deleted_at')
            ->orderBy('order_date', 'desc')
            ->get(),
            'startDate' => $startDate,
            'endDate' => $endDate,
            'paymentMethod' => $paymentMethod,
            'status' => $status,
            'paymentStatuses' => PaymentStatus::orderBy('index')->get(),
        ];

        return Inertia::render("Report/Purchase/Index", $data);
    }
}
