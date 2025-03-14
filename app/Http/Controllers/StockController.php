<?php

namespace App\Http\Controllers;

use App\Models\PriceCategory;
use App\Models\ProductPriceRelation;
use App\Models\Stock;
use Inertia\Inertia;

class StockController extends Controller
{
    public function index()
    {
        $perPage = Request()->input("perPage", 10);
        $searchingText = Request()->input("searchingText", "");
        $searchingText ??= "";
        $page = Request()->input('page', 1);

        $stocks = Stock::getStock($searchingText, session('selectedStoreBranchId'), $perPage, $page);
        $selectedProductId = Request()->input('selectedProductId');

        $selectedStock = Stock::getStockInfo($selectedProductId);
        $showInfoProps = false;
        if (session('perPage') != $perPage || session('searchingText') != $searchingText || session('page') != $page) {
            session()->put('perPage', $perPage);
            session()->put('searchingText', $searchingText);
            session()->put('page', $page);
            $showInfoProps = false;

            //this procedure made, because i used url to open the pop up. the problem happened when using pagination, make pop up alway open
        } else {
            $showInfoProps = true;
        }

        $data = [
            'title' => 'Stock List',
            'stocks' => $stocks,
            'searchingTextProps' => $searchingText,
            'perPageProps' => $perPage,
            'pageProps' => $page,
            'selectedStock' => $selectedStock,
            'priceCategories' => PriceCategory::get(),
            'showInfoProps' => $showInfoProps
        ];

        return Inertia::render("Stock/Index", $data);
    }

}
