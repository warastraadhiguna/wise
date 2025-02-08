<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\Distribution;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Exception;

class DistributionReceiptController extends Controller
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
            'title' => 'Distribution Receipt List',
            'distributions' => Distribution::withTrashed()
            ->with('storeBranch', 'user', 'approvedUser', 'receivedUser', 'distributionDetails', 'distributionDetails.product', 'distributionDetails.product.unit')
            ->whereBetween('distribution_date', [$startDate, $endDate])
            ->when($isReceived != "", function ($query) use ($isReceived) {
                return $query->where('is_received', $isReceived);
            })
            ->whereNotNull('approve_date')
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
                'isReceived' =>  $isReceived
            ]),
            'searchingTextProps' => $searchingText ?? "",
            'startDate' => $startDate,
            'endDate' => $endDate,
            'status' => $status,
            'isReceived' =>  $isReceived
        ];

        return Inertia::render("DistributionReceipt/Index", $data);
    }

    public function update(Request $request, string $id)
    {
        $distribution = Distribution::findOrFail($id);

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

            $distribution->update($data);

            DB::commit();

            return back()->with("success", 'Data berhasil diubah');

        } catch (Exception $e) {
            DB::rollback();
            return back()->with("error", 'Data gagal diubah');
        }
    }
}
