<?php

namespace App\Http\Controllers;

use App\Models\PaymentStatus;
use App\Models\Transaction;
use App\Models\TransactionDetail;
use Carbon\Carbon;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TransactionReportController extends Controller
{
    public function index()
    {
        $startDate = Request()->input("startDate") ?? Carbon::now()->format('Y-m-d');
        $endDate = Request()->input("endDate") ?? Carbon::now()->format('Y-m-d');

        $paymentMethod = Request()->input("paymentMethod") ?? "";
        $status = Request()->input("status") ?? "";

        $paymentStatus = Request()->input("paymentStatus") ?? "";

        $data = [
            "title" => "Transaction Report",
            'transactions' => Transaction::select('transactions.*', 'name', 'company_name')
            ->addSelect(DB::raw('(SELECT SUM(quantity * (price - discount - (price*discount_percent/100))) FROM transaction_details WHERE transaction_details.transaction_id = transactions.id) as total_amount'))
            ->with('storeBranch', 'transactionUser', 'approvedUser', 'customer', 'paymentStatus', 'transactionDetails', 'transactionDetails.product', 'transactionDetails.product.unit')
            ->addSelect(DB::raw('
                (
                    (SELECT SUM(quantity * (price - discount - (price * discount_percent / 100))) FROM transaction_details WHERE transaction_details.transaction_id = transactions.id)
                    - discount 
                    - (
                        (SELECT SUM(quantity * (price - discount - (price * discount_percent / 100))) FROM transaction_details WHERE transaction_details.transaction_id = transactions.id)
                        * discount_percent / 100
                    )
                ) as grand_total
            '))
            ->withSum('transactionPayments', 'amount')
            ->leftJoin('customers', 'transactions.customer_id', '=', 'customers.id')
            ->where(function ($query) {
                $query->whereRaw('IFNULL(customers.name, "") LIKE ?', ['%%'])
                    ->orWhereRaw('IFNULL(customers.company_name, "") LIKE ?', ['%%']);
            })
            ->whereNotNull('transactions.user_id')
            ->whereBetween('transaction_date', [$startDate, $endDate])
            ->when($paymentMethod, function ($query) use ($paymentMethod) {
                return $query->where('payment_status_id', $paymentMethod);
            })
            ->when(!empty($status), function ($query) use ($status) {
                return $status == "approved" ? $query->whereNotNull('approve_transaction_date') : $query->whereNull('approve_transaction_date');
            })
            ->when($paymentStatus, function ($query) use ($paymentStatus) {
                if ($paymentStatus == 'Paid') {
                    $query->havingRaw('grand_total = transaction_payments_sum_amount');
                } elseif ($paymentStatus == 'Unpaid') {
                    $query->havingRaw('grand_total > transaction_payments_sum_amount');
                }
            })
            ->orderByRaw('CASE WHEN transactions.approve_transaction_date IS NULL THEN 0 ELSE 1 END asc')
            ->orderBy('transactions.deleted_at')
            ->orderBy('transaction_date', 'desc')
            ->get(),
            'startDate' => $startDate,
            'endDate' => $endDate,
            'paymentMethod' => $paymentMethod,
            'status' => $status,
            'paymentStatus' => $paymentStatus,
            'paymentStatuses' => PaymentStatus::orderBy('index')->get(),
        ];

        return Inertia::render("Report/Transaction/List", $data);
    }

    public function product()
    {

        $startDate = Request()->input("startDate") ?? Carbon::now()->format('Y-m-d');
        $endDate = Request()->input("endDate") ?? Carbon::now()->format('Y-m-d');

        $paymentMethod = Request()->input("paymentMethod") ?? "";
        $status = Request()->input("status") ?? "";

        $paymentStatus = Request()->input("paymentStatus") ?? "";
        $category = Request()->input("category") ?? "";
        $searchingText = Request()->input("searchingText") ?? "";

        $soldProducts =
        $category == "" ?
        TransactionDetail::select(
            'product_id',
            DB::raw('SUM(quantity) as total_quantity')
        )
            ->with('product', 'product.unit')
            ->whereHas('transaction', function ($query) use ($startDate, $endDate, $paymentMethod, $status, $paymentStatus) {
                $query->whereBetween('transaction_date', [$startDate, $endDate])
                    ->whereNotNull('approve_transaction_date');
                if ($paymentMethod) {
                    $query->where('payment_status_id', $paymentMethod);
                }
                if (!empty($status)) {
                    $status == "approved"
                        ? $query->whereNotNull('approve_transaction_date')
                        : $query->whereNull('approve_transaction_date');
                }
                if ($paymentStatus) {
                    if ($paymentStatus == 'Paid') {
                        $query->havingRaw('grand_total = transaction_payments_sum_amount');
                    } elseif ($paymentStatus == 'Unpaid') {
                        $query->havingRaw('grand_total > transaction_payments_sum_amount');
                    }
                }
            })
            ->whereHas('product', function ($query) use ($searchingText) {
                $query->where('name', 'like', "%{$searchingText}%")
                    ->orWhere('code', 'like', "%{$searchingText}%");
            })
            ->groupBy('product_id')
            ->orderBy(DB::raw('SUM(quantity)'), 'desc')
            ->get() :
        TransactionDetail::select(
            'product_id',
            'quantity  as total_quantity',
            'transaction_id'
        )
            ->with('product', 'product.unit', 'transaction')
            ->whereHas('transaction', function ($query) use ($startDate, $endDate, $paymentMethod, $status, $paymentStatus) {
                $query->whereBetween('transaction_date', [$startDate, $endDate])
                    ->whereNotNull('approve_transaction_date');
                if ($paymentMethod) {
                    $query->where('payment_status_id', $paymentMethod);
                }
                if (!empty($status)) {
                    $status == "approved"
                        ? $query->whereNotNull('approve_transaction_date')
                        : $query->whereNull('approve_transaction_date');
                }
                if ($paymentStatus) {
                    if ($paymentStatus == 'Paid') {
                        $query->havingRaw('grand_total = transaction_payments_sum_amount');
                    } elseif ($paymentStatus == 'Unpaid') {
                        $query->havingRaw('grand_total > transaction_payments_sum_amount');
                    }
                }
            })
            ->whereHas('product', function ($query) use ($searchingText) {
                $query->where('name', 'like', "%{$searchingText}%")
                    ->orWhere('code', 'like', "%{$searchingText}%");
            })
            ->get();

        $data = [
            'title' => 'Product Transaction Report',
            'startDate' => $startDate,
            'endDate' => $endDate,
            'paymentMethod' => $paymentMethod,
            'status' => $status,
            'paymentStatus' => $paymentStatus,
            'paymentStatuses' => PaymentStatus::orderBy('index')->get(),
            'category' => $category,
            'searchingTextProps' => $searchingText ?? "",
            'soldProducts' => $soldProducts,
        ];
        return Inertia::render("Report/Transaction/Product", $data);
    }
}
