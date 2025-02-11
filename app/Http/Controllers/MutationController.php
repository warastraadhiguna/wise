<?php

namespace App\Http\Controllers;

use App\Models\StoreBranch;
use Inertia\Inertia;
use App\Models\Mutation;
use App\Models\MutationDetail;
use Illuminate\Http\Request;
use App\Models\Stock;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Exception;

class MutationController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        session()->put('previousUrlMutation', request()->fullUrl());
        $perPage = Request()->input("perPage");
        $perPage ??= 10;

        $searchingText = Request()->input("searchingText");
        $startDate = Request()->input("startDate") ?? Carbon::now()->format('Y-m-d');
        $endDate = Request()->input("endDate") ?? Carbon::now()->format('Y-m-d');

        $status = Request()->input("status") ?? "";
        $isReceived = Request()->input("isReceived") ?? "";

        $data = [
            'title' => 'Mutation List',
            'mutations' => Mutation::withTrashed()
            ->with('storeBranch', 'user', 'approvedUser', 'receivedUser')
            ->whereBetween('mutation_date', [$startDate, $endDate])
            ->when($isReceived != "", function ($query) use ($isReceived) {
                return $query->where('is_received', $isReceived);
            })
            ->when(!empty($status), function ($query) use ($status) {
                return $status == "approved" ? $query->whereNotNull('approve_date') : $query->whereNull('approve_date');
            })
            ->where('store_branch_id', session('selectedStoreBranchId'))
            ->orderByRaw('CASE WHEN mutations.approve_date IS NULL THEN 0 ELSE 1 END asc')
            ->orderBy('mutations.mutation_date', 'desc')
            ->orderBy('mutations.deleted_at')
            ->paginate($perPage)
            ->appends([
                'perPage' => $perPage,
                'searchingText' => $searchingText,
                'startDate' => $startDate,
                'endDate' => $endDate,
                'status' => $status,
                'isReceived' =>  $isReceived
            ]),
            'searchingTextProps' => $searchingText ?? "",
            'startDate' => $startDate,
            'endDate' => $endDate,
            'status' => $status,
            'isReceived' =>  $isReceived
        ];

        return Inertia::render("Mutation/Index", $data);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(Request $request)
    {
        $newMutation = Mutation::create([
            'user_id' => $request->user()->id,
            'number'  =>  $this->generateMutationNumber(),
            'mutation_date' => Carbon::now(),
            'store_branch_id' => session('selectedStoreBranchId')
        ]);

        return redirect()->route('mutation.edit', $newMutation->id);
    }

    public function edit(string $id, Request $request)
    {
        $searchingText = Request()->input("searchingText") ?? "";
        $addDetail = Request()->input("addDetail");
        $multiplier = Request()->input("multiplier");
        $perPage = Request()->input("perPage", 10);
        $page = Request()->input('page', 1);

        $mutation = Mutation::with(['mutationDetails' => function ($query) {
            $query->orderBy('updated_at', 'desc');
        }, 'mutationDetails.product', 'user', 'approvedUser'])
            ->find($id);

        if (!$mutation->number) {
            $mutation->update([
                'user_id' => $request->user()->id,
                'number'  => $this->generateMutationNumber(),
                'mutation_date' => Carbon::now(),
                'payment_status_id' => 1,
            ]);
        }

        $mutationDetail = $mutation->mutationDetails->firstWhere(function ($mutationDetail) use ($searchingText) {
            return $mutationDetail->product &&
                $mutationDetail->product->code === $searchingText &&
                is_null($mutationDetail->quantity);
        });

        $products = null;
        if (!$mutationDetail) {
            $products = $searchingText ? Stock::getStock($searchingText, session('selectedStoreBranchId'), $perPage, $page) : null;
            if ($products && $products->total() == 1 &&  $addDetail) {
                $detail = $mutation->mutationDetails->firstWhere('product_id', $products[0]->id);

                if ($detail) {
                    $detail->quantity += 1;
                    $detail->save();
                } else {
                    $this->addDetail($request, $id, $products[0]->id, $products[0]->price);
                }

                return redirect()->to("mutation/$id/edit");
            } elseif ($multiplier && $mutation->mutationDetails) {
                $detail = $mutation->mutationDetails[0];
                $detail->quantity *= intval($multiplier);

                $detail->save();
            } elseif ($products && $products->total() == 0) {
                return redirect()->to("mutation/$id/edit")->with("error", "Product tidak ditemukan");
            }
        } else {
            $mutationDetail->quantity = $mutationDetail->order_quantity;
            $mutationDetail->price ??= 0;
            $mutationDetail->discount_percent = 0;
            $mutationDetail->discount = 0;
            $mutationDetail->save();
        }

        $data = [
            'title' => 'Edit Mutation',
            'mutation' => $mutation,
            'mutationDetails' => MutationDetail::with('product', 'product.unit')->where('mutation_id', '=', $id)->orderBy('created_at', 'desc')->get(),
            'previousUrl' => session()->has('previousUrlMutation') ? session('previousUrlMutation') : "/mutation",
            'products' => $products,
        ];

        return Inertia::render("Mutation/Form", $data);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $mutation = Mutation::withTrashed()->with('mutationDetails', 'mutationDetails.product')->findOrFail($id);
        $approveParameter = Request()->input("approveParameter");
        if ($approveParameter) {
            $errorMessage = Stock::checkSufficientStock($mutation->store_branch_id, $mutation->mutationDetails);
            if ($errorMessage) {
                return redirect()->to("mutation/$mutation->id/edit")->with("error", $errorMessage);
            }

            $data['approved_user_id'] = $request->user()->id;
            $data['approve_date'] =  Carbon::now();

            try {

                DB::beginTransaction();

                $mutation->update($data);

                DB::commit();

                return redirect()->to("mutation/$mutation->id/edit")->with("success", 'Data berhasil diapprove.');
            } catch (Exception $e) {
                DB::rollback();
                return redirect()->to("mutation/$mutation->id/edit")->with("error", 'Data gagal diapprove.');
            }

        }

        if ($mutation->deleted_at) {
            $mutation->restore();

            return back()->with("success", 'Data berhasil dipulihkan');
        }

        $data = $request->validate(
            [
                'number'  => 'required',
                'mutation_date' => 'required',
                'note' => 'nullable',
            ]
        );

        $data['user_id'] = $request->user()->id;

        $mutation->update($data);

        return back()->with("success", 'Data berhasil diubah');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $mutation = Mutation::withTrashed()->findOrFail($id);
        $deletedAt = $mutation->deleted_at;
        if ($mutation->deleted_at) {
            $mutation->forceDelete();
        } else {
            $mutation->delete();
        }

        return back()->with("success", 'Data berhasil dihapus' . ($deletedAt ? " SELAMANYA" : ""));
    }

    private function generateMutationNumber()
    {
        $year = Carbon::now()->format('Y');
        $month = Carbon::now()->format('m');

        $lastMutation = Mutation::whereYear('mutation_date', $year)
                        ->whereMonth('mutation_date', $month)
                        ->orderBy('id', 'desc')
                        ->first();

        if ($lastMutation) {
            $lastMutationNumber = explode('/', $lastMutation->number);
            $lastMutationSequence = (int) end($lastMutationNumber);
            $newMutationSequence = $lastMutationSequence + 1;
        } else {
            $newMutationSequence = 1;
        }

        $newMutationNumber = 'D/' . $year . '/' . $month . '/' . $newMutationSequence;

        return $newMutationNumber;
    }

    private function addDetail(Request $request, $id, $productsId, $price)
    {
        MutationDetail::create([
            'mutation_id' => $id,
            'product_id' => $productsId,
            'user_id' => $request->user()->id,
            'quantity' => 1,
            'quantity_copy' => 1,
        ]);
    }
}
