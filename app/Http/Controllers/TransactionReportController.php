<?php

namespace App\Http\Controllers;

use App\Models\PaymentStatus;
use App\Models\Transaction;
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
            "title" => "Transaction Report",'transactions' => Transaction::select('transactions.*', 'name', 'company_name')
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
}
