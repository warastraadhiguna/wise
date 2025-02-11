<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\Mutation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Exception;

class MutationReceiptController extends Controller
{
    public function index()
    {
        $perPage = Request()->input("perPage");
        $perPage ??= 10;

        $searchingText = Request()->input("searchingText");
        $startDate = Request()->input("startDate") ?? Carbon::now()->format('Y-m-d');
        $endDate = Request()->input("endDate") ?? Carbon::now()->format('Y-m-d');

        $status = Request()->input("status") ?? "";
        $isReceived = Request()->input("isReceived") ?? "";

        $data = [
            'title' => 'Mutation Receipt List',
            'mutations' => Mutation::withTrashed()
            ->with('storeBranch', 'user', 'approvedUser', 'receivedUser', 'mutationDetails', 'mutationDetails.product', 'mutationDetails.product.unit')
            ->whereBetween('mutation_date', [$startDate, $endDate])
            ->when($isReceived != "", function ($query) use ($isReceived) {
                return $query->where('is_received', $isReceived);
            })
            ->whereNotNull('approve_date')
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

        return Inertia::render("MutationReceipt/Index", $data);
    }

    public function update(Request $request, string $id)
    {
        $mutation = Mutation::findOrFail($id);

        $data = $request->validate(
            [
                        'is_received' => 'required',
                        'receiption_note' => 'nullable',
                    ]
        );

        try {

            DB::beginTransaction();

            $data['received_user_id'] = $request->user()->id;
            $data['receiption_date'] =  Carbon::now();

            $mutation->update($data);

            DB::commit();

            return back()->with("success", 'Data berhasil diubah');

        } catch (Exception $e) {
            DB::rollback();
            return back()->with("error", 'Data gagal diubah');
        }
    }
}
