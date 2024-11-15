<?php

namespace App\Http\Controllers;

use App\Models\Brand;
use Inertia\Inertia;
use Illuminate\Http\Request;

class BrandController extends Controller
{
    public function index()
    {
        $perPage = Request()->input("perPage");
        $perPage ??= 10;
        $searchingText = Request()->input("searchingText");

        $data = [
            'title' => 'Brand List',
            'brands' => Brand::withTrashed()
            ->with('user')
            ->orderBy('deleted_at')
            ->orderBy('name')
            ->where('name', 'LIKE', "%$searchingText%")
            ->orWhere('note', 'LIKE', "%$searchingText%")
            ->paginate($perPage)
            ->appends([
                'perPage' => $perPage,
                'searchingText' => $searchingText,
            ]),
            'searchingTextProps' => $searchingText ?? "",
        ];

        return Inertia::render("Brand/Index", $data);
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

        Brand::create($data);
        return back()->with("success", 'Data berhasil disimpan');
    }

    public function update(Request $request, string $id)
    {
        $brand = Brand::withTrashed()->findOrFail($id);
        if ($brand->deleted_at) {
            $brand->restore();

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

        $brand->update($data);

        return back()->with("success", 'Data berhasil diubah');
    }

    public function destroy(string $id)
    {
        $brand = Brand::withTrashed()->findOrFail($id);

        $deletedAtStatus = $brand->deleted_at ? true : false;

        if ($deletedAtStatus) {
            $brand->forceDelete();
        } else {
            $brand->delete();
        }

        return back()->with("success", 'Data berhasil dihapus' . ($deletedAtStatus ? " SELAMANYA" : ""));
    }
}
