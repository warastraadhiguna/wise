<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\ProductPriceRelation;

class ProductPriceRelationController extends Controller
{
    public function store(Request $request)
    {
        $prices = $request->input();

        foreach ($prices as $price) {
            $data = [
                    'user_id' => $request->user()->id,
                    'product_id' => $price['product_id'],
                    'price_category_id' => $price['price_category_id'],
                    'value' => $price['value'],
                    'is_default' => $price['is_default'],
            ];

            if (is_null($price['id'])) {
                // Jika `id` bernilai null, lakukan create
                ProductPriceRelation::create($data);
            } else {
                // Jika `id` ada, lakukan update
                ProductPriceRelation::where('id', $price['id'])->update($data);
            }
        }

        return back()->with("success", 'Data berhasil disimpan');
    }
}