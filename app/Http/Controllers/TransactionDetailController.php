<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\TransactionDetail;
use App\Models\Supplier;
use Carbon\Carbon;
use Inertia\Inertia;
use App\Models\Transaction;
use Illuminate\Http\Request;

class TransactionDetailController extends Controller
{
    public function destroy(string $id)
    {
        $transactionDetail = TransactionDetail::withTrashed()->findOrFail($id);
        $transactionId = $transactionDetail->transaction_id;

        if ($transactionDetail->order_quantity == null) {
            $transactionDetail->forceDelete();
        } else {
            $transactionDetail->quantity = null;
            $transactionDetail->save();
        }

        return redirect()->to("transaction/$transactionId/edit");
    }

    public function update(Request $request, string $id)
    {
        $transactionDetail = TransactionDetail::withTrashed()->findOrFail($id);
        $transactionId = $transactionDetail->transaction_id;

        $data = $request->validate(
            [
                'quantity' => 'required|numeric',
                'price' => 'required|numeric',
                'discount_percent' => 'required|numeric|max:90',
                'discount' => ['required', 'numeric', function ($attribute, $value, $fail) use ($request) {
                    if ($value >= $request->price) {
                        $fail('The discount must be less than the price.');
                    }
                }],
            ]
        );

        $data['user_id'] = $request->user()->id;

        $transactionDetail->update($data);

        return redirect()->to("transaction/$transactionId/edit");
    }
}