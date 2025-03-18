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
                'quantity' => 'required|numeric',
                'price' => 'required|numeric',
            ]
        );

        $data['user_id'] = $request->user()->id;

        $stockOpnameDetail->update($data);

        return redirect()->to("stock-opname/$stockOpnameId/edit");
    }
}
