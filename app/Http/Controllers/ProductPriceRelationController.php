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

            $price = ProductPriceRelation::where([['product_id', $price['product_id']], ['price_category_id', $price['price_category_id']]])->first();

            if ($price) {
                $price->update($data);
            } else {
                ProductPriceRelation::create($data);
            }
        }

        return back()->with("success", 'Data berhasil disimpan');
    }
}
