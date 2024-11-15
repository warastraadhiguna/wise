<?php

namespace App\Http\Controllers;

use App\Models\PurchaseDetail;
use Illuminate\Http\Request;

class OrderDetailController extends Controller
{
    public function destroy(string $id)
    {
        $purchaseDetail = PurchaseDetail::withTrashed()->findOrFail($id);
        $orderId = $purchaseDetail->purchase_id;
        $purchaseDetail->forceDelete();

        return redirect()->to("order/$orderId/edit");
    }

    public function update(Request $request, string $id)
    {
        $purchaseDetail = PurchaseDetail::withTrashed()->findOrFail($id);
        $orderId = $purchaseDetail->purchase_id;

        $data = $request->validate(
            [
                'order_quantity' => 'required|numeric',
            ],
            [
                'order_quantity.required' => 'Quantity wajib diisi.',
                'order_quantity.numeric' => 'Quantity wajib angka.',
            ]
        );

        $data['user_id'] = $request->user()->id;

        $purchaseDetail->update($data);

        return redirect()->to("order/$orderId/edit");
    }
}
