<?php

namespace App\Http\Controllers;

use App\Models\StoreBranch;
use Inertia\Inertia;
use App\Models\Distribution;
use App\Models\DistributionDetail;
use Illuminate\Http\Request;
use App\Models\Stock;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Exception;

class DistributionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        session()->put('previousUrlDistribution', request()->fullUrl());
        $perPage = Request()->input("perPage");
        $perPage ??= 10;

        $searchingText = Request()->input("searchingText");
        $startDate = Request()->input("startDate") ?? Carbon::now()->format('Y-m-d');
        $endDate = Request()->input("endDate") ?? Carbon::now()->format('Y-m-d');

        $status = Request()->input("status") ?? "";
        $data = [
            'title' => 'Distribution List',
            'distributions' => Distribution::withTrashed()
            ->with('storeBranch', 'user', 'approvedUser', 'receivedUser')
            ->whereBetween('distribution_date', [$startDate, $endDate])
            ->when(!empty($status), function ($query) use ($status) {
                return $status == "approved" ? $query->whereNotNull('approve_date') : $query->whereNull('approve_date');
            })
            ->orderByRaw('CASE WHEN distributions.approve_date IS NULL THEN 0 ELSE 1 END asc')
            ->orderBy('distributions.distribution_date', 'desc')
            ->orderBy('distributions.deleted_at')
            ->paginate($perPage)
            ->appends([
                'perPage' => $perPage,
                'searchingText' => $searchingText,
                'startDate' => $startDate,
                'endDate' => $endDate,
                'status' => $status,
            ]),
            'searchingTextProps' => $searchingText ?? "",
            'startDate' => $startDate,
            'endDate' => $endDate,
            'status' => $status,
        ];

        return Inertia::render("Distribution/Index", $data);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(Request $request)
    {
        $newDistribution = Distribution::create([
            'user_id' => $request->user()->id,
            'number'  =>  $this->generateDistributionNumber(),
            'distribution_date' => Carbon::now(),
            'payment_status_id' => 1,
        ]);

        return redirect()->route('distribution.edit', $newDistribution->id);
    }

    public function edit(string $id, Request $request)
    {
        $searchingText = Request()->input("searchingText") ?? "";
        $addDetail = Request()->input("addDetail");
        $multiplier = Request()->input("multiplier");
        $perPage = Request()->input("perPage", 10);
        $page = Request()->input('page', 1);

        $distribution = Distribution::with(['distributionDetails' => function ($query) {
            $query->orderBy('updated_at', 'desc');
        }, 'distributionDetails.product', 'user', 'approvedUser'])
            ->find($id);

        if (!$distribution->number) {
            $distribution->update([
                'user_id' => $request->user()->id,
                'number'  => $this->generateDistributionNumber(),
                'distribution_date' => Carbon::now(),
                'payment_status_id' => 1,
            ]);
        }

        $distributionDetail = $distribution->distributionDetails->firstWhere(function ($distributionDetail) use ($searchingText) {
            return $distributionDetail->product &&
                $distributionDetail->product->code === $searchingText &&
                is_null($distributionDetail->quantity);
        });

        $products = null;
        if (!$distributionDetail) {
            $products = $searchingText ? Stock::getStock($searchingText, $perPage, $page) : null;
            if ($products && $products->total() == 1 &&  $addDetail) {
                $detail = $distribution->distributionDetails->firstWhere('product_id', $products[0]->id);

                if ($detail) {
                    $detail->quantity += 1;
                    $detail->save();
                } else {
                    $this->addDetail($request, $id, $products[0]->id, $products[0]->price);
                }

                return redirect()->to("distribution/$id/edit");
            } elseif ($multiplier && $distribution->distributionDetails) {
                $detail = $distribution->distributionDetails[0];
                $detail->quantity *= intval($multiplier);

                $detail->save();
            } elseif ($products && $products->total() == 0) {
                return redirect()->to("distribution/$id/edit")->with("error", "Product tidak ditemukan");
            }
        } else {
            $distributionDetail->quantity = $distributionDetail->order_quantity;
            $distributionDetail->price ??= 0;
            $distributionDetail->discount_percent = 0;
            $distributionDetail->discount = 0;
            $distributionDetail->save();
        }

        $data = [
            'title' => 'Edit Distribution',
            'distribution' => $distribution,
            'distributionDetails' => DistributionDetail::with('product', 'product.unit')->where('distribution_id', '=', $id)->orderBy('created_at', 'desc')->get(),
            'previousUrl' => session()->has('previousUrlDistribution') ? session('previousUrlDistribution') : "/distribution",
            'storeBranchs' => StoreBranch::where("id", "!=", 1)->get(),
            'products' => $products,
        ];

        return Inertia::render("Distribution/Form", $data);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $distribution = Distribution::withTrashed()->findOrFail($id);
        $approveParameter = Request()->input("approveParameter");
        if ($approveParameter) {
            $data['approved_user_id'] = $request->user()->id;
            $data['approve_date'] =  Carbon::now();

            try {

                DB::beginTransaction();

                $distribution->update($data);

                DB::commit();

                return redirect()->to("distribution/$distribution->id/edit")->with("success", 'Data berhasil diapprove.');
            } catch (Exception $e) {
                DB::rollback();
                return redirect()->to("distribution/$distribution->id/edit")->with("error", 'Data gagal diapprove.');
            }

        }

        if ($distribution->deleted_at) {
            $distribution->restore();

            return back()->with("success", 'Data berhasil dipulihkan');
        }

        $data = $request->validate(
            [
                'store_branch_id' => 'required',
                'number'  => 'required',
                'distribution_date' => 'required',
                'note' => 'nullable',
            ]
        );

        $data['user_id'] = $request->user()->id;

        $distribution->update($data);

        return back()->with("success", 'Data berhasil diubah');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $distribution = Distribution::withTrashed()->findOrFail($id);
        $deletedAt = $distribution->deleted_at;
        if ($distribution->deleted_at) {
            $distribution->forceDelete();
        } else {
            $distribution->delete();
        }

        return back()->with("success", 'Data berhasil dihapus' . ($deletedAt ? " SELAMANYA" : ""));
    }

    private function generateDistributionNumber()
    {
        $year = Carbon::now()->format('Y');
        $month = Carbon::now()->format('m');

        $lastDistribution = Distribution::whereYear('distribution_date', $year)
                        ->whereMonth('distribution_date', $month)
                        ->orderBy('id', 'desc')
                        ->first();

        if ($lastDistribution) {
            $lastDistributionNumber = explode('/', $lastDistribution->number);
            $lastDistributionSequence = (int) end($lastDistributionNumber);
            $newDistributionSequence = $lastDistributionSequence + 1;
        } else {
            $newDistributionSequence = 1;
        }

        $newDistributionNumber = 'D/' . $year . '/' . $month . '/' . $newDistributionSequence;

        return $newDistributionNumber;
    }

    private function addDetail(Request $request, $id, $productsId, $price)
    {
        DistributionDetail::create([
            'distribution_id' => $id,
            'product_id' => $productsId,
            'user_id' => $request->user()->id,
            'quantity' => 1,
            'quantity_copy' => 1,
        ]);
    }
}
