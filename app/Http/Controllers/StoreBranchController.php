<?php

namespace App\Http\Controllers;

use App\Models\StoreBranch;
use Inertia\Inertia;
use Illuminate\Http\Request;

class StoreBranchController extends Controller
{
    public function index()
    {
        $perPage = Request()->input("perPage");
        $perPage ??= 10;

        $searchingText = Request()->input("searchingText");

        $data = [
            'title' => 'Store Branch List',
            'storeBranches' => StoreBranch::withTrashed()
            ->with('user')
            ->orderBy('deleted_at')
            ->orderBy('index')
            ->where('name', 'LIKE', "%$searchingText%")
            ->orWhere('note', 'LIKE', "%$searchingText%")
            ->paginate($perPage)
            ->appends([
                'perPage' => $perPage,
                'searchingText' => $searchingText,
            ]),
            'searchingTextProps' => $searchingText ?? "",
        ];

        return Inertia::render("StoreBranch/Index", $data);
    }

    public function store(Request $request)
    {
        $data = $request->validate(
            [
                'name' => 'required|string',
                'displayed_name' => 'required|string',
                'address' => 'required|string',
                'city' => 'required|string',
                'phone' => 'required|string',
                'email' => 'nullable|string',
                'bank_account' => 'nullable|string',
                'note' => 'nullable|string',
                'minimum_stok' => 'required|numeric',
                'minimum_margin' => 'required|numeric',
                'ppn' => 'required|numeric',
                'pph' => 'required|numeric',
                'ppn_out' => 'required|numeric',
                'ceiling_threshold' => 'required|numeric',
                'footer1' => 'nullable|string',
                'footer2' => 'nullable|string',
                'index' => 'required|numeric',
            ],
            [
                'name.required' => 'Name wajib diisi.',
                'index.required' => 'Index wajib diisi.',
            ]
        );

        $data['user_id'] = $request->user()->id;

        StoreBranch::create($data);
        return back()->with("success", 'Data berhasil disimpan');
    }

    public function update(Request $request, string $id)
    {
        $storeBranch = StoreBranch::withTrashed()->findOrFail($id);
        if ($storeBranch->deleted_at) {
            $storeBranch->restore();

            return back()->with("success", 'Data berhasil dipulihkan');
        }

        $data = $request->validate(
            [
                'name' => 'required|string',
                'displayed_name' => 'required|string',
                'address' => 'required|string',
                'city' => 'required|string',
                'phone' => 'required|string',
                'email' => 'nullable|string',
                'bank_account' => 'nullable|string',
                'note' => 'nullable|string',
                'minimum_stok' => 'required|numeric',
                'minimum_margin' => 'required|numeric',
                'ppn' => 'required|numeric',
                'ppn_out' => 'required|numeric',
                'pph' => 'required|numeric',
                'ceiling_threshold' => 'required|numeric',
                'footer1' => 'nullable|string',
                'footer2' => 'nullable|string',
                'index' => 'required|numeric',
            ],
            [
                'name.required' => 'Name wajib diisi.',
                'index.required' => 'Index wajib diisi.',
            ]
        );
        $data['user_id'] = $request->user()->id;

        $storeBranch->update($data);

        return back()->with("success", 'Data berhasil diubah');
    }

    public function destroy(string $id)
    {
        $storeBranch = StoreBranch::withTrashed()->findOrFail($id);

        $deletedAtStatus = $storeBranch->deleted_at ? true : false;

        if ($deletedAtStatus) {
            $storeBranch->forceDelete();
        } else {
            $storeBranch->delete();
        }

        return back()->with("success", 'Data berhasil dihapus' . ($deletedAtStatus ? " SELAMANYA" : ""));
    }
}