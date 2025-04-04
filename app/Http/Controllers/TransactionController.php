<?php

namespace App\Http\Controllers;

use Exception;
use Carbon\Carbon;
use Inertia\Inertia;
use App\Models\Stock;
use App\Models\Customer;
use App\Models\Transaction;
use Illuminate\Http\Request;
use App\Models\PaymentStatus;
use Illuminate\Validation\Rule;
use App\Models\TransactionDetail;
use App\Models\TransactionPayment;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class TransactionController extends Controller
{
    public function index()
    {
        session()->put('previousUrlTransaction', request()->fullUrl());
        $perPage = Request()->input("perPage");
        $perPage ??= 10;

        $searchingText = Request()->input("searchingText");

        $startDate = Request()->input("startDate") ?? Carbon::now()->format('Y-m-d');
        $endDate = Request()->input("endDate") ?? Carbon::now()->format('Y-m-d');

        $paymentMethod = Request()->input("paymentMethod") ?? "";
        $paymentStatus = Request()->input("paymentStatus") ?? "";

        $status = Request()->input("status") ?? "";

        $data = [
            'title' => 'Transaction List',
            'transactions' => Transaction::withTrashed()
            ->select('transactions.*', 'name', 'company_name')
            ->addSelect(DB::raw('(SELECT SUM(quantity * (price - discount - (price*discount_percent/100))) FROM transaction_details WHERE transaction_details.transaction_id = transactions.id) as total_amount'))
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
            ->addSelect(DB::raw('(
                SELECT SUM(tdr.quantity * (
                    (
                        (td.price * (1 - IFNULL(td.discount_percent, 0) / 100)) - IFNULL(td.discount, 0)
                    ) 
                    * (1 - IFNULL(t.discount_percent, 0) / 100) - IFNULL(t.discount, 0)
                ) )
                FROM transaction_detail_returns tdr
                JOIN transaction_details td ON tdr.transaction_detail_id = td.id
                JOIN transactions t ON td.transaction_id = t.id
                WHERE td.transaction_id = transactions.id
            ) AS total_return_amount'))
            ->with('storeBranch', 'transactionUser', 'approvedUser', 'customer', 'paymentStatus', 'transactionPayments', 'transactionPayments.user')
            ->withSum('transactionPayments', 'amount')
            ->leftJoin('customers', 'transactions.customer_id', '=', 'customers.id')
            ->where(function ($query) use ($searchingText) {
                $query->whereRaw('IFNULL(customers.name, "") LIKE ?', ["%$searchingText%"])
                    ->orWhereRaw('IFNULL(customers.company_name, "") LIKE ?', ["%$searchingText%"]);
            })
            ->where('store_branch_id', session('selectedStoreBranchId'))
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
            ->orderBy('created_at', 'desc')
            ->paginate($perPage)
            ->appends([
                'perPage' => $perPage,
                'searchingText' => $searchingText,
                'startDate' => $startDate,
                'endDate' => $endDate,
                'paymentMethod' => $paymentMethod,
                'status' => $status,
                'paymentStatus' => $paymentStatus,
            ]),
            'searchingTextProps' => $searchingText ?? "",
            'startDate' => $startDate,
            'endDate' => $endDate,
            'paymentMethod' => $paymentMethod,
            'status' => $status,
            'paymentStatus' => $paymentStatus,
            'paymentStatuses' => PaymentStatus::where("is_sale", "1")->orderBy('index')->get(),
        ];

        return Inertia::render("Transaction/Index", $data);
    }

    public function create(Request $request)
    {
        $newTransaction = Transaction::create([
            'user_id' => $request->user()->id,
            'number'  => $this->generateTransactionNumber(),
            'transaction_date' => Carbon::now(),
            'payment_status_id' => 1,
            'store_branch_id' => session('selectedStoreBranchId')
        ]);

        return redirect()->route('transaction.edit', $newTransaction->id);
    }

    public function edit(Request $request, string $id)
    {
        $searchingText = Request()->input("searchingText") ?? "";
        $addDetail = Request()->input("addDetail");
        $multiplier = Request()->input("multiplier");
        $perPage = Request()->input("perPage", 10);
        $page = Request()->input('page', 1);

        $transaction = Transaction::withTrashed()
        ->with(['transactionDetails' => function ($query) {
            $query->orderBy('updated_at', 'desc');
        }, 'transactionDetails.product', 'transactionUser', 'approvedUser'])
            ->find($id);

        if ($transaction->store_branch_id <> session('selectedStoreBranchId')) {
            return redirect()->to("transaction")->with("error", 'Nota hanya bisa diedit, oleh toko dimana nota dibuat!!');
        }

        if (!$transaction->number) {
            $transaction->update([
                'user_id' => $request->user()->id,
                'number'  => $this->generateTransactionNumber(),
                'transaction_date' => Carbon::now(),
                'payment_status_id' => 1,
            ]);
        }

        $transactionDetail = $transaction->transactionDetails->firstWhere(function ($transactionDetail) use ($searchingText) {
            return $transactionDetail->product &&
                $transactionDetail->product->code === $searchingText &&
                is_null($transactionDetail->quantity);
        });

        $products = null;
        if (!$transactionDetail) {
            $products = $searchingText ? Stock::getStock($searchingText, $transaction->store_branch_id, $perPage, $page) : null;
            if ($products && $products->total() == 1 &&  $addDetail) {
                $detail = $transaction->transactionDetails->firstWhere('product_id', $products[0]->id);

                if ($detail) {
                    $detail->quantity += 1;
                    $detail->save();
                } else {
                    $this->addDetail($request, $id, $products[0]->id, $products[0]->price);
                }

                return redirect()->to("transaction/$id/edit");
            } elseif ($multiplier && $transaction->transactionDetails) {
                $detail = $transaction->transactionDetails[0];
                $detail->quantity *= intval($multiplier);

                $detail->save();
            } elseif ($products && $products->total() == 0) {
                return redirect()->to("transaction/$id/edit")->with("error", "Product tidak ditemukan");
            }
        } else {
            $transactionDetail->quantity = $transactionDetail->order_quantity;
            $transactionDetail->price ??= 0;
            $transactionDetail->discount_percent = 0;
            $transactionDetail->discount = 0;
            $transactionDetail->save();
        }

        $data = [
            'title' => 'Edit Transaction',
            'transaction' => $transaction,
            'transactionDetails' => TransactionDetail::with('product', 'product.unit', 'product.priceRelations.priceCategory', 'transactionDetailReturns', 'transactionDetailReturns.user')->withSum('transactionDetailReturns', 'quantity')->where('transaction_id', '=', $id)->orderBy('created_at', 'desc')->get(),
            'previousUrl' => session()->has('previousUrlTransaction') ? session('previousUrlTransaction') : "/transaction",
            'customers' => Customer::get(),
            'paymentStatuses' => PaymentStatus::orderBy('index')->get(),
            'products' => $products,
        ];

        return Inertia::render("Transaction/Form", $data);
    }

    public function update(Request $request, string $id)
    {
        $transaction = Transaction::withTrashed()->with('transactionDetails', 'transactionDetails.product')->findOrFail($id);
        $approveParameter = Request()->input("approveParameter");
        if ($approveParameter) {
            $errorMessage = Stock::checkSufficientStock($transaction->store_branch_id, $transaction->transactionDetails);
            if ($errorMessage) {
                return redirect()->to("transaction/$transaction->id/edit")->with("error", $errorMessage);
            }

            $paymentStatus = PaymentStatus::find(Request()->input("payment_status_id"));

            $request->merge([
                'payment' => (float) $request->input('payment'),
                'grandTotal' => (float) $request->input('grandTotal'),
            ]);

            $validator = Validator::make($request->all(), [
                'customer_id' => 'nullable',
                'payment_status_id' => 'required',
                'transaction_date' => 'required',
                'discount_percent' => 'required|numeric|max:90',
                'ppn' => 'required|numeric|max:50',
                'grandTotal' => 'required|numeric',
                'payment' => [
                    'required',
                    'numeric',
                    'min:0',
                    Rule::when($paymentStatus && $paymentStatus->is_done == 1, 'gte:grandTotal'),
                    Rule::when($paymentStatus && $paymentStatus->is_done == 0, 'lt:grandTotal'),
                ],
                'discount' => [
                    'required',
                    'numeric',
                    'min:0',
                    'lt:grandTotal', // Pastikan discount tidak melebihi grandTotal
                ],
            ], [
                'discount_percent.max' => 'Discount percent tidak boleh lebih dari :max%.',
                'payment.gte' => 'Jika metode yang dipilih langsung lunas, maka payment harus sama atau lebih dari Grand Total.',
                'payment.lt' => 'Jika metode yang dipilih tidak langsung lunas, maka payment harus kurang dari Grand Total.',
                'discount.lt' => 'Discount harus kurang dari Grand Total.',
            ]);

            if ($validator->fails()) {
                return redirect()->back()
                    ->withErrors($validator)
                    ->withInput();
            }

            $data = $validator->validated();
            $data['approved_user_id'] = $request->user()->id;
            $data['approve_transaction_date'] =  Carbon::now();

            try {

                DB::beginTransaction();

                $transaction->update($data);

                TransactionPayment::create([
                    'transaction_id' => $transaction->id,
                    'user_id' => $request->user()->id,
                    'amount' => $paymentStatus && $paymentStatus->is_done == 1 ? $data['grandTotal'] : $data['payment'],
                    'payment' => $data['payment'],
                    'note' => "",
                ]);

                DB::commit();

                return redirect()->to("transaction/$transaction->id/edit")->with("success", 'Data berhasil diapprove.');
            } catch (Exception $e) {
                DB::rollback();
                return redirect()->to("transaction/$transaction->id/edit")->with("error", 'Data gagal diapprove.');
            }

        }

        if ($transaction->deleted_at) {
            $transaction->restore();

            return back()->with("success", 'Data berhasil dipulihkan');
        }

        $data = $request->validate(
            [
                'customer_id' => 'nullable',
                'number'  => 'required',
                'transaction_date' => 'required',
                'note' => 'nullable',
                'payment_status_id' => 'required',
                'discount'  => 'required|numeric',
                'discount_percent' => 'required|numeric|max:90',
                'ppn'   => 'required|numeric|max:50',
            ]
        );

        $data['user_id'] = $request->user()->id;

        $transaction->update($data);

        return back()->with("success", 'Data berhasil diubah');
    }

    public function destroy(string $id)
    {
        $transaction = Transaction::withTrashed()->findOrFail($id);
        $deletedAt = $transaction->deleted_at;
        if ($transaction->deleted_at) {
            $transaction->forceDelete();
        } else {
            $transaction->delete();
        }

        return back()->with("success", 'Data berhasil dihapus' . ($deletedAt ? " SELAMANYA" : ""));
    }

    private function generateTransactionNumber()
    {
        $year = Carbon::now()->format('Y');
        $month = Carbon::now()->format('m');

        $lastTransaction = Transaction::whereYear('transaction_date', $year)
                        ->whereMonth('transaction_date', $month)
                        ->orderBy('id', 'desc')
                        ->first();

        if ($lastTransaction) {
            $lastTransactionNumber = explode('/', $lastTransaction->number);
            $lastTransactionSequence = (int) end($lastTransactionNumber);
            $newTransactionSequence = $lastTransactionSequence + 1;
        } else {
            $newTransactionSequence = 1;
        }

        $newTransactionNumber = 'S/' . $year . '/' . $month . '/' . $newTransactionSequence;

        return $newTransactionNumber;
    }

    private function addDetail(Request $request, $id, $productsId, $price)
    {
        TransactionDetail::create([
            'transaction_id' => $id,
            'product_id' => $productsId,
            'user_id' => $request->user()->id,
            'quantity' => 1,
            'price' => $price,
            'discount_percent' => 0,
            'discount' => 0,
        ]);
    }

    public function print($id)
    {
        $transaction = Transaction::with(['transactionDetails','transactionDetails.product','transactionDetails.product.unit',  'storeBranch', 'transactionUser', 'approvedUser', 'customer', 'paymentStatus', 'transactionPayments', 'transactionPayments.user'])->findOrFail($id);
        // dd($transaction->transactionPayments);
        return Inertia::render('Transaction/Invoice', [
            'transaction' => $transaction,
            'details'     => $transaction->transactionDetails,
        ]);
    }

    public function printReceipt($id)
    {
        $transaction = Transaction::with(['transactionDetails','transactionDetails.product','transactionDetails.product.unit',  'storeBranch', 'transactionUser', 'approvedUser', 'customer', 'paymentStatus', 'transactionPayments', 'transactionPayments.user'])->findOrFail($id);

        return Inertia::render('Transaction/Receipt', [
            'transaction' => $transaction,
            'details'     => $transaction->transactionDetails,
        ]);
    }
}
