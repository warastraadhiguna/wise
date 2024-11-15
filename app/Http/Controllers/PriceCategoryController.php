<?php

namespace App\Http\Controllers;

use App\Models\PriceCategory;
use Inertia\Inertia;
use Illuminate\Http\Request;

class PriceCategoryController extends Controller
{
    public function index()
    {
        $perPage = Request()->input("perPage");
        $perPage ??= 10;

        $searchingText = Request()->input("searchingText");

        $data = [
            'title' => 'Price Category List',
            'priceCategories' => PriceCategory::withTrashed()
            ->with('user')
            ->orderBy('deleted_at')
            ->orderBy('index')
            ->where('name', 'LIKE', "%$searchingText%")
            ->orWhere('note', 'LIKE', "%$searchingText%")
            ->paginate($perPage)
            ->appends([
                'perPage' => $perPage,
                'searchingText' => $searchingText,
            ])            ,
            'searchingTextProps' => $searchingText ?? "",
        ];

        return Inertia::render("PriceCategory/Index", $data);
    }

    public function store(Request $request)
    {
        $data = $request->validate(
            [
                'name' => 'required|string',
                'note' => 'nullable|string',
                'index' => 'required|integer',
            ],
            [
                'name.required' => 'Name wajib diisi.',
                'index.required' => 'Index wajib diisi.',
            ]
        );

        $data['user_id'] = $request->user()->id;

        PriceCategory::create($data);
        return back()->with("success", 'Data berhasil disimpan');
    }

    public function update(Request $request, string $id)
    {
        $priceCategory = PriceCategory::withTrashed()->findOrFail($id);
        if ($priceCategory->deleted_at) {
            $priceCategory->restore();

            return back()->with("success", 'Data berhasil dipulihkan');
        }


        $data = $request->validate(
            [
                'name' => 'required|string',
                'note' => 'nullable|string',
                'index' => 'required|integer',
            ],
            [
                'name.required' => 'Name wajib diisi.',
                'index.required' => 'Index wajib diisi.',
            ]
        );

        $data['user_id'] = $request->user()->id;

        $priceCategory->update($data);

        return back()->with("success", 'Data berhasil diubah');
    }

    public function destroy(string $id)
    {
        $priceCategory = PriceCategory::withTrashed()->findOrFail($id);

        $deletedAtStatus = $priceCategory->deleted_at ? true : false;

        if ($deletedAtStatus) {
            $priceCategory->forceDelete();
        } else {
            $priceCategory->delete();
        }

        return back()->with("success", 'Data berhasil dihapus' . ($deletedAtStatus ? " SELAMANYA" : ""));
    }
}
