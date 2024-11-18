<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use Inertia\Inertia;
use App\Models\Stock;
use App\Models\Purchase;
use App\Models\Supplier;
use Illuminate\Http\Request;
use App\Models\PurchaseDetail;

class OrderController extends Controller
{
    public function index()
    {
        session()->put('previousUrlOrder', request()->fullUrl());
        $perPage = Request()->input("perPage");
        $perPage ??= 10;

        $searchingText = Request()->input("searchingText");
        $startDate = Request()->input("startDate") ?? Carbon::now()->format('Y-m-d');
        $endDate = Request()->input("endDate") ?? Carbon::now()->format('Y-m-d');


        $data = [
            'title' => 'Order List',
            'orders' => Purchase::withTrashed()
            ->select('purchases.*', 'name', 'company_name')
            ->with('orderUser', 'approvedOrderUser', 'storeBranch', 'purchaseUser', 'approvedUser')
            ->leftJoin('suppliers', 'purchases.supplier_id', '=', 'suppliers.id')
            ->where(function ($query) {
                $query->whereRaw('IFNULL(suppliers.name, "") LIKE ?', ['%%'])
                    ->orWhereRaw('IFNULL(suppliers.company_name, "") LIKE ?', ['%%']);
            })
            ->whereNotNull('purchases.order_user_id')
            ->whereBetween('order_date', [$startDate, $endDate])
            ->orderBy('purchases.approve_order_date')
            ->orderBy('purchases.deleted_at')
            ->orderBy('order_date', 'desc')
            ->paginate($perPage)
            ->appends([
                'perPage' => $perPage,
                'searchingText' => $searchingText,
            ]),
            'searchingTextProps' => $searchingText ?? "",
            'startDate' => $startDate,
            'endDate' => $endDate,
        ];

        return Inertia::render("Order/Index", $data);
    }

    public function create(Request $request)
    {
        $newPurchase = Purchase::create([
            'order_user_id' => $request->user()->id,
            'order_number'  => $this->generateOrderNumber(),
            'order_date' => Carbon::now(),
        ]);

        return redirect()->route('order.edit', $newPurchase->id);
    }

    public function edit(Request $request, string $id)
    {
        $searchingText = Request()->input("searchingText");
        $addDetail = Request()->input("addDetail");
        $multiplier = Request()->input("multiplier");
        $perPage = Request()->input("perPage", 10);
        $page = Request()->input('page', 1);

        $order = Purchase::withTrashed()
            ->with(['purchaseDetails' => function ($query) {
                $query->orderBy('updated_at', 'desc');
            }, 'orderUser', 'approvedOrderUser'])
            ->find($id);

        $products = $searchingText ? Stock::getStock($searchingText, $perPage, $page, $order->store_branch_id) : null;
        if ($products && $products->total() == 1 &&  $addDetail) {
            $detail = $order->purchaseDetails->firstWhere('product_id', $products[0]->id);

            if ($detail) {
                $detail->order_quantity += 1;
                $detail->save();
            } else {
                $this->addDetail($request, $id, $products[0]->id);
            }

            return redirect()->to("order/$id/edit");
        } elseif ($multiplier && $order->purchaseDetails) {
            $detail = $order->purchaseDetails[0];
            $detail->order_quantity *= intval($multiplier);

            $detail->save();
        } elseif ($products && $products->total() == 0) {
            return redirect()->to("order/$id/edit")->with("error", "Product tidak ditemukan");
        }

        $data = [
            'title' => 'Edit Order',
            'order' => $order,
            'orderDetails' => PurchaseDetail::with('product', 'product.unit')->where('purchase_id', '=', $id)->orderBy('updated_at', 'desc')->get(),
            'previousUrl' => session()->has('previousUrlOrder') ? session('previousUrlOrder') : "/order",
            'suppliers' => Supplier::get(),
            'products' => $products,
        ];

        return Inertia::render("Order/Form", $data);
    }

    public function update(Request $request, string $id)
    {
        $order = Purchase::withTrashed()->findOrFail($id);
        $approveParameter = Request()->input("approveParameter");
        if ($approveParameter) {
            $order->update([
                'approved_order_user_id' => $request->user()->id,
                'approve_order_date' => Carbon::now()
            ]);

            redirect()->to("order/$order->id/edit")->with("success", 'Data berhasil diapprove.');
        }

        if ($order->deleted_at) {
            $order->restore();

            return back()->with("success", 'Data berhasil dipulihkan');
        }

        $data = $request->validate(
            [
                'supplier_id' => 'required',
                'order_number'  => 'required',
                'order_date' => 'required',
                'order_note' => 'nullable',
            ],
            [
                'supplier_id.required' => 'Supplier wajib diisi.',
            ]
        );

        $data['user_id'] = $request->user()->id;

        $order->update($data);

        return back()->with("success", 'Data berhasil diubah');
    }

    public function destroy(string $id)
    {
        $order = Purchase::withTrashed()->findOrFail($id);

        $deletedAtStatus = $order->deleted_at ? true : false;

        if ($deletedAtStatus) {
            $order->forceDelete();
        } else {
            $order->delete();
        }

        return back()->with("success", 'Data berhasil dihapus' . ($deletedAtStatus ? " SELAMANYA" : ""));
    }

    private function generateOrderNumber()
    {
        $year = Carbon::now()->format('Y');
        $month = Carbon::now()->format('m');

        $lastOrder = Purchase::whereYear('order_date', $year)
                        ->whereMonth('order_date', $month)
                        ->orderBy('id', 'desc')
                        ->first();

        if ($lastOrder) {
            $lastOrderNumber = explode('/', $lastOrder->order_number);
            $lastOrderSequence = (int) end($lastOrderNumber);
            $newOrderSequence = $lastOrderSequence + 1;
        } else {
            $newOrderSequence = 1;
        }

        $newOrderNumber = 'O/' . $year . '/' . $month . '/' . $newOrderSequence;

        return $newOrderNumber;
    }

    private function addDetail(Request $request, $id, $productsId)
    {
        PurchaseDetail::create([
            'purchase_id' => $id,
            'product_id' => $productsId,
            'order_user_id' => $request->user()->id,
            'order_quantity' => 1
        ]);
    }
}
