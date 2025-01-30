<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\PurchaseDetailReturn;
use Illuminate\Support\Facades\Validator;

class PurchaseDetailReturnController extends Controller
{
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'purchase_detail_id' => 'required',
            'rest' => 'required|numeric',
            'note' => 'nullable',
            'quantity' => [
                'required',
                'numeric',
                'min:1',
                'lte:rest',
            ],
        ], [
            'quantity.lte' => 'Jumlah harus kurang dari atau sama dengan sisa barang.',
            'quantity.min' => 'Jumlah minilai 1.',
        ]);

        if ($validator->fails()) {
            return redirect()->back()
                ->withErrors($validator)
                ->withInput();
        }
        $data = $validator->validated();

        $data['user_id'] = $request->user()->id;

        PurchaseDetailReturn::create($data);
        return back()->with("success", 'Data berhasil disimpan');
    }
    public function destroy(string $id)
    {
        $purchaseDetail = PurchaseDetailReturn::findOrFail($id);
        $purchaseDetail->delete();

        return back()->with("success", 'Data berhasil dihapus');

    }
}
