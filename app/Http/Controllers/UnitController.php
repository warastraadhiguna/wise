<?php

namespace App\Http\Controllers;

use App\Models\Unit;
use Inertia\Inertia;
use Illuminate\Http\Request;

class UnitController extends Controller
{
    public function index()
    {
        $perPage = Request()->input("perPage");
        $searchingText = Request()->input("searchingText");

        $data = [
            'title' => 'Unit List',
            'units' => Unit::withTrashed()
            ->with('user')
            ->orderBy('deleted_at')
            ->orderBy('name')
            ->where('name', 'LIKE', "%$searchingText%")
            ->orWhere('note', 'LIKE', "%$searchingText%")
            ->paginate($perPage),
            'searchingTextProps' => $searchingText ?? "",
        ];

        return Inertia::render("Unit/Index", $data);
    }

    public function store(Request $request)
    {
        $data = $request->validate(
            [
                'name' => 'required|string',
                'note' => 'nullable|string',
            ],
            [
                'name.required' => 'Name wajib diisi.',
            ]
        );

        $data['user_id'] = $request->user()->id;

        Unit::create($data);
        return back()->with("success", 'Data berhasil disimpan');
    }

    public function update(Request $request, string $id)
    {
        $unit = Unit::withTrashed()->findOrFail($id);
        if($unit->deleted_at) {
            $unit->restore();

            return back()->with("success", 'Data berhasil dipulihkan');
        }


        $data = $request->validate(
            [
                'name' => 'required|string',
                'note' => 'nullable|string',
            ],
            [
                'name.required' => 'Name wajib diisi.',
            ]
        );

        $data['user_id'] = $request->user()->id;

        $unit->update($data);

        return back()->with("success", 'Data berhasil diubah');
    }

    public function destroy(string $id)
    {
        $unit = Unit::withTrashed()->findOrFail($id);

        $deletedAtStatus = $unit->deleted_at ? true : false;

        if ($deletedAtStatus) {
            $unit->forceDelete();
        } else {
            $unit->delete();
        }

        return back()->with("success", 'Data berhasil dihapus' . ($deletedAtStatus ? " SELAMANYA" : ""));
    }
}
