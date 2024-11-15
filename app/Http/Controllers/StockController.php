<?php

namespace App\Http\Controllers;

use App\Models\Brand;
use App\Models\Stock;
use App\Models\Unit;
use Inertia\Inertia;
use Illuminate\Http\Request;

class StockController extends Controller
{
    public function index()
    {
        $perPage = Request()->input("perPage", 10);
        $searchingText = Request()->input("searchingText", "");
        $searchingText ??= "";
        $page = Request()->input('page', 1);

        $stocks = Stock::getStock($searchingText, $perPage, $page);
        $selectedProductId = Request()->input('selectedProductId', $stocks && sizeOf($stocks->items()) > 0 ? $stocks->items()[0]->id : '');

        $selectedStock = Stock::getStockInfo($selectedProductId);

        $data = [
            'title' => 'Stock List',
            'stocks' => $stocks,
            'searchingTextProps' => $searchingText,
            'perPageProps' => $perPage,
            'pageProps' => $page,
            'selectedStock' => $selectedStock
        ];

        return Inertia::render("Stock/Index", $data);
    }

}
