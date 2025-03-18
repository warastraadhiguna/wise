<?php

namespace App\Http\Controllers;

use Exception;
use Carbon\Carbon;
use Inertia\Inertia;
use App\Models\Stock;
use App\Models\StockOpname;
use Illuminate\Http\Request;
use App\Models\PaymentStatus;
use App\Models\StockOpnameDetail;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class StockOpnameController extends Controller
{
    public function index()
    {
        session()->put('previousUrlStockOpname', request()->fullUrl());
        $perPage = Request()->input("perPage");
        $perPage ??= 10;

        $searchingText = Request()->input("searchingText");
        $startDate = Request()->input("startDate") ?? Carbon::now()->format('Y-m-d');
        $endDate = Request()->input("endDate") ?? Carbon::now()->format('Y-m-d');

        $paymentMethod = Request()->input("paymentMethod") ?? "";
        $paymentStatus = Request()->input("paymentStatus") ?? "";

        $status = Request()->input("status") ?? "";
        $data = [
            'title' => 'Stock Opname List',
            'stockOpnames' => StockOpname::withTrashed()
            ->select('stock_opnames.*')
            ->with('storeBranch', 'user', 'approvedUser', 'stockOpnameDetails', 'stockOpnameDetails.product', 'stockOpnameDetails.product.unit')
            ->whereNotNull('stock_opnames.user_id')
            ->whereBetween('stock_opname_date', [$startDate, $endDate])
            ->when(!empty($status), function ($query) use ($status) {
                return $status == "approved" ? $query->whereNotNull('approve_stock_opname_date') : $query->whereNull('approve_stock_opname_date');
            })
            ->when($paymentStatus, function ($query) use ($paymentStatus) {
                if ($paymentStatus == 'Paid') {
                    $query->havingRaw('grand_total = stock_opname_payments_sum_amount');
                } elseif ($paymentStatus == 'Unpaid') {
                    $query->havingRaw('grand_total > stock_opname_payments_sum_amount');
                }
            })
            ->orderByRaw('CASE WHEN stock_opnames.approve_stock_opname_date IS NULL THEN 0 ELSE 1 END asc')
            ->orderBy('stock_opnames.stock_opname_date', 'desc')
            ->orderBy('stock_opnames.deleted_at')
            ->paginate($perPage)
            ->appends([
                'perPage' => $perPage,
                'searchingText' => $searchingText,
                'startDate' => $startDate,
                'endDate' => $endDate,
                'paymentMethod' => $paymentMethod,
                'status' => $status,
                'paymentStatus' => $paymentStatus,
            ]),
            'searchingTextProps' => $searchingText ?? "",
            'startDate' => $startDate,
            'endDate' => $endDate,
            'status' => $status,
        ];

        return Inertia::render("StockOpname/Index", $data);
    }

    public function create(Request $request)
    {
        $newStockOpname = StockOpname::create([
            'user_id' => $request->user()->id,
            'number'  =>  $this->generateStockOpnameNumber(),
            'stock_opname_date' => Carbon::now(),
            'store_branch_id' => session('selectedStoreBranchId')
        ]);

        return redirect()->route('stock-opname.edit', $newStockOpname->id);
    }

    public function edit(Request $request, string $id)
    {
        $searchingText = Request()->input("searchingText") ?? "";
        $addDetail = Request()->input("addDetail");
        $multiplier = Request()->input("multiplier");
        $perPage = Request()->input("perPage", 10);
        $page = Request()->input('page', 1);

        $stockOpname = StockOpname::withTrashed()
        ->with(['stockOpnameDetails' => function ($query) {
            $query->orderBy('updated_at', 'desc');
        }, 'stockOpnameDetails.product', 'user', 'approvedUser'])
            ->find($id);

        $stockOpnameDetail = $stockOpname->stockOpnameDetails->firstWhere(function ($stockOpnameDetail) use ($searchingText) {
            return $stockOpnameDetail->product &&
                $stockOpnameDetail->product->code === $searchingText &&
                is_null($stockOpnameDetail->quantity);
        });

        $products = null;
        if (!$stockOpnameDetail) {
            $products = $searchingText ? Stock::getStock($searchingText, $stockOpname->store_branch_id, $perPage, $page) : null;
            if ($products && $products->total() == 1 &&  $addDetail) {
                $detail = $stockOpname->stockOpnameDetails->firstWhere('product_id', $products[0]->id);

                if ($detail) {
                    $detail->quantity += 1;
                    $detail->save();
                } else {
                    $averagePrice = Stock::getStockInfo($products[0]->id)['average_price'];
                    $this->addDetail($request, $id, $products[0]->id, $averagePrice, $products[0]->quantity);
                    // $products[0]->last_price
                }

                return redirect()->to("stock-opname/$id/edit");
            } elseif ($multiplier && $stockOpname->stockOpnameDetails) {
                $detail = $stockOpname->stockOpnameDetails[0];
                $detail->quantity *= intval($multiplier);

                $detail->save();
            } elseif ($products && $products->total() == 0) {
                return redirect()->to("stock-opname/$id/edit")->with("error", "Product tidak ditemukan");
            }
        } else {
            $stockOpnameDetail->quantity = 1;
            $stockOpnameDetail->price ??= 0;
            $stockOpnameDetail->save();
        }

        $data = [
            'title' => 'Edit StockOpname',
            'stockOpname' => $stockOpname,
            'stockOpnameDetails' => StockOpnameDetail::with('product', 'product.unit')->where('stock_opname_id', '=', $id)->orderBy('created_at', 'desc')->get(),
            'previousUrl' => session()->has('previousUrlStockOpname') ? session('previousUrlStockOpname') : "/stock-opname",
            'products' => $products,
        ];

        return Inertia::render("StockOpname/Form", $data);
    }

    public function update(Request $request, string $id)
    {
        $stockOpname = StockOpname::withTrashed()->findOrFail($id);


        if ($stockOpname->deleted_at) {
            $stockOpname->restore();

            return back()->with("success", 'Data berhasil dipulihkan');
        }

        $approveParameter = Request()->input("approveParameter");
        if ($approveParameter) {
            $data['approved_user_id'] = $request->user()->id;
            $data['approve_stock_opname_date'] =  Carbon::now();
            $stockOpname->update($data);
            redirect()->to("stock-opname/$stockOpname->id/edit")->with("success", 'Data berhasil diapprove.');
        } else {
            $data = $request->validate(
                [
                    'number'  => 'required',
                    'stock_opname_date' => 'required',
                    'note' => 'nullable',
                ],
                [
                    'number.required' => 'Nomor StockOpname wajib diisi',
                ]
            );

            $data['user_id'] = $request->user()->id;

            $stockOpname->update($data);

            return back()->with("success", 'Data berhasil diubah');
        }
    }

    public function destroy(string $id)
    {
        $stockOpname = StockOpname::withTrashed()->findOrFail($id);
        $deletedAt = $stockOpname->deleted_at;
        if ($stockOpname->deleted_at) {
            $stockOpname->forceDelete();
        } else {
            $stockOpname->delete();
        }

        return back()->with("success", 'Data berhasil dihapus' . ($deletedAt ? " SELAMANYA" : ""));
    }

    private function generateStockOpnameNumber()
    {
        $year = Carbon::now()->format('Y');
        $month = Carbon::now()->format('m');

        $lastStockOpname = StockOpname::whereYear('stock_opname_date', $year)
                        ->whereMonth('stock_opname_date', $month)
                        ->orderBy('id', 'desc')
                        ->first();

        if ($lastStockOpname) {
            $lastStockOpnameNumber = explode('/', $lastStockOpname->number);
            $lastStockOpnameSequence = (int) end($lastStockOpnameNumber);
            $newStockOpnameSequence = $lastStockOpnameSequence + 1;
        } else {
            $newStockOpnameSequence = 1;
        }

        $newStockOpnameNumber = 'SO/' . $year . '/' . $month . '/' . $newStockOpnameSequence;

        return $newStockOpnameNumber;
    }

    private function addDetail(Request $request, $id, $productsId, $lastPrice, $lastQuantity)
    {
        StockOpnameDetail::create([
            'stock_opname_id' => $id,
            'product_id' => $productsId,
            'user_id' => $request->user()->id,
            'quantity' => 1,
            'last_quantity' => $lastQuantity,
            'price' => $lastPrice,
        ]);
    }
}
