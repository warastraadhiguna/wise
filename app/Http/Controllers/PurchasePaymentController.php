<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\PurchasePayment;
use Illuminate\Support\Facades\Validator;

class PurchasePaymentController extends Controller
{
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'purchase_id' => 'required',
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

        PurchasePayment::create($data);
        return back()->with("success", 'Data berhasil disimpan');
    }
    public function destroy(string $id)
    {
        $purchaseDetail = PurchasePayment::withTrashed()->findOrFail($id);
        if ($purchaseDetail->deleted_at) {
            $purchaseDetail->forceDelete();
        } else {
            $purchaseDetail->delete();
        }

        return back()->with("success", 'Data berhasil dihapus');

    }
}
