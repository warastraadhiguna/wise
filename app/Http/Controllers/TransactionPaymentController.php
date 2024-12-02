<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\TransactionPayment;
use Illuminate\Support\Facades\Validator;

class TransactionPaymentController extends Controller
{
    public function store(Request $request)
    {

        $validator = Validator::make($request->all(), [
            'transaction_id' => 'required',
            'unpaid' => 'required|numeric',
            'note' => 'nullable',
            'payment' => [
                'required',
                'numeric',
                'min:0',
                'lte:unpaid',
            ],
        ], [
            'payment.lte' => 'Payment harus kurang dari atau sama dengan kekurangan bayar.',
        ]);

        if ($validator->fails()) {
            return redirect()->back()
                ->withErrors($validator)
                ->withInput();
        }

        $data = $validator->validated();

        $data['amount'] = $data['payment'];
        $data['user_id'] = $request->user()->id;

        TransactionPayment::create($data);
        return back()->with("success", 'Data berhasil disimpan');
    }
    public function destroy(string $id)
    {
        $transactionDetail = TransactionPayment::withTrashed()->findOrFail($id);
        if ($transactionDetail->deleted_at) {
            $transactionDetail->forceDelete();
        } else {
            $transactionDetail->delete();
        }


        return back()->with("success", 'Data berhasil dihapus');

    }
}
