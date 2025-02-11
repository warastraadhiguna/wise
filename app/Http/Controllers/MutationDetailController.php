<?php

namespace App\Http\Controllers;

use App\Models\MutationDetail;
use Illuminate\Http\Request;

class MutationDetailController extends Controller
{
    public function destroy(string $id)
    {
        $mutationDetail = MutationDetail::findOrFail($id);
        $mutationId = $mutationDetail->mutation_id;

        $mutationDetail->delete();

        return redirect()->to("mutation/$mutationId/edit");
    }

    public function update(Request $request, string $id)
    {
        $mutationDetail = MutationDetail::findOrFail($id);
        $mutationId = $mutationDetail->mutation_id;
        $data = $request->validate(
            [
                'quantity' => 'required|numeric'
            ]
        );

        $data['user_id'] = $request->user()->id;

        $mutationDetail->update($data);

        return redirect()->to("mutation/$mutationId/edit");
    }
}
