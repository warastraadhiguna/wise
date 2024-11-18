<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use Inertia\Inertia;
use App\Models\Stock;
use App\Models\Purchase;
use App\Models\Supplier;
use Illuminate\Http\Request;
use App\Models\PaymentStatus;
use App\Models\PurchaseDetail;
use Illuminate\Support\Facades\DB;

class PurchaseController extends Controller
{
    public function index()
    {
        session()->put('previousUrlPurchase', request()->fullUrl());
        $perPage = Request()->input("perPage");
        $perPage ??= 10;

        $searchingText = Request()->input("searchingText");
        $startDate = Request()->input("startDate") ?? Carbon::now()->format('Y-m-d');
        $endDate = Request()->input("endDate") ?? Carbon::now()->format('Y-m-d');

        $paymentMethod = Request()->input("paymentMethod") ?? "";
        $status = Request()->input("status") ?? "";
        $data = [
            'title' => 'Purchase List',
            'purchases' => Purchase::withTrashed()
            ->select('purchases.*', 'name', 'company_name')
            ->addSelect(DB::raw('(SELECT SUM(quantity * (price - discount - (price*discount_percent/100))) FROM purchase_details WHERE purchase_details.purchase_id = purchases.id) as total_amount'))
            ->with('orderUser', 'approvedOrderUser', 'storeBranch', 'purchaseUser', 'approvedUser', 'purchaseDetails', 'purchaseDetails.product', 'purchaseDetails.product.unit', 'supplier', 'paymentStatus')
            ->withSum('purchasePayment', 'amount')
            ->leftJoin('suppliers', 'purchases.supplier_id', '=', 'suppliers.id')
            ->where(function ($query) {
                $query->whereRaw('IFNULL(suppliers.name, "") LIKE ?', ['%%'])
                    ->orWhereRaw('IFNULL(suppliers.company_name, "") LIKE ?', ['%%']);
            })
            ->whereNotNull('purchases.user_id')
            ->whereBetween('purchase_date', [$startDate, $endDate])
            ->when($paymentMethod, function ($query) use ($paymentMethod) {
                return $query->where('payment_status_id', $paymentMethod);
            })
            ->when(!empty($status), function ($query) use ($status) {
                return $status == "approved" ? $query->whereNotNull('approve_purchase_date') : $query->whereNull('approve_purchase_date');
            })
            ->orderByRaw('CASE WHEN purchases.approve_purchase_date IS NULL THEN 0 ELSE 1 END asc')
            ->orderBy('purchases.purchase_date', 'desc')
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
            'paymentMethod' => $paymentMethod,
            'status' => $status,
            'paymentStatuses' => PaymentStatus::orderBy('index')->get(),
        ];

        return Inertia::render("Purchase/Index", $data);
    }

    public function create(Request $request)
    {
        $newPurchase = Purchase::create([
            'user_id' => $request->user()->id,
            'purchase_number'  => $this->generatePurchaseNumber(),
            'purchase_date' => Carbon::now(),
            'payment_status_id' => 1,
        ]);

        return redirect()->route('purchase.edit', $newPurchase->id);
    }

