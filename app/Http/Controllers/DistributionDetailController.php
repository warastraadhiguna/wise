<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\DistributionDetail;
use App\Models\Supplier;
use Carbon\Carbon;
use Inertia\Inertia;
use App\Models\Distribution;
use Illuminate\Http\Request;

class DistributionDetailController extends Controller
{
    public function destroy(string $id)
    {
        $distributionDetail = DistributionDetail::findOrFail($id);
        $distributionId = $distributionDetail->distribution_id;

        $distributionDetail->delete();

        return redirect()->to("distribution/$distributionId/edit");
    }

    public function update(Request $request, string $id)
    {
        $distributionDetail = DistributionDetail::findOrFail($id);
        $distributionId = $distributionDetail->distribution_id;
        $data = $request->validate(
            [
                'quantity' => 'required|numeric'
            ]
        );

        $data['user_id'] = $request->user()->id;

        $distributionDetail->update($data);

        return redirect()->to("distribution/$distributionId/edit");
    }
}
