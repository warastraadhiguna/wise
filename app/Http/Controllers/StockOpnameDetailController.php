<?php

namespace App\Http\Controllers;

use App\Models\StockOpnameDetail;
use Illuminate\Http\Request;

class StockOpnameDetailController extends Controller
{
    public function destroy(string $id)
    {
        $stockOpnameDetail = StockOpnameDetail::withTrashed()->findOrFail($id);
        $stockOpnameId = $stockOpnameDetail->stock_opname_id;

        if ($stockOpnameDetail->order_quantity == null) {
            $stockOpnameDetail->forceDelete();
        } else {
            $stockOpnameDetail->quantity = null;
            $stockOpnameDetail->save();
        }

        return redirect()->to("stock-opname/$stockOpnameId/edit");
    }

    public function update(Request $request, string $id)
    {
        $stockOpnameDetail = StockOpnameDetail::withTrashed()->findOrFail($id);
        $stockOpnameId = $stockOpnameDetail->stock_opname_id;
        $data = $request->validate(
            [
                'real_quantity' => 'required|numeric',
                'price' => 'required|numeric',
            ]
        );

        $data['user_id'] = $request->user()->id;
        $data['quantity'] = $request->input("real_quantity") - $request->input("last_quantity");

        $stockOpnameDetail->update($data);

        return redirect()->to("stock-opname/$stockOpnameId/edit");
    }
}