    public function edit(Request $request, string $id)
    {
        $searchingText = Request()->input("searchingText") ?? "";
        $addDetail = Request()->input("addDetail");
        $multiplier = Request()->input("multiplier");
        $perPage = Request()->input("perPage", 10);
        $page = Request()->input('page', 1);

        $purchase = Purchase::withTrashed()
        ->with(['purchaseDetails' => function ($query) {
            $query->orderBy('updated_at', 'desc');
        }, 'orderUser', 'approvedOrderUser', 'purchaseDetails.product', 'purchaseUser', 'approvedUser'])
            ->find($id);

        if (!$purchase->purchase_number) {
            $purchase->update([
                'user_id' => $request->user()->id,
                'purchase_number'  => $this->generatePurchaseNumber(),
                'purchase_date' => Carbon::now(),
                'payment_status_id' => 1,
            ]);
        }

        $purchaseDetail = $purchase->purchaseDetails->firstWhere(function ($purchaseDetail) use ($searchingText) {
            return $purchaseDetail->product &&
                $purchaseDetail->product->code === $searchingText &&
                is_null($purchaseDetail->quantity);
        });

        $products = null;
        if (!$purchaseDetail) {
            $products = $searchingText ? Stock::getStock($searchingText, $perPage, $page, $purchase->store_branch_id) : null;
            if ($products && $products->total() == 1 &&  $addDetail) {
                $detail = $purchase->purchaseDetails->firstWhere('product_id', $products[0]->id);

                if ($detail) {
                    $detail->quantity += 1;
                    $detail->save();
                } else {
                    $this->addDetail($request, $id, $products[0]->id, $products[0]->last_price);
                }

                return redirect()->to("purchase/$id/edit");
            } elseif ($multiplier && $purchase->purchaseDetails) {
                $detail = $purchase->purchaseDetails[0];
                $detail->quantity *= intval($multiplier);

                $detail->save();
            } elseif ($products && $products->total() == 0) {
                return redirect()->to("purchase/$id/edit")->with("error", "Product tidak ditemukan");
            }
        } else {
            $purchaseDetail->quantity = $purchaseDetail->order_quantity;
            $purchaseDetail->price ??= 0;
            $purchaseDetail->discount_percent = 0;
            $purchaseDetail->discount = 0;
            $purchaseDetail->save();
        }

        $data = [
            'title' => 'Edit Purchase',
            'purchase' => $purchase,
            'purchaseDetails' => PurchaseDetail::with('product', 'product.unit')->where('purchase_id', '=', $id)->orderBy('created_at', 'desc')->get(),
            'previousUrl' => session()->has('previousUrlPurchase') ? session('previousUrlPurchase') : "/purchase",
            'suppliers' => Supplier::get(),
            'paymentStatuses' => PaymentStatus::orderBy('index')->get(),
            'products' => $products,
        ];

        return Inertia::render("Purchase/Form", $data);
    }

    public function update(Request $request, string $id)
    {
        $purchase = Purchase::withTrashed()->findOrFail($id);
        $approveParameter = Request()->input("approveParameter");
        if ($approveParameter) {
            $purchase->update([
                'approved_user_id' => $request->user()->id,
                'approve_purchase_date' => Carbon::now()
            ]);

            redirect()->to("purchase/$purchase->id/edit")->with("success", 'Data berhasil diapprove.');
        }

        if ($purchase->deleted_at) {
            $purchase->restore();

            return back()->with("success", 'Data berhasil dipulihkan');
        }

        $data = $request->validate(
            [
                'supplier_id' => 'required',
                'purchase_number'  => 'required',
                'purchase_date' => 'required',
                'purchase_note' => 'nullable',
                'payment_status_id' => 'required',
                'discount'  => 'required|numeric',
                'discount_percent' => 'required|numeric|max:90',
                'ppn'   => 'required|numeric|max:50',
            ],
            [
                'supplier_id.required' => 'Supplier wajib diisi.',
            ]
        );

        $data['user_id'] = $request->user()->id;

        $purchase->update($data);

        return back()->with("success", 'Data berhasil diubah');
    }

    public function destroy(string $id)
    {
        $purchase = Purchase::withTrashed()->findOrFail($id);

        if ($purchase->deleted_at) {
            $purchase->forceDelete();
        } else {
            $purchase->delete();
        }

        return back()->with("success", 'Data berhasil dihapus' . ($purchase->deleted_at ? " SELAMANYA" : ""));
    }

    private function generatePurchaseNumber()
    {
        $year = Carbon::now()->format('Y');
        $month = Carbon::now()->format('m');

        $lastPurchase = Purchase::whereYear('purchase_date', $year)
                        ->whereMonth('purchase_date', $month)
                        ->orderBy('id', 'desc')
                        ->first();

        if ($lastPurchase) {
            $lastPurchaseNumber = explode('/', $lastPurchase->purchase_number);
            $lastPurchaseSequence = (int) end($lastPurchaseNumber);
            $newPurchaseSequence = $lastPurchaseSequence + 1;
        } else {
            $newPurchaseSequence = 1;
        }

        $newPurchaseNumber = 'P/' . $year . '/' . $month . '/' . $newPurchaseSequence;

        return $newPurchaseNumber;
    }

    private function addDetail(Request $request, $id, $productsId, $lastPrice)
    {
        PurchaseDetail::create([
            'purchase_id' => $id,
            'product_id' => $productsId,
            'user_id' => $request->user()->id,
            'quantity' => 1,
            'price' => $lastPrice,
            'discount_percent' => 0,
            'discount' => 0,
        ]);
    }
}
