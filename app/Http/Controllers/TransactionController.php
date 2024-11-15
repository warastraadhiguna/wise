<?php

namespace App\Http\Controllers;

use App\Models\PaymentStatus;
use App\Models\Stock;
use App\Models\TransactionDetail;
use App\Models\Customer;
use Carbon\Carbon;
use Inertia\Inertia;
use App\Models\Transaction;
use Illuminate\Http\Request;

class TransactionController extends Controller
{
    public function index()
    {
        session()->put('previousUrlTransaction', request()->fullUrl());
        $perPage = Request()->input("perPage");
        $perPage ??= 10;

        $searchingText = Request()->input("searchingText");
        $data = [
            'title' => 'Transaction List',
            'transactions' => Transaction::withTrashed()
            ->select('transactions.*', 'name', 'company_name')
            ->with('storeBranch', 'transactionUser', 'approvedUser')
            ->leftJoin('customers', 'transactions.customer_id', '=', 'customers.id')
            ->where(function ($query) {
                $query->whereRaw('IFNULL(customers.name, "") LIKE ?', ['%%'])
                    ->orWhereRaw('IFNULL(customers.company_name, "") LIKE ?', ['%%']);
            })
            ->whereNotNull('transactions.user_id')
            ->orderByRaw('CASE WHEN transactions.approve_transaction_date IS NULL THEN 0 ELSE 1 END asc')
            ->orderBy('transactions.deleted_at')
            ->orderBy('transaction_date', 'desc')
            ->paginate($perPage)
            ->appends([
                'perPage' => $perPage,
                'searchingText' => $searchingText,
            ]),
            'searchingTextProps' => $searchingText ?? "",
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
            $products = $searchingText ? Stock::getStock($searchingText, $perPage, $page, $transaction->store_branch_id) : null;
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
            'transactionDetails' => TransactionDetail::with('product', 'product.unit', 'product.priceRelations.priceCategory')->where('transaction_id', '=', $id)->orderBy('created_at', 'desc')->get(),
            'previousUrl' => session()->has('previousUrlTransaction') ? session('previousUrlTransaction') : "/transaction",
            'customers' => Customer::get(),
            'paymentStatuses' => PaymentStatus::orderBy('index')->get(),
            'products' => $products,
        ];

        return Inertia::render("Transaction/Form", $data);
    }

    public function update(Request $request, string $id)
    {
        $transaction = Transaction::withTrashed()->findOrFail($id);
        $approveParameter = Request()->input("approveParameter");
        if ($approveParameter) {
            $transaction->update([
                'approved_user_id' => $request->user()->id,
                'approve_transaction_date' => Carbon::now()
            ]);

            redirect()->to("transaction/$transaction->id/edit")->with("success", 'Data berhasil diapprove.');
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
                'transaction_note' => 'nullable',
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

        if ($transaction->deleted_at) {
            $transaction->forceDelete();
        } else {
            $transaction->delete();
        }

        return back()->with("success", 'Data berhasil dihapus' . ($transaction->deleted_at ? " SELAMANYA" : ""));
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
}
