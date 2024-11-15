<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\PurchaseDetail;
use App\Models\Supplier;
use Carbon\Carbon;
use Inertia\Inertia;
use App\Models\Purchase;
use Illuminate\Http\Request;

class PurchaseDetailController extends Controller
{
    public function destroy(string $id)
    {
        $purchaseDetail = PurchaseDetail::withTrashed()->findOrFail($id);
        $purchaseId = $purchaseDetail->purchase_id;

        if ($purchaseDetail->order_quantity == null) {
            $purchaseDetail->forceDelete();
        } else {
            $purchaseDetail->quantity = null;
            $purchaseDetail->save();
        }

        return redirect()->to("purchase/$purchaseId/edit");
    }

    public function update(Request $request, string $id)
    {
        $purchaseDetail = PurchaseDetail::withTrashed()->findOrFail($id);
        $purchaseId = $purchaseDetail->purchase_id;

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

        $purchaseDetail->update($data);

        return redirect()->to("purchase/$purchaseId/edit");
    }
}
